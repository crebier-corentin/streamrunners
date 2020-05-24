import { HttpException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity } from '../user/user.entity';
import { UserService } from '../user/user.service';
import { CaseContentEntity } from './case-content.entity';
import { CaseContentService } from './case-content.service';
import { CaseEntity } from './case.entity';
import { SteamKeyEntity } from './steam-key.entity';
import { SteamKeyService } from './steam-key.service';

describe('CaseContentService', () => {
    let service: CaseContentService;
    let repo: Repository<CaseContentEntity>;
    let userService: UserService;
    let steamKeyService: SteamKeyService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                CaseContentService,
                {
                    provide: getRepositoryToken(CaseContentEntity),
                    useClass: Repository,
                },
                {
                    provide: UserService,
                    useValue: {
                        changePointsSave: jest.fn((user, amount) => (user.points += amount)),
                        changeMeteoresSave: jest.fn((user, amount) => (user.meteores += amount)),
                    },
                },
                {
                    provide: SteamKeyService,
                    useValue: {
                        getAvailableKeyByCategory: jest.fn(),
                    },
                },
            ],
        }).compile();

        service = module.get<CaseContentService>(CaseContentService);
        repo = module.get<Repository<CaseContentEntity>>(getRepositoryToken(CaseContentEntity));
        userService = module.get<UserService>(UserService);
        steamKeyService = module.get<SteamKeyService>(SteamKeyService);

        jest.spyOn(repo, 'save').mockImplementation(entity => Promise.resolve(entity) as any);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('applyContent', () => {
        it('should give the user points and meteores if keyCategory is null', async () => {
            const content = new CaseContentEntity();
            content.name = 'PointsAndMeteores';
            content.chance = 500;
            content.image = 'test.png';
            content.keyCategory == null;
            content.amountPoints = 100;
            content.amountMeteores = 500;

            const _case = new CaseEntity();
            _case.content = content;

            const user = new UserEntity();
            user.points = 100;
            user.meteores = 0;

            await service.applyContent(_case, user);

            expect(user.points).toBe(200);
            expect(user.meteores).toBe(500);
        });

        it('should associate a steam key to the case if keyCategory is not null and a key is available', async () => {
            const content = new CaseContentEntity();
            content.name = 'SteamKey';
            content.chance = 500;
            content.image = 'test.png';
            content.keyCategory = 'random';

            const _case = new CaseEntity();
            _case.content = content;

            const user = new UserEntity();

            const key = new SteamKeyEntity();
            key.name = 'test';
            key.code = '123';

            jest.spyOn(steamKeyService, 'getAvailableKeyByCategory').mockResolvedValue(key);

            await service.applyContent(_case, user);

            expect(_case.key).toEqual(key);
        });

        it('should throw if keyCategory is not null and no key is available', () => {
            const content = new CaseContentEntity();
            content.name = 'SteamKey';
            content.chance = 500;
            content.image = 'test.png';
            content.keyCategory = 'random';

            const _case = new CaseEntity();
            _case.content = content;

            const user = new UserEntity();

            jest.spyOn(steamKeyService, 'getAvailableKeyByCategory').mockResolvedValue(undefined);

            return expect(service.applyContent(_case, user)).rejects.toThrow(HttpException);
        });
    });
});
