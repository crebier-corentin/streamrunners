/* eslint-disable @typescript-eslint/camelcase,@typescript-eslint/ban-ts-ignore */
import { UserEntity } from './user.entity';
import { UserService } from './user.service';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TwitchUser } from '../../twitch/twitch.interfaces';

describe('UserService', () => {
    let service: UserService;
    let repo: Repository<UserEntity>;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                UserService,
                {
                    provide: getRepositoryToken(UserEntity),
                    useClass: Repository,
                },
            ],
        }).compile();

        service = module.get<UserService>(UserService);
        repo = module.get<Repository<UserEntity>>(getRepositoryToken(UserEntity));
        // @ts-ignore
        jest.spyOn(repo, 'save').mockImplementation(async entity => entity);
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
            description: '',
            offline_image_url: '',
            type: undefined,
            view_count: 0,
        };

        it('should create a new user', async () => {
            jest.spyOn(repo, 'findOne').mockResolvedValue(undefined);

            const user = await service.updateFromTwitch(twitchUser);
            expect(user.twitchId).toBe(twitchUser.id);
            expect(user.username).toBe(twitchUser.login);
            expect(user.displayName).toBe(twitchUser.display_name);
            expect(user.avatar).toBe(twitchUser.profile_image_url);
        });

        it('update an already existing user', async () => {
            const defaultUser = new UserEntity();
            defaultUser.twitchId = '123';
            defaultUser.username = 'a';
            defaultUser.displayName = 'b';
            defaultUser.avatar = '0';

            jest.spyOn(repo, 'findOne').mockResolvedValue(defaultUser);

            const user = await service.updateFromTwitch(twitchUser);
            expect(user.twitchId).toBe(twitchUser.id);
            expect(user.username).toBe(twitchUser.login);
            expect(user.displayName).toBe(twitchUser.display_name);
            expect(user.avatar).toBe(twitchUser.profile_image_url);
        });
    });

    describe('refund', () => {
        it('should refund the user', async () => {
            const user = new UserEntity();
            user.points = 1000;

            await service.refund(user, 400);
            expect(user.points).toBe(1400);
        });
    });
});
