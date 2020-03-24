/* eslint-disable @typescript-eslint/ban-ts-ignore,@typescript-eslint/camelcase */
import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { AxiosRequestConfig } from 'axios';
import { PaypalService } from './paypal.service';
import nock = require('nock');

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
                .matchHeader('Authorization', 'Basic aWQ6c2VjcmV0')
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

        describe('createSubscription', () => {
            it('should return the field id, status and links with prefer=minimal', async () => {
                const returnObject = {
                    id: 'I-BW452GLLEP1G',
                    status: 'APPROVAL_PENDING',
                    links: [
                        {
                            href: 'https://www.paypal.com/webapps/billing/subscriptions?ba_token=BA-2M539689T3856352J',
                            rel: 'approve',
                            method: 'GET',
                        },
                        {
                            href: 'https://api.paypal.com/v1/billing/subscriptions/I-BW452GLLEP1G',
                            rel: 'edit',
                            method: 'PATCH',
                        },
                        {
                            href: 'https://api.paypal.com/v1/billing/subscriptions/I-BW452GLLEP1G',
                            rel: 'self',
                            method: 'GET',
                        },
                    ],
                };

                nock('https://api.sandbox.paypal.com')
                    .post('/v1/billing/subscriptions', { plan_id: 'P-5ML4271244454362WXNWU5NQ' })
                    .matchHeader('Content-Type', 'application/json')
                    .matchHeader('Authorization', 'Bearer 123abc')
                    .matchHeader('Prefer', 'return=minimal')
                    .reply(201, returnObject);

                const sub = await service.createSubscription({
                    plan_id: 'P-5ML4271244454362WXNWU5NQ',
                });

                expect(sub).toEqual(returnObject);
            });

            it('should send a request with PayPal-Request-Id if provided', async () => {
                const returnObject = {
                    id: 'I-BW452GLLEP1G',
                    status: 'APPROVAL_PENDING',
                    links: [
                        {
                            href: 'https://www.paypal.com/webapps/billing/subscriptions?ba_token=BA-2M539689T3856352J',
                            rel: 'approve',
                            method: 'GET',
                        },
                        {
                            href: 'https://api.paypal.com/v1/billing/subscriptions/I-BW452GLLEP1G',
                            rel: 'edit',
                            method: 'PATCH',
                        },
                        {
                            href: 'https://api.paypal.com/v1/billing/subscriptions/I-BW452GLLEP1G',
                            rel: 'self',
                            method: 'GET',
                        },
                    ],
                };

                nock('https://api.sandbox.paypal.com')
                    .post('/v1/billing/subscriptions', { plan_id: 'P-5ML4271244454362WXNWU5NQ' })
                    .matchHeader('Content-Type', 'application/json')
                    .matchHeader('Authorization', 'Bearer 123abc')
                    .matchHeader('Prefer', 'return=minimal')
                    .matchHeader('PayPal-Request-Id', 'test-key')
                    .reply(201, returnObject);

                const sub = await service.createSubscription(
                    {
                        plan_id: 'P-5ML4271244454362WXNWU5NQ',
                    },
                    'minimal',
                    'test-key'
                );

                expect(sub).toEqual(returnObject);
            });

            it('should return the full subscription object with prefer=representation', async () => {
                const returnObject = {
                    id: 'I-BW452GLLEP1G',
                    status: 'APPROVAL_PENDING',
                    status_update_time: '2018-12-10T21:20:49Z',
                    plan_id: 'P-5ML4271244454362WXNWU5NQ',
                    start_time: '2018-11-01T00:00:00Z',
                    quantity: '20',
                    shipping_amount: {
                        currency_code: 'USD',
                        value: '10.00',
                    },
                    subscriber: {
                        name: {
                            given_name: 'John',
                            surname: 'Doe',
                        },
                        email_address: 'customer@example.com',
                        payer_id: '2J6QB8YJQSJRJ',
                        shipping_address: {
                            name: {
                                full_name: 'John Doe',
                            },
                            address: {
                                address_line_1: '2211 N First Street',
                                address_line_2: 'Building 17',
                                admin_area_2: 'San Jose',
                                admin_area_1: 'CA',
                                postal_code: '95131',
                                country_code: 'US',
                            },
                        },
                    },
                    create_time: '2018-12-10T21:20:49Z',
                    links: [
                        {
                            href: 'https://www.paypal.com/webapps/billing/subscriptions?ba_token=BA-2M539689T3856352J',
                            rel: 'approve',
                            method: 'GET',
                        },
                        {
                            href: 'https://api.paypal.com/v1/billing/subscriptions/I-BW452GLLEP1G',
                            rel: 'edit',
                            method: 'PATCH',
                        },
                        {
                            href: 'https://api.paypal.com/v1/billing/subscriptions/I-BW452GLLEP1G',
                            rel: 'self',
                            method: 'GET',
                        },
                    ],
                };

                nock('https://api.sandbox.paypal.com')
                    .post('/v1/billing/subscriptions', { plan_id: 'P-5ML4271244454362WXNWU5NQ' })
                    .matchHeader('Content-Type', 'application/json')
                    .matchHeader('Authorization', 'Bearer 123abc')
                    .matchHeader('Prefer', 'return=representation')
                    .reply(201, returnObject);

                const sub = await service.createSubscription(
                    {
                        plan_id: 'P-5ML4271244454362WXNWU5NQ',
                    },
                    'representation'
                );

                expect(sub).toEqual(returnObject);
            });
        });

        describe('getSubscriptionDetails', () => {
            it('should return the partial subscription object if fields are provided', async () => {
                const returnObject = {
                    id: 'I-BW452GLLEP1G',
                    plan_id: 'P-5ML4271244454362WXNWU5NQ',
                    start_time: '2019-04-10T07:00:00Z',
                    quantity: '20',
                    status: 'ACTIVE',
                };

                nock('https://api.sandbox.paypal.com')
                    .get(
                        '/v1/billing/subscriptions/I-BW452GLLEP1G?fields[]=id&fields[]=plan_id&fields[]=start_time&fields[]=quantity&fields[]=status'
                    )
                    .matchHeader('Content-Type', 'application/json')
                    .matchHeader('Authorization', 'Bearer 123abc')
                    .reply(200, returnObject);

                const sub = await service.getSubscriptionDetails('I-BW452GLLEP1G', [
                    'id',
                    'plan_id',
                    'start_time',
                    'quantity',
                    'status',
                ]);

                expect(sub).toEqual(returnObject);
            });

            it('should return the full subscription object if no fields are provided', async () => {
                const returnObject = {
                    id: 'I-BW452GLLEP1G',
                    plan_id: 'P-5ML4271244454362WXNWU5NQ',
                    start_time: '2019-04-10T07:00:00Z',
                    quantity: '20',
                    shipping_amount: {
                        currency_code: 'USD',
                        value: '10.0',
                    },
                    subscriber: {
                        shipping_address: {
                            name: {
                                full_name: 'John Doe',
                            },
                            address: {
                                address_line_1: '2211 N First Street',
                                address_line_2: 'Building 17',
                                admin_area_2: 'San Jose',
                                admin_area_1: 'CA',
                                postal_code: '95131',
                                country_code: 'US',
                            },
                        },
                        name: {
                            given_name: 'John',
                            surname: 'Doe',
                        },
                        email_address: 'customer@example.com',
                        payer_id: '2J6QB8YJQSJRJ',
                    },
                    billing_info: {
                        outstanding_balance: {
                            currency_code: 'USD',
                            value: '1.0',
                        },
                        cycle_executions: [
                            {
                                tenure_type: 'TRIAL',
                                sequence: 1,
                                cycles_completed: 0,
                                cycles_remaining: 1,
                                total_cycles: 1,
                            },
                            {
                                tenure_type: 'REGULAR',
                                sequence: 2,
                                cycles_completed: 0,
                                cycles_remaining: 12,
                                total_cycles: 12,
                            },
                        ],
                        last_payment: {
                            amount: {
                                currency_code: 'USD',
                                value: '1.15',
                            },
                            time: '2019-04-09T10:27:20Z',
                        },
                        next_billing_time: '2019-04-10T10:00:00Z',
                        failed_payments_count: 0,
                    },
                    create_time: '2019-04-09T10:26:04Z',
                    update_time: '2019-04-09T10:27:27Z',
                    links: [
                        {
                            href: 'https://api.paypal.com/v1/billing/subscriptions/I-BW452GLLEP1G/cancel',
                            rel: 'cancel',
                            method: 'POST',
                        },
                        {
                            href: 'https://api.paypal.com/v1/billing/subscriptions/I-BW452GLLEP1G',
                            rel: 'edit',
                            method: 'PATCH',
                        },
                        {
                            href: 'https://api.paypal.com/v1/billing/subscriptions/I-BW452GLLEP1G',
                            rel: 'self',
                            method: 'GET',
                        },
                        {
                            href: 'https://api.paypal.com/v1/billing/subscriptions/I-BW452GLLEP1G/suspend',
                            rel: 'suspend',
                            method: 'POST',
                        },
                        {
                            href: 'https://api.paypal.com/v1/billing/subscriptions/I-BW452GLLEP1G/capture',
                            rel: 'capture',
                            method: 'POST',
                        },
                    ],
                    status: 'ACTIVE',
                    status_update_time: '2019-04-09T10:27:27Z',
                };

                nock('https://api.sandbox.paypal.com')
                    .get('/v1/billing/subscriptions/I-BW452GLLEP1G')
                    .matchHeader('Content-Type', 'application/json')
                    .matchHeader('Authorization', 'Bearer 123abc')
                    .reply(200, returnObject);

                const sub = await service.getSubscriptionDetails('I-BW452GLLEP1G');

                expect(sub).toEqual(returnObject);
            });
        });

        describe('activateSubscription', () => {
            it('should send a request to the activate api with reason', async () => {
                nock('https://api.sandbox.paypal.com')
                    .post('/v1/billing/subscriptions/I-BW452GLLEP1G/activate', {
                        reason: 'test',
                    })
                    .matchHeader('Content-Type', 'application/json')
                    .matchHeader('Authorization', 'Bearer 123abc')
                    .reply(204);

                await service.activateSubscription('I-BW452GLLEP1G', 'test');
            });

            it('should send a request to the activate api with no reason', async () => {
                nock('https://api.sandbox.paypal.com')
                    .post('/v1/billing/subscriptions/I-BW452GLLEP1G/activate')
                    .matchHeader('Content-Type', 'application/json')
                    .matchHeader('Authorization', 'Bearer 123abc')
                    .reply(204);

                await service.activateSubscription('I-BW452GLLEP1G');
            });
        });

        describe('cancelSubscription', () => {
            it('should send a request to the cancel api', async () => {
                nock('https://api.sandbox.paypal.com')
                    .post('/v1/billing/subscriptions/I-BW452GLLEP1G/cancel', {
                        reason: 'Not satisfied with the service',
                    })
                    .matchHeader('Content-Type', 'application/json')
                    .matchHeader('Authorization', 'Bearer 123abc')
                    .reply(204);

                await service.cancelSubscription('I-BW452GLLEP1G', 'Not satisfied with the service');
            });
        });
    });
});
