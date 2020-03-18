/* eslint-disable */
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity } from '../user/user.entity';
import { PaypalService } from './paypal.service';
import { SubscriptionEntity } from './subscription.entity';
import { SubscriptionLevel, SubscriptionStatus } from './subscription.interfaces';
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
                        activateSubscription: jest.fn(),
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

    describe('getActiveSubscription', () => {
        const mockedGetOne = jest.fn();
        let user: UserEntity;
        let activeSub: SubscriptionEntity;
        let cancelledActiveSub: SubscriptionEntity;
        let queuedSub: SubscriptionEntity;

        beforeEach(() => {
            jest.spyOn(repo, 'createQueryBuilder').mockReturnValue({
                leftJoin: jest.fn().mockReturnThis(),
                where: jest.fn().mockReturnThis(),
                andWhere: jest.fn().mockReturnThis(),
                getOne: mockedGetOne,
            } as any);

            user = new UserEntity();
            user.id = 1;

            activeSub = new SubscriptionEntity();
            activeSub.id = 1;
            activeSub.paypalId = '1';
            activeSub.user = user;
            activeSub.status = SubscriptionStatus.Active;
            activeSub.level = SubscriptionLevel.VIP;
            activeSub.expires = null;

            cancelledActiveSub = new SubscriptionEntity();
            cancelledActiveSub.id = 2;
            cancelledActiveSub.paypalId = '2';
            cancelledActiveSub.user = user;
            cancelledActiveSub.status = SubscriptionStatus.CancelledActive;
            cancelledActiveSub.level = SubscriptionLevel.Diamond;
            cancelledActiveSub.expires = new Date('2020-02-01T12:00');

            queuedSub = new SubscriptionEntity();
            queuedSub.id = 3;
            queuedSub.paypalId = '3';
            queuedSub.user = user;
            queuedSub.status = SubscriptionStatus.Queued;
            queuedSub.level = SubscriptionLevel.VIP;
            queuedSub.expires = null;
        });

        it('should return a subscription with the status Active if there is one', () => {
            mockedGetOne.mockResolvedValueOnce(activeSub);

            return expect(service.getActiveSubscription(user)).resolves.toEqual(activeSub);
        });

        it("should return a subscription with the status CancelledActive if there is no Active one and it's not expired", () => {
            mockedGetOne.mockResolvedValueOnce(undefined).mockResolvedValueOnce(cancelledActiveSub);
            MockDate.set('2020-01-01T12:00');

            return expect(service.getActiveSubscription(user)).resolves.toEqual(cancelledActiveSub);
        });

        it('should return null and update the status to Cancelled if there is no Active subscription and there is an expired CancelledActive', async () => {
            mockedGetOne
                .mockResolvedValueOnce(undefined)
                .mockResolvedValueOnce(cancelledActiveSub)
                .mockResolvedValueOnce(undefined);
            MockDate.set('2020-03-01T12:00');

            const sub = await service.getActiveSubscription(user);
            expect(sub).toBe(null);

            expect(cancelledActiveSub.status).toBe(SubscriptionStatus.Cancelled);
        });

        it('should return null and update the status to Active if there is no Active or CancelledActive but there is a Queued subscription', async () => {
            mockedGetOne
                .mockResolvedValueOnce(undefined)
                .mockResolvedValueOnce(undefined)
                .mockResolvedValueOnce(queuedSub);
            const spyPaypal = jest.spyOn(paypal, 'activateSubscription');

            const sub = await service.getActiveSubscription(user);

            expect(sub).toBe(null);
            expect(spyPaypal).toHaveBeenCalledWith(queuedSub.paypalId);
            expect(queuedSub.status).toBe(SubscriptionStatus.Active);
        });

        it('should return null if there are no Active, CancelledActive or Queued subscription', () => {
            mockedGetOne
                .mockResolvedValueOnce(undefined)
                .mockResolvedValueOnce(undefined)
                .mockResolvedValueOnce(undefined);

            return expect(service.getActiveSubscription(user)).resolves.toBe(null);
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
