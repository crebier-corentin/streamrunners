/* eslint-disable @typescript-eslint/camelcase,@typescript-eslint/ban-ts-ignore */
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DiscordBotService } from '../discord/discord-bot.service';
import { TwitchUser } from '../twitch/twitch.interfaces';
import { TwitchService } from '../twitch/twitch.service';
import { UserEntity } from './user.entity';
import { UserService } from './user.service';
import MockDate = require('mockdate');

describe('UserService', () => {
    let service: UserService;
    let repo: Repository<UserEntity>;
    let twitch: TwitchService;
    let discord: DiscordBotService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                UserService,
                {
                    provide: getRepositoryToken(UserEntity),
                    useClass: Repository,
                },
                {
                    provide: TwitchService,
                    useValue: {
                        getUsers: jest.fn(),
                    },
                },
                {
                    provide: DiscordBotService,
                    useValue: {
                        updateSiteUserCount: jest.fn(),
                    },
                },
            ],
        }).compile();

        service = module.get<UserService>(UserService);
        repo = module.get<Repository<UserEntity>>(getRepositoryToken(UserEntity));
        twitch = module.get<TwitchService>(TwitchService);
        discord = module.get<DiscordBotService>(DiscordBotService);
        // @ts-ignore
        jest.spyOn(repo, 'save').mockImplementation(entity => entity);

        MockDate.reset();
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('updateFromTwitch', () => {
        const twitchUser: TwitchUser = {
            id: '123',
            login: 'hello',
            display_name: 'hi',
            profile_image_url: 'https://site.com/image.png',
            broadcaster_type: undefined,
            description: 'desc',
            offline_image_url: '',
            type: undefined,
            view_count: 0,
        };

        it('should create a new user and call DiscordBotService.updateSiteUserCount', async () => {
            jest.spyOn(repo, 'findOne').mockResolvedValue(undefined);
            const mockedFunc = jest.spyOn(discord, 'updateSiteUserCount');

            const user = await service.updateFromTwitch(twitchUser);
            expect(user.twitchId).toBe(twitchUser.id);
            expect(user.username).toBe(twitchUser.login);
            expect(user.displayName).toBe(twitchUser.display_name);
            expect(user.twitchDescription).toBe(twitchUser.description);
            expect(user.avatar).toBe(twitchUser.profile_image_url);

            expect(mockedFunc).toHaveBeenCalled();
        });

        it('update an already existing user', async () => {
            const defaultUser = new UserEntity();
            defaultUser.twitchId = '123';
            defaultUser.username = 'a';
            defaultUser.displayName = 'b';
            defaultUser.twitchDescription = 'haha';
            defaultUser.avatar = '0';

            jest.spyOn(repo, 'findOne').mockResolvedValue(defaultUser);

            const user = await service.updateFromTwitch(twitchUser);
            expect(user.twitchId).toBe(twitchUser.id);
            expect(user.username).toBe(twitchUser.login);
            expect(user.displayName).toBe(twitchUser.display_name);
            expect(user.twitchDescription).toBe(twitchUser.description);
            expect(user.avatar).toBe(twitchUser.profile_image_url);
        });
    });

    describe('changePointsSave', () => {
        it("should change the user's points", async () => {
            const user = new UserEntity();
            user.points = 1000;

            await service.changePointsSave(user, 400);
            expect(user.points).toBe(1400);
        });
    });

    describe('syncFromTwitch', () => {
        it('should call syncFromTwitchProcess with ids', async () => {
            // @ts-ignore
            const mockedFunc = jest.spyOn(service, 'syncFromTwitchProcess').mockResolvedValue();

            //Generate mock ids
            const userIds1 = [];
            for (let i = 1; i <= 100; i++) {
                userIds1.push({ twitchId: i });
            }

            const userIds2 = [];
            for (let i = 100; i <= 14; i++) {
                userIds2.push({ twitchId: i });
            }

            // @ts-ignore
            jest.spyOn(repo, 'createQueryBuilder').mockReturnValue({
                select: jest.fn().mockReturnThis(),
                offset: jest.fn().mockReturnThis(),
                limit: jest.fn().mockReturnThis(),
                getRawMany: jest
                    .fn()
                    .mockResolvedValueOnce(userIds1)
                    .mockResolvedValueOnce(userIds2),
            });

            await service.syncFromTwitch();
            expect(mockedFunc).toHaveBeenNthCalledWith(
                1,
                userIds1.map(u => u.twitchId)
            );
            expect(mockedFunc).toHaveBeenNthCalledWith(
                2,
                userIds2.map(u => u.twitchId)
            );
        });
    });

    describe('syncFromTwitchProcess', () => {
        it('should save displayName and avatar from twitch', async () => {
            const replyData = {
                data: [
                    {
                        id: '123',
                        login: 'a',
                        display_name: 'a',
                        type: '',
                        broadcaster_type: '',
                        description: 'abc',
                        profile_image_url: 'avatar-a',
                        offline_image_url: '',
                        view_count: 49,
                    },
                    {
                        id: '456',
                        login: 'b',
                        display_name: 'b',
                        type: '',
                        broadcaster_type: 'partner',
                        description: 'def',
                        profile_image_url: 'avatar-b',
                        offline_image_url:
                            'https://static-cdn.jtvnw.net/jtv_user_pictures/b7fb5e6e-a8f7-40fb-98de-d9180d052665-channel_offline_image-1920x1080.png',
                        view_count: 92613450,
                    },
                ],
            };
            // @ts-ignore
            jest.spyOn(twitch, 'getUsers').mockResolvedValue({ data: replyData });

            const mockedSet = jest.fn().mockReturnThis();

            // @ts-ignore
            jest.spyOn(repo, 'createQueryBuilder').mockReturnValue({
                createQueryBuilder: jest.fn().mockReturnThis(),
                update: jest.fn().mockReturnThis(),
                // @ts-ignore
                set: mockedSet,
                where: jest.fn().mockReturnThis(),
                callListeners: jest.fn().mockReturnThis(),
                execute: jest.fn().mockReturnThis(),
            });

            // @ts-ignore
            await service.syncFromTwitchProcess(['123', '456']);
            expect(mockedSet).toHaveBeenCalledWith({ displayName: 'a', avatar: 'avatar-a', twitchDescription: 'abc' });
            expect(mockedSet).toHaveBeenCalledWith({ displayName: 'b', avatar: 'avatar-b', twitchDescription: 'def' });
        });
    });

    describe('ban', () => {
        it('should set banned to true, bannedBy to correct user and banDate to now', async () => {
            const userToBeBanned = new UserEntity();
            userToBeBanned.id = 1;
            userToBeBanned.username = 'a';

            const bannedBy = new UserEntity();
            bannedBy.id = 2;
            bannedBy.username = 'b';

            MockDate.set('2019-01-01T10:00');

            const spySave = jest.spyOn(repo, 'save');

            const expected = new UserEntity();
            expected.id = 1;
            expected.username = 'a';
            expected.banned = true;
            expected.bannedBy = bannedBy;
            expected.banDate = new Date('2019-01-01T10:00');

            await service.ban(userToBeBanned, bannedBy);

            expect(spySave).toHaveBeenCalledWith(expected);
        });
    });
});
