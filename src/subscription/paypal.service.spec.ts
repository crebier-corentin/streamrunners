/* eslint-disable @typescript-eslint/ban-ts-ignore,@typescript-eslint/camelcase */
import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { PaypalService } from './paypal.service';
import nock = require('nock');
import { AxiosRequestConfig } from 'axios';

describe('PaypalService', () => {
    describe('baseUrl', () => {
        it('should be set to https://api.paypal.com if PAYPAL_LIVE is true', () => {
            const mockedConfig = {
                get: jest.fn((key: string) => {
                    switch (key) {
                        case 'PAYPAL_CLIENT_ID':
                            return 'id';
                        case 'PAYPAL_SECRET':
                            return 'secret';
                        case 'PAYPAL_LIVE':
                            return 'true';
                    }
                }),
            };

            // @ts-ignore
            const service = new PaypalService(mockedConfig);

            expect(service.baseUrl).toBe('https://api.paypal.com');
        });

        it('should be set to https://api.sandbox.paypal.com if PAYPAL_LIVE is not true', () => {
            const mockedConfig = {
                get: jest.fn((key: string) => {
                    switch (key) {
                        case 'PAYPAL_CLIENT_ID':
                            return 'id';
                        case 'PAYPAL_SECRET':
                            return 'secret';
                        case 'PAYPAL_LIVE':
                            return 'false';
                    }
                }),
            };

            // @ts-ignore
            const service = new PaypalService(mockedConfig);

            expect(service.baseUrl).toBe('https://api.sandbox.paypal.com');
        });
    });

    describe('methods', () => {
        let service: PaypalService;

        beforeEach(async () => {
            const module: TestingModule = await Test.createTestingModule({
                providers: [
                    PaypalService,
                    {
                        provide: ConfigService,
                        useValue: {
                            get: jest.fn((key: string) => {
                                switch (key) {
                                    case 'PAYPAL_CLIENT_ID':
                                        return 'id';
                                    case 'PAYPAL_SECRET':
                                        return 'secret';
                                    case 'PAYPAL_LIVE':
                                        return 'false';
                                }
                            }),
                        },
                    },
                ],
            }).compile();

            service = module.get<PaypalService>(PaypalService);

            //Bearer token nock
            nock('https://api.sandbox.paypal.com')
                .post('/v1/oauth2/token', { grant_type: 'client_credentials' })
                .matchHeader('Authorization', 'Basic id:secret')
                .reply(200, {
                    scope: 'scope',
                    access_token: '123abc',
                    token_type: 'Bearer',
                    app_id: 'APP-80W284485P519543T',
                    expires_in: 999999999,
                    nonce: 'nonce',
                });
        });

        it('should be defined', () => {
            expect(service).toBeDefined();
        });

        describe('makeRequest', () => {
            it('should add the Authorization Bearer and Content-Type headers', async () => {
                nock('https://api.sandbox.paypal.com')
                    .get('/something')
                    .matchHeader('Content-Type', 'application/json')
                    .matchHeader('Authorization', 'Bearer 123abc')
                    .reply(200);

                const request: AxiosRequestConfig = {
                    url: 'https://api.sandbox.paypal.com/something',
                    method: 'GET',
                };

                // @ts-ignore
                const response = await service.makeRequest(request);

                expect(response.status).toBe(200);
            });
        });
    });
});
