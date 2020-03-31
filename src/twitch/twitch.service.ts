/* eslint-disable @typescript-eslint/camelcase */
import { Injectable, Scope } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';
import * as moment from 'moment';
import CacheService from '../common/utils/cache-service';
import { Semaphore } from '../common/utils/semaphore';
import { sleep } from '../shared/shared-utils';
import { PaypalOauthTokenResponse } from '../subscription/paypal.interfaces';
import { TwitchResponse, TwitchUser } from './twitch.interfaces';

@Injectable({ scope: Scope.DEFAULT })
export class TwitchService {
    private readonly clientId: string;
    private readonly clientSecret: string;

    private remaining = 30;
    private reset: moment.Moment = moment().add(1, 'minute');

    private bearerToken: string;
    private tokenExpireDate: moment.Moment = moment();

    private readonly lock = new Semaphore(1);
    private readonly cache = new CacheService(120);

    public constructor(config: ConfigService) {
        this.clientId = config.get('TWITCH_CLIENT_ID');
        this.clientSecret = config.get('TWITCH_CLIENT_SECRET');
    }

    private async refreshToken(): Promise<void> {
        const response = await axios.post<PaypalOauthTokenResponse>(
            'https://id.twitch.tv/oauth2/token',
            { client_id: this.clientId, client_secret: this.clientSecret, grant_type: 'client_credentials' },
            {
                //To x-www-form-urlencoded
                transformRequest: (jsonData: { [key: string]: string }) =>
                    Object.entries(jsonData)
                        .map(x => `${encodeURIComponent(x[0])}=${encodeURIComponent(x[1])}`)
                        .join('&'),
            }
        );

        this.bearerToken = response.data.access_token;
        this.tokenExpireDate = moment().add(response.data.expires_in - 5, 'seconds'); //5 seconds leeway
    }

    private async makeRequest<T = any>(request: AxiosRequestConfig): Promise<AxiosResponse<TwitchResponse<T>>> {
        await this.lock.acquire();

        try {
            //Check rate limit
            if (this.remaining === 0) {
                //Wait for refill
                const timeToReset = this.reset.diff(moment());
                await sleep(Math.max(timeToReset, 0));
            }

            //Check token expiration
            if (moment() >= this.tokenExpireDate) {
                await this.refreshToken();
            }

            //Add client Id
            request.headers = { ...request.headers, ...{ Authorization: `Bearer ${this.bearerToken}` } };

            const res = await axios.request(request);

            //Update ratelimit properties
            this.remaining = Number(res.headers['ratelimit-remaining']);
            this.reset = moment.unix(Number(res.headers['ratelimit-reset']));

            return res;
        } finally {
            this.lock.release();
        }
    }

    public isStreamOnline(twitchId: string): Promise<boolean> {
        return this.cache.get(twitchId, async () => {
            const request: AxiosRequestConfig = {
                method: 'GET',
                url: 'https://api.twitch.tv/helix/streams',
                // eslint-disable-next-line @typescript-eslint/camelcase
                params: { user_id: twitchId },
            };

            const res = await this.makeRequest(request);
            return res.data.data.length > 0;
        });
    }

    public getUsers(ids: string[]): Promise<AxiosResponse<TwitchResponse<TwitchUser>>> {
        const request: AxiosRequestConfig = {
            method: 'GET',
            url: 'https://api.twitch.tv/helix/users',
            params: { id: ids },
        };

        return this.makeRequest<TwitchUser>(request);
    }
}
