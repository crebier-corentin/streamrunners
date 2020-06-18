/* eslint-disable @typescript-eslint/ban-ts-ignore */
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import MockDate = require('mockdate');
import { Repository } from 'typeorm';
import { TwitchService } from '../twitch/twitch.service';
import { UserEntity } from '../user/user.entity';
import { StreamQueueEntity } from './stream-queue.entity';
import { StreamQueueService } from './stream-queue.service';

describe('StreamQueueService', () => {
    let service: StreamQueueService;
    let repo: Repository<StreamQueueEntity>;
    let twitch: TwitchService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                StreamQueueService,
                {
                    provide: getRepositoryToken(StreamQueueEntity),
                    useClass: Repository,
                },
                {
                    provide: TwitchService,
                    useValue: {
                        isStreamOnline: jest.fn(),
                    },
                },
            ],
        }).compile();

        service = module.get<StreamQueueService>(StreamQueueService);
        repo = module.get<Repository<StreamQueueEntity>>(getRepositoryToken(StreamQueueEntity));
        twitch = module.get<TwitchService>(TwitchService);

        MockDate.reset();
    });

    const mockCurrentStream = (returnValue: StreamQueueEntity | undefined): void => {
        // @ts-ignore
        jest.spyOn(repo, 'createQueryBuilder').mockReturnValue({
            leftJoinAndSelect: jest.fn().mockReturnThis(),
            where: jest.fn().mockReturnThis(),
            orderBy: jest.fn().mockReturnThis(),
            getOne: jest.fn().mockResolvedValue(returnValue),
        });
    };

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('isEmpty', () => {
        it('should return false if a stream is active', async () => {
            mockCurrentStream(new StreamQueueEntity());

            expect(await service.isEmpty()).toBe(false);
        });

        it('should return true if there is no stream active', async () => {
            mockCurrentStream(undefined);

            expect(await service.isEmpty()).toBe(true);
        });
    });

    describe('insert', () => {
        it('should create a new StreamQueueEntity and call DiscordBotService.sendStreamNotificationMessage', async () => {
            // @ts-ignore
            const mockedSave = jest.spyOn(repo, 'save').mockImplementation(entity => entity);

            const user = new UserEntity();
            user.id = 1;

            const expectedStreamQueue = new StreamQueueEntity();
            expectedStreamQueue.amount = 1000;
            expectedStreamQueue.time = 600;
            expectedStreamQueue.user = user;

            await service.insert(1000, 600, user);

            expect(mockedSave).toHaveBeenCalledWith(expectedStreamQueue);
        });
    });

    describe('skipCurrent', () => {
        it('should return early if the current stream is undefined', async () => {
            // @ts-ignore
            const mockedSave = jest.spyOn(repo, 'save').mockImplementation(entity => entity);
            mockCurrentStream(undefined);

            await service.skipCurrent();
            expect(mockedSave).not.toHaveBeenCalled();
        });

        it('should set the current stream time to end time', async () => {
            const stream = new StreamQueueEntity();
            stream.time = 600;
            stream.current = 120;

            // @ts-ignore
            const mockedSave = jest.spyOn(repo, 'save').mockImplementation(entity => entity);
            mockCurrentStream(stream);

            const expectedStream = new StreamQueueEntity();
            expectedStream.time = 600;
            expectedStream.current = 600;

            await service.skipCurrent();
            expect(mockedSave).toHaveBeenCalledWith(expectedStream);
        });
    });

    describe('updateQueue', () => {
        it('should return early if the current stream is undefined', async () => {
            // @ts-ignore
            const mockedSave = jest.spyOn(repo, 'save').mockImplementation(entity => entity);
            mockCurrentStream(undefined);

            // @ts-ignore
            await service.updateQueue();
            expect(mockedSave).not.toHaveBeenCalled();
        });

        it('should skip if the stream is offline', async () => {
            const stream = new StreamQueueEntity();
            stream.start = null;
            stream.current = 100;
            stream.time = 600;
            stream.user = new UserEntity();
            stream.user.twitchId = '123';

            // @ts-ignore
            const mockedSave = jest.spyOn(repo, 'save').mockImplementation(entity => entity);
            mockCurrentStream(stream);
            MockDate.set('2020-01-01T12:00:00.000Z');

            jest.spyOn(twitch, 'isStreamOnline').mockResolvedValue(false);

            const expectedStream = new StreamQueueEntity();
            expectedStream.start = null;
            expectedStream.current = 600;
            expectedStream.time = 600;
            expectedStream.user = new UserEntity();
            expectedStream.user.twitchId = '123';

            // @ts-ignore
            await service.updateQueue();
            expect(mockedSave).toHaveBeenCalledWith(expectedStream);
        });

        it("should start the stream if it hasn't already", async () => {
            const stream = new StreamQueueEntity();
            stream.start = null;
            stream.user = new UserEntity();
            stream.user.twitchId = '123';

            // @ts-ignore
            const mockedSave = jest.spyOn(repo, 'save').mockImplementation(entity => entity);
            mockCurrentStream(stream);
            MockDate.set('2020-01-01T12:00:00.000Z');

            jest.spyOn(twitch, 'isStreamOnline').mockResolvedValue(true);

            const expectedStream = new StreamQueueEntity();
            expectedStream.start = new Date('2020-01-01T12:00:00.000Z');
            expectedStream.user = new UserEntity();
            expectedStream.user.twitchId = '123';

            // @ts-ignore
            await service.updateQueue();
            expect(mockedSave).toHaveBeenCalledWith(expectedStream);
        });

        it('should update the stream.current', async () => {
            const stream = new StreamQueueEntity();
            stream.start = new Date('2020-01-01T12:00:00.000Z');
            stream.current = 0;
            stream.time = 600;
            stream.user = new UserEntity();
            stream.user.twitchId = '123';

            // @ts-ignore
            const mockedSave = jest.spyOn(repo, 'save').mockImplementation(entity => entity);
            mockCurrentStream(stream);
            MockDate.set('2020-01-01T12:04:00.000Z');

            jest.spyOn(twitch, 'isStreamOnline').mockResolvedValue(true);

            const expectedStream = new StreamQueueEntity();
            expectedStream.start = new Date('2020-01-01T12:00:00.000Z');
            expectedStream.current = 240;
            expectedStream.time = 600;
            expectedStream.user = new UserEntity();
            expectedStream.user.twitchId = '123';

            // @ts-ignore
            await service.updateQueue();
            expect(mockedSave).toHaveBeenCalledWith(expectedStream);
        });

        it('should cap the stream.current at stream.time', async () => {
            const stream = new StreamQueueEntity();
            stream.start = new Date('2020-01-01T12:00:00.000Z');
            stream.current = 0;
            stream.time = 600;
            stream.user = new UserEntity();
            stream.user.twitchId = '123';

            // @ts-ignore
            const mockedSave = jest.spyOn(repo, 'save').mockImplementation(entity => entity);
            mockCurrentStream(stream);
            MockDate.set('2020-01-01T20:00:00.000Z');

            jest.spyOn(twitch, 'isStreamOnline').mockResolvedValue(true);

            const expectedStream = new StreamQueueEntity();
            expectedStream.start = new Date('2020-01-01T12:00:00.000Z');
            expectedStream.current = 600;
            expectedStream.time = 600;
            expectedStream.user = new UserEntity();
            expectedStream.user.twitchId = '123';

            // @ts-ignore
            await service.updateQueue();
            expect(mockedSave).toHaveBeenCalledWith(expectedStream);
        });
    });
});
