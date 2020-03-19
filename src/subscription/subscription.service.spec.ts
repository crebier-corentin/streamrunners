/* eslint-disable */
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity } from '../user/user.entity';
import { PaypalService } from './paypal.service';
import { SubscriptionEntity } from './subscription.entity';
import { SubscriptionLevel } from './subscription.interfaces';
import { SubscriptionService } from './subscription.service';
import MockDate = require('mockdate');
import { PaypalSubscriptionDetails } from './paypal.interfaces';

describe('SubscriptionService', () => {
    let service: SubscriptionService;
    let repo: Repository<SubscriptionEntity>;
    let paypal: PaypalService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                SubscriptionService,
                {
                    provide: getRepositoryToken(SubscriptionEntity),
                    useClass: Repository,
                },
                {
                    provide: PaypalService,
                    useValue: {
                        getSubscriptionDetails: jest.fn(),
                    },
                },
            ],
        }).compile();

        service = module.get<SubscriptionService>(SubscriptionService);
        repo = module.get<Repository<SubscriptionEntity>>(getRepositoryToken(SubscriptionEntity));
        paypal = module.get<PaypalService>(PaypalService);

        // @ts-ignore
        jest.spyOn(repo, 'save').mockImplementation(entity => entity);

        MockDate.reset();
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('getCurrentSubscriptionAndDetails', () => {
        const mockedGetOne = jest.fn();
        let user: UserEntity;
        let details: PaypalSubscriptionDetails;

        beforeEach(() => {
            jest.spyOn(repo, 'createQueryBuilder').mockReturnValue({
                leftJoin: jest.fn().mockReturnThis(),
                where: jest.fn().mockReturnThis(),
                getOne: mockedGetOne,
            } as any);

            user = new UserEntity();
            user.id = 1;

            details = {
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

            jest.spyOn(paypal, 'getSubscriptionDetails').mockResolvedValue(details);
        });

        it('should return null if no current subscription exists', () => {
            mockedGetOne.mockResolvedValueOnce(undefined);

            return expect(service.getCurrentSubscriptionAndDetails(user)).resolves.toBe(null);
        });

        it('should load the details if an active subscription exists', async () => {
            const sub = new SubscriptionEntity();
            sub.paypalId = '1I-BW452GLLEP1G';
            sub.user = user;
            sub.current = true;

            mockedGetOne.mockResolvedValueOnce(sub);
            MockDate.set('2019-04-10T10:27:20Z');

            const subD = await service.getCurrentSubscriptionAndDetails(user);
            expect(subD.entity).toEqual(sub);
            expect(subD.details).toEqual(details);
            expect(sub.current).toBe(true);
        });

        it('should change current to false and return null if the current subscription is expired', async () => {
            const sub = new SubscriptionEntity();
            sub.paypalId = '1I-BW452GLLEP1G';
            sub.user = user;
            sub.current = true;

            mockedGetOne.mockResolvedValueOnce(sub);
            MockDate.set('2019-06-10T10:27:20Z');

            const subD = await service.getCurrentSubscriptionAndDetails(user);
            expect(subD).toBe(null);
            expect(sub.current).toBe(false);
        });
    });

    describe('getSubscriptionDetails', () => {
        let details: PaypalSubscriptionDetails;

        beforeEach(() => {
            details = {
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
        });

        it('should return the details using an id', () => {
            return expect(service.getSubscriptionDetails('I-BW452GLLEP1G')).resolves.toEqual(details);
        });

        it('should return the details using a SubscriptionEntity', () => {
            const sub = new SubscriptionEntity();
            sub.paypalId = 'I-BW452GLLEP1G';

            return expect(service.getSubscriptionDetails(sub)).resolves.toEqual(details);
        });
    });
});
