/* eslint-disable @typescript-eslint/camelcase */
import { Test, TestingModule } from '@nestjs/testing';
import { AxiosError } from 'axios';
import { Connection } from 'typeorm';
import { PaypalSubscriptionDetails } from './paypal.interfaces';
import { PaypalService } from './paypal.service';
import { SubscriptionEntity } from './subscription.entity';
import { SubscriptionSubscriber } from './subscription.subscriber';

describe('SubscriptionSubscriber', () => {
    let subscriber: SubscriptionSubscriber;
    let connection: Connection;
    let paypal: PaypalService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                SubscriptionSubscriber,
                {
                    provide: Connection,
                    useValue: { subscribers: [] },
                },
                {
                    provide: PaypalService,
                    useValue: {
                        getSubscriptionDetails: jest.fn(),
                    },
                },
            ],
        }).compile();

        subscriber = module.get<SubscriptionSubscriber>(SubscriptionSubscriber);
        connection = module.get<Connection>(Connection);
        paypal = module.get<PaypalService>(PaypalService);
    });

    it('should be defined', () => {
        expect(subscriber).toBeDefined();
    });

    it('should add itself to Connection.subscribers', () => {
        expect(connection.subscribers).toContainEqual(subscriber);
    });

    describe('listenTo', () => {
        it('should return SubscriptionEntity', () => {
            expect(subscriber.listenTo()).toEqual(SubscriptionEntity);
        });
    });

    describe('afterLoad', () => {
        it('should load details', async () => {
            const details: PaypalSubscriptionDetails = {
                id: 'I-BW452GLLEP1G',
                plan_id: 'P-5ML4271244454362WXNWU5NQ',
                start_time: '2020-02-10T07:00:00Z',
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
                        time: '2020-02-09T10:27:20Z',
                    },
                    next_billing_time: '2020-02-10T10:00:00Z',
                    failed_payments_count: 0,
                },
                create_time: '2020-02-09T10:26:04Z',
                update_time: '2020-02-09T10:27:27Z',
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
                status_update_time: '2020-02-09T10:27:27Z',
            };

            jest.spyOn(paypal, 'getSubscriptionDetails').mockResolvedValue(details);

            const sub = new SubscriptionEntity();
            sub.paypalId = 'I-BW452GLLEP1G';

            await subscriber.afterLoad(sub);

            expect(sub.details).toEqual(details);
        });

        it('should set details to null on paypal 404 errors', async () => {
            jest.spyOn(paypal, 'getSubscriptionDetails').mockRejectedValue({
                response: {
                    status: 404,
                },
                isAxiosError: true,
            } as AxiosError);

            const sub = new SubscriptionEntity();
            sub.paypalId = "doesn't exist";

            await subscriber.afterLoad(sub);

            expect(sub.details).toBe(null);
        });

        it("should rethrow an exception if it's not paypal 404", () => {
            const error = new Error('test');

            jest.spyOn(paypal, 'getSubscriptionDetails').mockRejectedValue(error);

            const sub = new SubscriptionEntity();
            sub.paypalId = 'test';

            return expect(subscriber.afterLoad(sub)).rejects.toEqual(error);
        });
    });
});
