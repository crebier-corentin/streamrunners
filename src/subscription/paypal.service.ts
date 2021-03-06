/* eslint-disable @typescript-eslint/camelcase */
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';
import * as moment from 'moment';
import { Semaphore } from '../common/utils/semaphore';
import { PaypalOauthTokenResponse, PaypalSubscriptionCreate, PaypalSubscriptionDetails } from './paypal.interfaces';

/**
 * Service used to send request to paypal's API.
 *
 * @category Service
 */
@Injectable()
export class PaypalService {
    private readonly baseUrl: string;

    private readonly basicAuthToken: string;

    private bearerToken: string;
    private tokenExpireDate: moment.Moment = moment();

    private readonly lock = new Semaphore(1);

    public constructor(config: ConfigService) {
        this.basicAuthToken = Buffer.from(`${config.get('PAYPAL_CLIENT_ID')}:${config.get('PAYPAL_SECRET')}`).toString(
            'base64'
        );

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
                    Authorization: `Basic ${this.basicAuthToken}`,
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
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

    /**
     * [https://developer.paypal.com/docs/api/subscriptions/v1/#subscriptions_create](https://developer.paypal.com/docs/api/subscriptions/v1/#subscriptions_create)
     * @param data
     */
    //prettier-ignore
    public async createSubscription(data: PaypalSubscriptionCreate): Promise<Pick<PaypalSubscriptionDetails, 'id' | 'status' | 'links'>>;
    //prettier-ignore
    public async createSubscription(data: PaypalSubscriptionCreate, prefer: 'minimal', paypalRequestId?: string): Promise<Pick<PaypalSubscriptionDetails, 'id' | 'status' | 'links'>>;
    //prettier-ignore
    public async createSubscription(data: PaypalSubscriptionCreate, prefer: 'representation', paypalRequestId?: string): Promise<PaypalSubscriptionDetails>;
    //prettier-ignore
    public async createSubscription(
        data: PaypalSubscriptionCreate,
        prefer: 'minimal' | 'representation' = 'minimal',
        paypalRequestId?: string,
    ): Promise<Pick<PaypalSubscriptionDetails, 'id' | 'status' | 'links'> | PaypalSubscriptionDetails> {

        const headers = {
            Prefer: `return=${prefer}`,
        };

        if (paypalRequestId != undefined) {
            headers['PayPal-Request-Id'] = paypalRequestId;
        }

        const request: AxiosRequestConfig = {
            url: `${this.baseUrl}/v1/billing/subscriptions`,
            method: 'POST',
            data,
            headers,
        };

        const response = await this.makeRequest(request);
        return response.data;
    }

    /**
     * [https://developer.paypal.com/docs/api/subscriptions/v1/#subscriptions_get](https://developer.paypal.com/docs/api/subscriptions/v1/#subscriptions_get)
     *
     * @param subscriptionId The paypal id of the subscription. (Most likely [[SubscriptionEntity.paypalId]].)
     */
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

    /**
     * [https://developer.paypal.com/docs/api/subscriptions/v1/#subscriptions_activate](https://developer.paypal.com/docs/api/subscriptions/v1/#subscriptions_activate)
     *
     * @param subscriptionId The paypal id of the subscription. (Most likely [[SubscriptionEntity.paypalId]].)
     * @param reason Reason for activating the subscription (can be empty).
     */
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

    /**
     *
     * [https://developer.paypal.com/docs/api/subscriptions/v1/#subscriptions_cancel](https://developer.paypal.com/docs/api/subscriptions/v1/#subscriptions_cancel)
     *
     * @param subscriptionId The paypal id of the subscription. (Most likely [[SubscriptionEntity.paypalId]].)
     * @param reason Reason for cancelling the subscription (can be empty).
     */
    public async cancelSubscription(subscriptionId: string, reason: string): Promise<void> {
        const request: AxiosRequestConfig = {
            url: `${this.baseUrl}/v1/billing/subscriptions/${subscriptionId}/cancel`,
            method: 'POST',
            data: { reason },
        };

        await this.makeRequest(request);
    }
}
