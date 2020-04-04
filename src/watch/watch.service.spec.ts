import { Test, TestingModule } from '@nestjs/testing';
import { UserErrorException } from '../common/exception/user-error.exception';
import { StreamQueueEntity } from '../stream-queue/stream-queue.entity';
import { StreamQueueService } from '../stream-queue/stream-queue.service';
import { SubscriptionLevel } from '../subscription/subscription.interfaces';
import { TwitchService } from '../twitch/twitch.service';
import { UserEntity } from '../user/user.entity';
import { NotEnoughPointsException } from '../user/user.exception';
import { UserService } from '../user/user.service';
import { WatchService } from './watch.service';

describe('WatchService', () => {
    let service: WatchService;
    let streamQueueService: StreamQueueService;
    let userService: UserService;
    let twitch: TwitchService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                WatchService,
                {
                    provide: StreamQueueService,
                    useValue: {
                        currentStream: jest.fn(),
                        isEmpty: jest.fn(),
                        insert: jest.fn(),
                        remove: jest.fn(),
                        byIdAndUserIdOrFail: jest.fn(),
                        placesCount: jest.fn(),
                    },
                },
                {
                    provide: UserService,
                    useValue: {
                        save: jest.fn().mockImplementation(entity => entity),
                        changePointsSave: jest.fn().mockImplementation((user, cost) => {
                            user.points += cost;
                        }),
                        viewers: jest.fn(),
                    },
                },
                {
                    provide: TwitchService,
                    useValue: {
                        isStreamOnline: jest.fn(),
                    },
                },
            ],
        }).compile();

        service = module.get<WatchService>(WatchService);
        streamQueueService = module.get<StreamQueueService>(StreamQueueService);
        userService = module.get<UserService>(UserService);
        twitch = module.get<TwitchService>(TwitchService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('updatePoints', () => {
        let user: UserEntity;
        let streamer: UserEntity;

        beforeEach(() => {
            user = new UserEntity();
            user.id = 1;
            user.twitchId = '123';
            user.username = 'user';
            user.displayName = 'User';
            user.points = 100;

            streamer = new UserEntity();
            streamer.id = 2;
            streamer.twitchId = '456';
            streamer.username = 'streamer';
            streamer.displayName = 'streamer';
            streamer.points = 0;
        });

        it("should not increase the viewers' points if there is no stream active", async () => {
            jest.spyOn(streamQueueService, 'currentStream').mockResolvedValue(undefined);

            await service.updatePoints();

            expect(user.points).toBe(100);
        });

        it("should not increase the viewers' points if the current stream is offline", async () => {
            const stream = new StreamQueueEntity();
            stream.user = streamer;

            jest.spyOn(streamQueueService, 'currentStream').mockResolvedValue(stream);
            jest.spyOn(twitch, 'isStreamOnline').mockResolvedValue(false);

            await service.updatePoints();

            expect(user.points).toBe(100);
        });
        it.each([
            [SubscriptionLevel.None, 101],
            [SubscriptionLevel.VIP, 102],
            [SubscriptionLevel.Diamond, 102],
        ])("should increase the viewers' points (%s)", async (lvl, expectedPoints) => {
            user.subscriptionLevel = lvl;

            const stream = new StreamQueueEntity();
            stream.user = streamer;

            jest.spyOn(streamQueueService, 'currentStream').mockResolvedValue(stream);
            jest.spyOn(twitch, 'isStreamOnline').mockResolvedValue(true);
            jest.spyOn(userService, 'viewers').mockResolvedValue([user]);

            await service.updatePoints();

            expect(user.points).toBe(expectedPoints);
        });
    });

    describe('addStreamToQueue', () => {
        it.each([
            [SubscriptionLevel.None, 2],
            [SubscriptionLevel.VIP, 4],
            [SubscriptionLevel.Diamond, 6],
        ])('should throw if the user has exceeded the simultaneous place limit (%s, limit: %i)', async (lvl, limit) => {
            const user = new UserEntity();
            user.points = 5000;
            user.subscriptionLevel = lvl;

            jest.spyOn(streamQueueService, 'placesCount').mockResolvedValue(limit);

            return expect(service.addStreamToQueue(user)).rejects.toBeInstanceOf(UserErrorException);
        });

        it("should throw if the user doesn't have enough points", async () => {
            const user = new UserEntity();
            user.points = 100;
            user.subscriptionLevel = SubscriptionLevel.None;

            jest.spyOn(streamQueueService, 'placesCount').mockResolvedValue(0);
            jest.spyOn(streamQueueService, 'isEmpty').mockResolvedValue(false);
            jest.spyOn(twitch, 'isStreamOnline').mockResolvedValue(true);

            let error: NotEnoughPointsException;

            try {
                await service.addStreamToQueue(user);
            } catch (e) {
                error = e;
            }
            expect(error).toBeInstanceOf(NotEnoughPointsException);
        });

        it("should throw if the user's stream is offline", () => {
            const user = new UserEntity();
            user.points = 5000;
            user.subscriptionLevel = SubscriptionLevel.None;

            jest.spyOn(streamQueueService, 'placesCount').mockResolvedValue(0);
            jest.spyOn(streamQueueService, 'isEmpty').mockResolvedValue(true);
            jest.spyOn(twitch, 'isStreamOnline').mockResolvedValue(false);

            return expect(service.addStreamToQueue(user)).rejects.toBeInstanceOf(UserErrorException);
        });

        it('should cost 0 if there are no active stream', async () => {
            const user = new UserEntity();
            user.points = 100;
            user.subscriptionLevel = SubscriptionLevel.None;

            jest.spyOn(streamQueueService, 'placesCount').mockResolvedValue(0);
            jest.spyOn(streamQueueService, 'isEmpty').mockResolvedValue(true);
            jest.spyOn(twitch, 'isStreamOnline').mockResolvedValue(true);
            const mockedInsert = jest.spyOn(streamQueueService, 'insert');

            await service.addStreamToQueue(user);
            expect(mockedInsert).toHaveBeenCalledWith(0, 600, user);
        });

        it('should cost 2000 if there are streams in the queue', async () => {
            const user = new UserEntity();
            user.points = 2000;
            user.subscriptionLevel = SubscriptionLevel.None;

            jest.spyOn(streamQueueService, 'placesCount').mockResolvedValue(0);
            jest.spyOn(streamQueueService, 'isEmpty').mockResolvedValue(false);
            jest.spyOn(twitch, 'isStreamOnline').mockResolvedValue(true);
            const mockedInsert = jest.spyOn(streamQueueService, 'insert');

            await service.addStreamToQueue(user);

            expect(user.points).toBe(0);
            expect(mockedInsert).toHaveBeenCalledWith(2000, 600, user);
        });
    });

    describe('removeFromQueue', () => {
        let stream: StreamQueueEntity;

        beforeEach(() => {
            stream = new StreamQueueEntity();
            stream.id = 1;
            stream.amount = 1000;

            jest.spyOn(streamQueueService, 'byIdAndUserIdOrFail').mockResolvedValue(stream);
        });

        it('should return false if the stream is currently active', () => {
            jest.spyOn(streamQueueService, 'currentStream').mockResolvedValue(stream);

            return expect(service.removeFromQueue(stream.id, new UserEntity())).resolves.toBe(false);
        });

        it('should return true if and refund the user', async () => {
            const otherStream = new StreamQueueEntity();
            otherStream.id = 2;

            jest.spyOn(streamQueueService, 'currentStream').mockResolvedValue(otherStream);
            const mockedRemove = jest.spyOn(streamQueueService, 'remove');
            const mockedChangePointsSave = jest.spyOn(userService, 'changePointsSave');

            const user = new UserEntity();
            user.points = 0;

            expect(await service.removeFromQueue(stream.id, user)).toBe(true);
            expect(mockedRemove).toHaveBeenCalledWith(stream);
            expect(mockedChangePointsSave).toHaveBeenCalledWith(user, 1000);
        });
    });
});
