import { Test, TestingModule } from '@nestjs/testing';
import { Connection } from 'typeorm';
import { SubscriptionLevel } from '../subscription/subscription-level.enum';
import { UserEntity } from './user.entity';
import { UserService } from './user.service';
import { UserSubscriber } from './user.subscriber';

describe('UserSubscriber', () => {
    let subscriber: UserSubscriber;
    let connection: Connection;
    let userService: UserService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                UserSubscriber,
                {
                    provide: Connection,
                    useValue: { subscribers: [] },
                },
                {
                    provide: UserService,
                    useValue: {
                        getSubscriptionLevel: jest.fn(),
                    },
                },
            ],
        }).compile();

        subscriber = module.get<UserSubscriber>(UserSubscriber);
        connection = module.get<Connection>(Connection);
        userService = module.get<UserService>(UserService);
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
        it.each([SubscriptionLevel.None, SubscriptionLevel.VIP, SubscriptionLevel.Diamond])(
            'should load subscriptionLevel (%s)',
            async lvl => {
                jest.spyOn(userService, 'getSubscriptionLevel').mockResolvedValue(lvl);

                const user = new UserEntity();
                await subscriber.afterLoad(user);

                expect(user.subscriptionLevel).toBe(lvl);
            }
        );
    });
});
