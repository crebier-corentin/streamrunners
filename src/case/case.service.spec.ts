/* eslint-disable @typescript-eslint/ban-ts-ignore */
import { HttpException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity } from '../user/user.entity';
import { CaseContentEntity } from './case-content.entity';
import { CaseContentService } from './case-content.service';
import { CaseEntity } from './case.entity';
import { CaseService } from './case.service';
import { SteamKeyCategoryEntity } from './steam-key/steam-key-category.entity';
import { SteamKeyService } from './steam-key/steam-key.service';

describe('CaseService', () => {
    let service: CaseService;
    let repo: Repository<CaseEntity>;
    let caseContentService: CaseContentService;
    let steamKeyService: SteamKeyService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                CaseService,
                {
                    provide: getRepositoryToken(CaseEntity),
                    useClass: Repository,
                },
                {
                    provide: CaseContentService,
                    useValue: {
                        applyContent: jest.fn(),
                    },
                },
                {
                    provide: SteamKeyService,
                    useValue: {
                        hasAvailableKeyByCategory: jest.fn(),
                    },
                },
            ],
        }).compile();

        service = module.get<CaseService>(CaseService);
        repo = module.get<Repository<CaseEntity>>(getRepositoryToken(CaseEntity));
        caseContentService = module.get<CaseContentService>(CaseContentService);
        steamKeyService = module.get<SteamKeyService>(SteamKeyService);

        jest.spyOn(repo, 'save').mockImplementation(entity => Promise.resolve(entity) as any);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('getRandomContent', () => {
        it.each([
            [0.4575, '50%'],
            [0.5004, '25%'],
            [0.754, '15%'],
            [0.9784, '10%'],
        ])('should return a random content (%f -> %s)', (random, expected) => {
            const contents: CaseContentEntity[] = [
                {
                    id: 1,
                    name: '50%',
                    chance: 500, //50%
                },
                {
                    id: 2,
                    name: '25%',
                    chance: 250, //25%
                },
                {
                    id: 3,
                    name: '15%',
                    chance: 150, //15%
                },
                {
                    id: 4,
                    name: '10%',
                    chance: 100, //10%
                },
            ] as any;
            jest.spyOn(Math, 'random').mockReturnValue(random);

            // @ts-ignore
            expect(service.getRandomContent(contents).name).toBe(expected);
        });
    });

    describe('openCase', () => {
        let mockedGetRandomContent;
        let spinMock;

        beforeEach(() => {
            //@ts-ignore
            mockedGetRandomContent = jest.spyOn(service, 'getRandomContent');

            //Mock spin
            spinMock = [];

            for (let i = 0; i < 56; i++) {
                const content = new CaseContentEntity();

                content.name = i.toString();
                content.chance = i * 10;
                content.image = `${i}.png`;

                spinMock.push({ name: content.name, color: content.color, image: content.image });

                mockedGetRandomContent.mockReturnValueOnce(content);
            }
        });

        it('should throw if the case is already open', () => {
            const _case = new CaseEntity();
            _case.content = new CaseContentEntity();

            return expect(service.openCase(_case, new UserEntity())).rejects.toBeInstanceOf(HttpException);
        });

        it('should generate a random spin, a random winning content and give the prize to the user', async () => {
            const winningMock = new CaseContentEntity();
            winningMock.name = 'win';
            winningMock.chance = 500;
            winningMock.image = 'win.png';
            winningMock.amountPoints = 100;
            winningMock.amountMeteores = 500;
            winningMock.keyCategory = null;

            mockedGetRandomContent.mockReturnValueOnce(winningMock);

            const _case = new CaseEntity();
            _case.content = null;
            _case.type = {} as any;
            _case.type.contents = []; //Mocked in beforeEach

            const user = new UserEntity();
            user.points = 100;
            user.meteores = 0;

            const { spin, winning } = await service.openCase(_case, user);

            expect(spin).toEqual(spinMock);
            expect(winning).toEqual({ name: winning.name, color: winning.color, image: winning.image });

            const expectedCase = JSON.parse(JSON.stringify(_case)); //Clone _case
            expectedCase.content = winningMock;

            expect(jest.spyOn(caseContentService, 'applyContent')).toHaveBeenCalledWith(expectedCase, user);
        });

        it("should generate a random spin, an reload winning content if it's a key and none are available and give the prize to the user", async () => {
            const winningMock1 = new CaseContentEntity();
            winningMock1.name = 'win';
            winningMock1.chance = 500;
            winningMock1.image = 'win.png';
            winningMock1.keyCategory = new SteamKeyCategoryEntity();
            winningMock1.keyCategory.id = 1;

            mockedGetRandomContent.mockReturnValueOnce(winningMock1);

            const winningMock2 = new CaseContentEntity();
            winningMock2.name = 'win';
            winningMock2.chance = 500;
            winningMock2.image = 'win.png';
            winningMock2.keyCategory = null;

            mockedGetRandomContent.mockReturnValueOnce(winningMock2);

            const _case = new CaseEntity();
            _case.content = null;
            _case.type = {} as any;
            _case.type.contents = []; //Mocked in beforeEach

            const user = new UserEntity();

            jest.spyOn(steamKeyService, 'hasAvailableKeyByCategory').mockResolvedValue(false);

            const { spin, winning } = await service.openCase(_case, user);

            expect(spin).toEqual(spinMock);
            expect(winning).toEqual({ name: winning.name, color: winning.color, image: winning.image });

            const expectedCase = JSON.parse(JSON.stringify(_case)); //Clone _case
            expectedCase.content = winningMock2;

            expect(jest.spyOn(caseContentService, 'applyContent')).toHaveBeenCalledWith(expectedCase, user);
        });
    });
});
