/* eslint-disable */
import { Test, TestingModule } from '@nestjs/testing';
import { Connection } from 'typeorm';
import { SubscriptionLevel } from '../subscription/subscription.interfaces';
import { UserEntity } from './user.entity';
import { UserSubscriber } from './user.subscriber';
import { SubscriptionService } from '../subscription/subscription.service';
import { SubscriptionEntity } from '../subscription/subscription.entity';

describe('UserSubscriber', () => {
    let subscriber: UserSubscriber;
    let connection: Connection;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                UserSubscriber,
                {
                    provide: Connection,
                    useValue: { subscribers: [] },
                },
            ],
        }).compile();

        subscriber = module.get<UserSubscriber>(UserSubscriber);
        connection = module.get<Connection>(Connection);
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
            user.partner = false;
            sub = new SubscriptionEntity();
        });

        it('should return SubscriptionLevel.Diamond if the user is a partner', async () => {
            user.currentSubscription = undefined;
            user.partner = true;
            await subscriber.afterLoad(user);

            expect(user.subscriptionLevel).toBe(SubscriptionLevel.Diamond);
        });

        it('should return SubscriptionLevel.Diamond if the user is a moderator', async () => {
            user.currentSubscription = undefined;
            user.moderator = true;
            await subscriber.afterLoad(user);

            expect(user.subscriptionLevel).toBe(SubscriptionLevel.Diamond);
        });

        it('should return SubscriptionLevel.Diamond if the user is an admin', async () => {
            user.currentSubscription = undefined;
            user.admin = true;
            await subscriber.afterLoad(user);

            expect(user.subscriptionLevel).toBe(SubscriptionLevel.Diamond);
        });

        it('should return SubscriptionLevel.None if there is no current subscription', async () => {
            user.currentSubscription = undefined;

            await subscriber.afterLoad(user);
            expect(user.currentSubscription).toEqual(undefined);
            expect(user.subscriptionLevel).toBe(SubscriptionLevel.None);
        });

        it.each([SubscriptionLevel.VIP, SubscriptionLevel.Diamond])(
            'should return %s if the subscription is active',
            async lvl => {
                sub.level = lvl;
                sub.isActive = true;
                user.currentSubscription = sub;

                await subscriber.afterLoad(user);
                expect(user.currentSubscription).toEqual(sub);
                expect(user.subscriptionLevel).toBe(lvl);
            }
        );

        it('should set subscriptionLevel to SubscriptionLevel.None if the subscription is not active', async () => {
            sub.isActive = false;
            user.currentSubscription = sub;

            await subscriber.afterLoad(user);
            expect(user.currentSubscription).toEqual(sub);
            expect(user.subscriptionLevel).toBe(SubscriptionLevel.None);
        });
    });
});
