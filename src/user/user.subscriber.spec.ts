/* eslint-disable */
import { Test, TestingModule } from '@nestjs/testing';
import { Connection } from 'typeorm';
import { SubscriptionLevel } from '../subscription/subscription.interfaces';
import { UserEntity } from './user.entity';
import { UserSubscriber } from './user.subscriber';
import { SubscriptionService } from '../subscription/subscription.service';
import { SubscriptionEntity } from '../subscription/subscription.entity';
import MockDate = require('mockdate');

describe('UserSubscriber', () => {
    let subscriber: UserSubscriber;
    let connection: Connection;
    let subService: SubscriptionService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                UserSubscriber,
                {
                    provide: Connection,
                    useValue: { subscribers: [] },
                },
                {
                    provide: SubscriptionService,
                    useValue: {
                        getCurrentSubscription: jest.fn(),
                    },
                },
            ],
        }).compile();

        subscriber = module.get<UserSubscriber>(UserSubscriber);
        connection = module.get<Connection>(Connection);
        subService = module.get<SubscriptionService>(SubscriptionService);

        MockDate.reset();
    });

    it('should be defined', () => {
        expect(subscriber).toBeDefined();
    });

    it('should add itself to Connection.subscribers', () => {
        expect(connection.subscribers).toContainEqual(subscriber);
    });

    describe('listenTo', () => {
        it('should return UserEntity', () => {
            expect(subscriber.listenTo()).toEqual(UserEntity);
        });
    });

    describe('afterLoad', () => {
        let user: UserEntity;
        let sub: SubscriptionEntity;

        beforeEach(() => {
            user = new UserEntity();
            user.id = 1;
            sub = new SubscriptionEntity();
        });

        it('should return SubscriptionLevel.None if there is no current subscription', async () => {
            jest.spyOn(subService, 'getCurrentSubscription').mockResolvedValue(undefined);

            await subscriber.afterLoad(user);
            expect(user.currentSubscription).toEqual(undefined);
            expect(user.subscriptionLevel).toBe(SubscriptionLevel.None);
        });

        it('should return SubscriptionLevel.None if subscription.details is null', async () => {
            sub.details = null;
            jest.spyOn(subService, 'getCurrentSubscription').mockResolvedValue(sub);

            await subscriber.afterLoad(user);
            expect(user.currentSubscription).toEqual(sub);
            expect(user.subscriptionLevel).toBe(SubscriptionLevel.None);
        });

        it.each([SubscriptionLevel.VIP, SubscriptionLevel.Diamond])(
            'should return %s if subscription.details is ACTIVE',
            async lvl => {
                sub.level = lvl;
                sub.details = {
                    status: 'ACTIVE',
                };
                jest.spyOn(subService, 'getCurrentSubscription').mockResolvedValue(sub);

                await subscriber.afterLoad(user);
                expect(user.currentSubscription).toEqual(sub);
                expect(user.subscriptionLevel).toBe(lvl);
            }
        );

        it.each([SubscriptionLevel.VIP, SubscriptionLevel.Diamond])(
            'should return %s if subscription.details is not ACTIVE and not expired',
            async lvl => {
                sub.level = lvl;
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
                jest.spyOn(subService, 'getCurrentSubscription').mockResolvedValue(sub);

                MockDate.set('2020-01-05 12:00:00');

                await subscriber.afterLoad(user);
                expect(user.currentSubscription).toEqual(sub);
                expect(user.subscriptionLevel).toBe(lvl);
            }
        );

        it('should set subscriptionLevel to SubscriptionLevel.None if subscription.details is expired', async () => {
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
            jest.spyOn(subService, 'getCurrentSubscription').mockResolvedValue(sub);

            MockDate.set('2020-02-02 12:00:00');

            await subscriber.afterLoad(user);
            expect(user.currentSubscription).toEqual(sub);
            expect(user.subscriptionLevel).toBe(SubscriptionLevel.None);
        });
    });
});
