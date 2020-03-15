/* eslint-disable @typescript-eslint/camelcase */
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';
import * as moment from 'moment';
import { Semaphore } from '../common/utils/semaphore';
import { PaypalOauthTokenResponse } from './paypal.interfaces';

@Injectable()
export class PaypalService {
    private readonly baseUrl: string;

    private readonly clientId: string;
    private readonly secret: string;

    private bearerToken: string;
    private tokenExpireDate: moment.Moment = moment();

    private readonly lock = new Semaphore(1);

    public constructor(config: ConfigService) {
        this.clientId = config.get('PAYPAL_CLIENT_ID');
        this.secret = config.get('PAYPAL_SECRET');

        if (config.get('PAYPAL_LIVE') === 'true') {
            this.baseUrl = 'https://api.paypal.com';
        } else {
            this.baseUrl = 'https://api.sandbox.paypal.com';
        }
    }

    private async refreshToken(): Promise<void> {
        const response = await axios.post<PaypalOauthTokenResponse>(
            `${this.baseUrl}/v1/oauth2/token`,
            { grant_type: 'client_credentials' },
            {
                headers: {
                    Authorization: `Basic ${this.clientId}:${this.secret}`,
                },
            }
        );

        this.bearerToken = response.data.access_token;
        this.tokenExpireDate = moment().add(response.data.expires_in - 5, 'seconds'); //5 seconds leeway
    }

    private async makeRequest<T = any>(request: AxiosRequestConfig): Promise<AxiosResponse<T>> {
        await this.lock.acquire();

        try {
            //Check token expiration
            if (moment() >= this.tokenExpireDate) {
                await this.refreshToken();
            }

            //Add Authorization and Content-Type
            request.headers = {
                ...request.headers,
                ...{
                    Authorization: `Bearer ${this.bearerToken}`,
                    'Content-Type': 'application/json',
                },
            };

            return await axios.request(request);
        } finally {
            this.lock.release();
        }
    }
}
