/* eslint-disable @typescript-eslint/ban-ts-ignore */
import { InternalServerErrorException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserErrorException } from '../../common/exception/user-error.exception';
import { UserEntity } from '../../user/user.entity';
import { UserService } from '../../user/user.service';
import { CaseEntity } from '../case.entity';
import { SteamKeyCategoryEntity } from './steam-key-category.entity';
import { SteamKeyCategoryService } from './steam-key-category.service';
import { SteamKeyEntity } from './steam-key.entity';
import { SteamKeyService } from './steam-key.service';

describe('SteamKeyService', () => {
    let service: SteamKeyService;
    let repo: Repository<SteamKeyEntity>;
    let categoryService: SteamKeyCategoryService;
    let userService: UserService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                SteamKeyService,
                {
                    provide: getRepositoryToken(SteamKeyEntity),
                    useClass: Repository,
                },
                {
                    provide: SteamKeyCategoryService,
                    useValue: {},
                },
                {
                    provide: UserService,
                    useValue: {
                        changePointsSave: jest.fn((user, amount) => (user.points += amount)),
                    },
                },
            ],
        }).compile();

        service = module.get<SteamKeyService>(SteamKeyService);
        repo = module.get<Repository<SteamKeyEntity>>(getRepositoryToken(SteamKeyEntity));
        categoryService = module.get<SteamKeyCategoryService>(SteamKeyCategoryService);
        userService = module.get<UserService>(UserService);

        // @ts-ignore
        jest.spyOn(repo, 'save').mockImplementation(entity => entity);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('giveKey', () => {
        it('should give a key to the user by setting the relations', async () => {
            const user = new UserEntity();
            user.id = 1;
            user.keys = [];

            const key = new SteamKeyEntity();
            key.code = 'test';

            await service.giveKey(user, key);

            expect(key.user).toBe(user);
            expect(user.keys).toContainEqual(key);
        });

        it('should throw if the key already belongs to a case', () => {
            const user = new UserEntity();
            user.id = 1;
            user.keys = [];

            const key = new SteamKeyEntity();
            key.code = 'test';
            key.case = new CaseEntity();

            return expect(service.giveKey(user, key)).rejects.toBeInstanceOf(InternalServerErrorException);
        });

        it('should throw if the key already belongs to a user', () => {
            const user = new UserEntity();
            user.id = 1;
            user.keys = [];

            const key = new SteamKeyEntity();
            key.code = 'test';
            key.user = new UserEntity();

            return expect(service.giveKey(user, key)).rejects.toBeInstanceOf(InternalServerErrorException);
        });
    });

    describe('buyKey', () => {
        let user: UserEntity;
        let category: SteamKeyCategoryEntity;
        let key: SteamKeyEntity;

        beforeEach(() => {
            user = new UserEntity();
            user.id = 1;
            user.points = 500;
            user.keys = [];

            category = new SteamKeyCategoryEntity();
            category.id = 1;
            category.buyable = true;
            category.cost = 100;

            key = new SteamKeyEntity();
            key.id = 1;
            key.category = category;

            jest.spyOn(service, 'getAvailableKeyByCategory').mockResolvedValue(key);
        });

        it('should buy a key and give it to the user', async () => {
            await service.buyKey(user, category);

            expect(user.points).toEqual(400);

            expect(user.keys).toContainEqual(key);
            expect(key.user).toEqual(user);
        });

        it('should throw if the key category is not buyable', () => {
            category.buyable = false;

            return expect(service.buyKey(user, category)).rejects.toBeInstanceOf(UserErrorException);
        });

        it("should throw if the user can' afford the key", () => {
            user.points = 10;

            return expect(service.buyKey(user, category)).rejects.toBeInstanceOf(UserErrorException);
        });

        it('should throw if no keys are available', () => {
            jest.spyOn(service, 'getAvailableKeyByCategory').mockResolvedValue(undefined);

            return expect(service.buyKey(user, category)).rejects.toBeInstanceOf(UserErrorException);
        });
    });
});
