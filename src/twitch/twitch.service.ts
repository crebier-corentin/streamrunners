import CacheService from '../utils/CacheService';
import { Semaphore } from '../utils/Semaphore';
import { sleep } from '../utils/utils';
import { TwitchResponse, TwitchUser } from './twitch.interfaces';
import { Injectable, Scope } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';
import * as moment from 'moment';

@Injectable({ scope: Scope.DEFAULT })
export class TwitchService {
    private readonly clientId: string = process.env.TWITCH_CLIENT_ID;

    private remaining = 30;
    private reset: moment.Moment = moment().add(1, 'minute');
    private readonly lock = new Semaphore(1);

    private readonly cache = new CacheService(120);

    constructor(config: ConfigService) {
        this.clientId = config.get('TWITCH_CLIENT_ID');
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

            //Add client Id
            request.headers = { ...request.headers, ...{ 'Client-ID': this.clientId } };

            const res = await axios.request(request);

            //Update ratelimit properties
            this.remaining = Number(res.headers['ratelimit-remaining']);
            this.reset = moment.unix(Number(res.headers['ratelimit-reset']));

            return res;
        } finally {
            this.lock.release();
        }
    }

    public async isStreamOnline(twitchId: string): Promise<boolean> {
        return await this.cache.get(twitchId, async () => {
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
