/* eslint-disable @typescript-eslint/ban-ts-ignore */
import { HttpException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity } from '../user/user.entity';
import { UserService } from '../user/user.service';
import { CaseContentEntity } from './case-content.entity';
import { CaseEntity } from './case.entity';
import { CaseService } from './case.service';

describe('CaseService', () => {
    let service: CaseService;
    let repo: Repository<CaseEntity>;
    let userService: UserService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                CaseService,
                {
                    provide: getRepositoryToken(CaseEntity),
                    useClass: Repository,
                },
                {
                    provide: UserService,
                    useValue: {
                        changePointsSave: jest.fn((user, amount) => (user.points += amount)),
                    },
                },
            ],
        }).compile();

        service = module.get<CaseService>(CaseService);
        repo = module.get<Repository<CaseEntity>>(getRepositoryToken(CaseEntity));
        userService = module.get<UserService>(UserService);

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
        it('should throw if the case is already open', () => {
            const _case = new CaseEntity();
            _case.content = new CaseContentEntity();

            return expect(service.openCase(_case, new UserEntity())).rejects.toBeInstanceOf(HttpException);
        });

        it('should generate a random spin, a random winning content and give the won points to the user', async () => {
            // @ts-ignore
            const mockedGetRandomContent = jest.spyOn(service, 'getRandomContent');

            const spinMock = [];

            for (let i = 0; i < 56; i++) {
                const content = new CaseContentEntity();

                content.name = i.toString();
                content.chance = i * 10;
                content.image = `${i}.png`;

                spinMock.push({ name: content.name, color: content.color, image: content.image });

                mockedGetRandomContent.mockReturnValueOnce(content);
            }

            const winningMock = new CaseContentEntity();
            winningMock.name = 'win';
            winningMock.chance = 500;
            winningMock.image = 'win.png';
            winningMock.amount = 100;

            mockedGetRandomContent.mockReturnValueOnce(winningMock);

            const _case = new CaseEntity();
            _case.content = null;
            _case.type = {} as any;
            _case.type.contents = []; //Mocked above

            const user = new UserEntity();
            user.points = 100;

            const { spin, winning } = await service.openCase(_case, user);

            expect(spin).toEqual(spinMock);
            expect(winning).toEqual({ name: winning.name, color: winning.color, image: winning.image });
            expect(user.points).toBe(200);
        });
    });
});
