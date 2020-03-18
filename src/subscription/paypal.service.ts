/* eslint-disable @typescript-eslint/camelcase */
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';
import * as moment from 'moment';
import { Semaphore } from '../common/utils/semaphore';
import { PaypalOauthTokenResponse, PaypalSubscriptionCreate, PaypalSubscriptionDetails } from './paypal.interfaces';

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

    //prettier-ignore
    public async createSubscription(data: PaypalSubscriptionCreate): Promise<Pick<PaypalSubscriptionDetails, 'id' | 'status' | 'links'>>;
    //prettier-ignore
    public async createSubscription(data: PaypalSubscriptionCreate, prefer: 'minimal'): Promise<Pick<PaypalSubscriptionDetails, 'id' | 'status' | 'links'>>;
    //prettier-ignore
    public async createSubscription(data: PaypalSubscriptionCreate, prefer: 'representation'): Promise<PaypalSubscriptionDetails>;
    //prettier-ignore
    public async createSubscription(
        data: PaypalSubscriptionCreate,
        prefer: 'minimal' | 'representation' = 'minimal',
    ): Promise<Pick<PaypalSubscriptionDetails, 'id' | 'status' | 'links'> | PaypalSubscriptionDetails> {

        const request: AxiosRequestConfig = {
            url: `${this.baseUrl}/v1/billing/subscriptions`,
            method: 'POST',
            data,
            headers: {
                Prefer: `return=${prefer}`,
            },
        };

        const response = await this.makeRequest(request);
        return response.data;
    }

    //prettier-ignore
    public async getSubscriptionDetails(subscriptionId: string): Promise<PaypalSubscriptionDetails>;
    //prettier-ignore
    public async getSubscriptionDetails<K extends keyof PaypalSubscriptionDetails>(subscriptionId: string, fields: K[]): Promise<Pick<PaypalSubscriptionDetails, K>>;
    //prettier-ignore
    public async getSubscriptionDetails<K extends keyof PaypalSubscriptionDetails>(subscriptionId: string, fields?: K[]): Promise<PaypalSubscriptionDetails | Pick<PaypalSubscriptionDetails, K>> {
        const request: AxiosRequestConfig = {
            url: `${this.baseUrl}/v1/billing/subscriptions/${subscriptionId}`,
            method: 'GET',
        };

        if (fields != undefined) {
            request.params = { fields };
        }

        const response = await this.makeRequest(request);

        return response.data;
    }

    public async activateSubscription(subscriptionId: string, reason?: string): Promise<void> {
        let data = {};
        if (reason != undefined) {
            data = { reason };
        }

        const request: AxiosRequestConfig = {
            url: `${this.baseUrl}/v1/billing/subscriptions/${subscriptionId}/activate`,
            method: 'POST',
            data,
        };

        await this.makeRequest(request);
    }

    public async cancelSubscription(subscriptionId: string, reason: string): Promise<void> {
        const request: AxiosRequestConfig = {
            url: `${this.baseUrl}/v1/billing/subscriptions/${subscriptionId}/cancel`,
            method: 'POST',
            data: { reason },
        };

        await this.makeRequest(request);
    }
}
