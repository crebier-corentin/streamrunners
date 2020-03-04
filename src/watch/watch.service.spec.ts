import { Test, TestingModule } from '@nestjs/testing';
import { StreamQueueEntity } from '../stream-queue/stream-queue.entity';
import { StreamQueueService } from '../stream-queue/stream-queue.service';
import { TwitchService } from '../twitch/twitch.service';
import { UserEntity } from '../user/user.entity';
import { NotEnoughPointsException } from '../user/user.exception';
import { UserService } from '../user/user.service';
import { WatchService } from './watch.service';
import MockDate = require('mockdate');
import { UserErrorException } from '../common/exception/user-error.exception';

describe('WatchService', () => {
    it('placeholder', () => {
        expect(true).toBe(true);
    });

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
                    },
                },
                {
                    provide: UserService,
                    useValue: {
                        save: jest.fn().mockImplementation(entity => entity),
                        changePointsSave: jest.fn().mockImplementation((user, cost) => {
                            user.points += cost;
                        }),
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

        MockDate.reset();
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
            user.lastUpdate = new Date('2020-01-01T00:00:00');
            user.points = 100;

            streamer = new UserEntity();
            streamer.id = 2;
            streamer.twitchId = '456';
            streamer.username = 'streamer';
            streamer.displayName = 'streamer';
            streamer.lastUpdate = new Date('2020-01-01T00:00:00');
            streamer.points = 0;
        });

        it("should not increase the user's points if there is no stream active", async () => {
            jest.spyOn(streamQueueService, 'currentStream').mockResolvedValue(undefined);

            await service.updatePoints(user);

            expect(user.points).toBe(100);
        });

        it("should not increase the user's points if the current stream is made by user", async () => {
            const stream = new StreamQueueEntity();
            stream.user = user;

            jest.spyOn(streamQueueService, 'currentStream').mockResolvedValue(stream);

            await service.updatePoints(user);

            expect(user.points).toBe(100);
        });

        it("should not increase the user's points if the current stream is offline", async () => {
            const stream = new StreamQueueEntity();
            stream.user = streamer;

            jest.spyOn(streamQueueService, 'currentStream').mockResolvedValue(stream);
            jest.spyOn(twitch, 'isStreamOnline').mockResolvedValue(false);

            await service.updatePoints(user);

            expect(user.points).toBe(100);
        });

        it("should not increase the user's points if it's been more than 5 seconds since user.lastUpdate and should update user.lastUpdate", async () => {
            const stream = new StreamQueueEntity();
            stream.user = streamer;

            jest.spyOn(streamQueueService, 'currentStream').mockResolvedValue(stream);
            jest.spyOn(twitch, 'isStreamOnline').mockResolvedValue(true);
            MockDate.set('2020-01-01T00:00:10');

            await service.updatePoints(user);

            expect(user.points).toBe(100);
            expect(user.lastUpdate).toStrictEqual(new Date('2020-01-01T00:00:10'));
        });

        it("should increase the user's points if it's been less than 5 seconds since user.lastUpdate and should update user.lastUpdate", async () => {
            const stream = new StreamQueueEntity();
            stream.user = streamer;

            jest.spyOn(streamQueueService, 'currentStream').mockResolvedValue(stream);
            jest.spyOn(twitch, 'isStreamOnline').mockResolvedValue(true);
            MockDate.set('2020-01-01T00:00:04');

            await service.updatePoints(user);

            expect(user.points).toBe(104);
            expect(user.lastUpdate).toStrictEqual(new Date('2020-01-01T00:00:04'));
        });
    });

    describe('addStreamToQueue', () => {
        it('should throw if the user doesn`t have enough points', async () => {
            const user = new UserEntity();
            user.points = 100;

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

            jest.spyOn(streamQueueService, 'isEmpty').mockResolvedValue(true);
            jest.spyOn(twitch, 'isStreamOnline').mockResolvedValue(false);

            return expect(service.addStreamToQueue(user)).rejects.toBeInstanceOf(UserErrorException);
        });

        it('should cost 0 if there are no active stream', async () => {
            const user = new UserEntity();
            user.points = 100;

            jest.spyOn(streamQueueService, 'isEmpty').mockResolvedValue(true);
            jest.spyOn(twitch, 'isStreamOnline').mockResolvedValue(true);
            const mockedInsert = jest.spyOn(streamQueueService, 'insert');

            await service.addStreamToQueue(user);
            expect(mockedInsert).toHaveBeenCalledWith(0, 600, user);
        });

        it('should cost 1000 if there are streams in the queue', async () => {
            const user = new UserEntity();
            user.points = 1000;

            jest.spyOn(streamQueueService, 'isEmpty').mockResolvedValue(false);
            jest.spyOn(twitch, 'isStreamOnline').mockResolvedValue(true);
            const mockedInsert = jest.spyOn(streamQueueService, 'insert');

            await service.addStreamToQueue(user);

            expect(user.points).toBe(0);
            expect(mockedInsert).toHaveBeenCalledWith(1000, 600, user);
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
