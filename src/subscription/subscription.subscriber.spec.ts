/* eslint-disable @typescript-eslint/camelcase,@typescript-eslint/ban-ts-ignore */
import { Test, TestingModule } from '@nestjs/testing';
import { AxiosError } from 'axios';
import MockDate = require('mockdate');
import { Connection, EntityManager } from 'typeorm';
import { UserEntity } from '../user/user.entity';
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

        MockDate.reset();
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
        let manager: EntityManager;
        const update = jest.fn().mockReturnThis();
        const deleteFunc = jest.fn().mockReturnThis();
        const relation = jest.fn().mockReturnThis();

        const originalConsoleError = console.error;

        beforeEach(() => {
            manager = {
                createQueryBuilder: jest.fn().mockReturnThis(),
                getRepository: jest.fn().mockReturnThis(),
                where: jest.fn().mockReturnThis(),
                set: jest.fn().mockReturnThis(),
                callListeners: jest.fn().mockReturnThis(),
                execute: jest.fn().mockReturnThis(),
                of: jest.fn().mockReturnThis(),
                update,
                delete: deleteFunc,
                relation,
            } as any;

            console.error = jest.fn();
        });

        afterEach(() => {
            console.error = originalConsoleError;
        });

        it('should load isActive', async () => {
            const sub = new SubscriptionEntity();
            sub.paypalId = 'I-BW452GLLEP1G';
            sub.lastDetailsUpdate = new Date('2020-01-01 12:00:00');
            sub.details = {
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

            MockDate.set('2020-01-01 12:00:01');

            await subscriber.afterLoad(sub, { manager } as any);

            expect(sub.isActive).toEqual(true);
        });

        it("should update details from paypal if it's been more than an hour since lastDetailsUpdate", async () => {
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
            jest.spyOn(paypal, 'getSubscriptionDetails').mockReturnValue(details as any);

            const sub = new SubscriptionEntity();
            sub.paypalId = 'I-BW452GLLEP1G';
            sub.lastDetailsUpdate = new Date('2020-01-01 12:00:00');
            sub.details = null;

            MockDate.set('2020-01-01 14:00:00');

            await subscriber.afterLoad(sub, { manager } as any);

            expect(update).toHaveBeenCalled();
            expect(sub.details).toEqual(details);
            expect(sub.lastDetailsUpdate).toEqual(new Date('2020-01-01 14:00:00'));
        });

        it('should set details to null, set isActive to false and remove from the database on paypal 404 errors', async () => {
            jest.spyOn(paypal, 'getSubscriptionDetails').mockRejectedValue({
                response: {
                    status: 404,
                },
                isAxiosError: true,
            } as AxiosError);

            const sub = new SubscriptionEntity();
            sub.paypalId = "doesn't exist";
            sub.lastDetailsUpdate = new Date('2020-01-01 12:00:00');

            MockDate.set('2020-01-01 14:00:00');

            await subscriber.afterLoad(sub, { manager } as any);

            expect(sub.details).toBeNull();
            expect(sub.isActive).toBe(false);
            expect(deleteFunc).toHaveBeenCalled();
        });

        it('should set currentUser to null and update if the subscription is not active or APPROVAL_PENDING', async () => {
            const user = new UserEntity();
            user.id = 1;

            const sub = new SubscriptionEntity();
            sub.currentUser = user;
            sub.paypalId = 'I-BW452GLLEP1G';
            sub.details = {
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
                        time: '2019-02-09T10:27:20Z',
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
                status: 'CANCELLED',
                status_update_time: '2020-02-09T10:27:27Z',
            };
            sub.lastDetailsUpdate = new Date('2020-01-01 12:00:00');

            MockDate.set('2020-01-01 12:00:01');

            await subscriber.afterLoad(sub, { manager } as any);

            expect(relation).toHaveBeenCalled();
        });

        it("should log an exception if it's not paypal 404", async () => {
            const error = new Error('test');

            jest.spyOn(paypal, 'getSubscriptionDetails').mockRejectedValue(error);

            const sub = new SubscriptionEntity();
            sub.paypalId = 'test';
            sub.lastDetailsUpdate = new Date('2020-01-01 12:00:00');

            MockDate.set('2020-01-01 14:00:00');

            await subscriber.afterLoad(sub, { manager } as any);
            expect(jest.spyOn(console, 'error')).toHaveBeenCalledWith(error);
        });
    });

    describe('isActive', () => {
        let sub: SubscriptionEntity;

        beforeEach(() => {
            sub = new SubscriptionEntity();
        });

        it('should return false if details is null', () => {
            sub.details = null;

            // @ts-ignore
            expect(SubscriptionSubscriber.isActive(sub)).toBe(false);
        });

        it('should return true if the status is ACTIVE', () => {
            sub.details = {
                status: 'ACTIVE',
            };

            // @ts-ignore
            expect(SubscriptionSubscriber.isActive(sub)).toBe(true);
        });

        it('should return true if the status is APPROVED', () => {
            sub.details = {
                status: 'APPROVED',
            };

            // @ts-ignore
            expect(SubscriptionSubscriber.isActive(sub)).toBe(true);
        });

        it('should return true if status is not ACTIVE and not expired', () => {
            sub.details = {
                status: 'CANCELLED',
                billing_info: {
                    last_payment: {
                        amount: {
                            value: '10.00',
                            currency_code: 'EUR',
                        },
                        time: '2020-01-01 12:00:00',
                    },
                    outstanding_balance: {
                        value: '0',
                        currency_code: 'EUR',
                    },
                    failed_payments_count: 0,
                },
            };

            MockDate.set('2020-01-05 12:00:00');

            // @ts-ignore
            expect(SubscriptionSubscriber.isActive(sub)).toBe(true);
        });

        it('should return false if status is not ACTIVE and expired', () => {
            sub.details = {
                status: 'CANCELLED',
                billing_info: {
                    last_payment: {
                        amount: {
                            value: '10.00',
                            currency_code: 'EUR',
                        },
                        time: '2020-01-01 12:00:00',
                    },
                    outstanding_balance: {
                        value: '0',
                        currency_code: 'EUR',
                    },
                    failed_payments_count: 0,
                },
            };

            MockDate.set('2020-04-05 12:00:00');

            // @ts-ignore
            expect(SubscriptionSubscriber.isActive(sub)).toBe(false);
        });

        it('should return false if status is not ACTIVE and no payments where made', () => {
            sub.details = {
                status: 'CANCELLED',
                billing_info: {
                    outstanding_balance: {
                        value: '0',
                        currency_code: 'EUR',
                    },
                    failed_payments_count: 0,
                },
            };

            MockDate.set('2020-04-05 12:00:00');

            // @ts-ignore
            expect(SubscriptionSubscriber.isActive(sub)).toBe(false);
        });
    });
});
