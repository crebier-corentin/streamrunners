import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserErrorException } from '../common/exception/user-error.exception';
import { UserEntity } from '../user/user.entity';
import { UserService } from '../user/user.service';
import { CaseTypeEntity } from './case-type.entity';
import { CaseTypeService } from './case-type.service';
import { CaseService } from './case.service';

describe('CaseTypeService', () => {
    let service: CaseTypeService;
    let repo: Repository<CaseTypeEntity>;
    let caseService: CaseService;
    let userService: UserService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                CaseTypeService,
                {
                    provide: getRepositoryToken(CaseTypeEntity),
                    useClass: Repository,
                },
                {
                    provide: CaseService,
                    useValue: {
                        giveCase: jest.fn(),
                    },
                },
                {
                    provide: UserService,
                    useValue: {
                        changePointsSave: jest.fn((user, points) => {
                            user.points += points;
                        }),
                    },
                },
            ],
        }).compile();

        service = module.get<CaseTypeService>(CaseTypeService);
        repo = module.get<Repository<CaseTypeEntity>>(getRepositoryToken(CaseTypeEntity));
        caseService = module.get<CaseService>(CaseService);
        userService = module.get<UserService>(UserService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('buyCase', () => {
        let user: UserEntity;

        beforeEach(() => {
            user = new UserEntity();
            user.points = 100;
        });

        it("should throw if the case type doesn't exist", () => {
            jest.spyOn(repo, 'findOne').mockResolvedValue(undefined);

            return expect(service.buyCase(404, user)).rejects.toBeInstanceOf(UserErrorException);
        });

        it('should throw if the case type is not buyable', () => {
            const type = new CaseTypeEntity();
            type.buyable = false;
            type.price = 0;

            jest.spyOn(repo, 'findOne').mockResolvedValue(type);

            return expect(service.buyCase(1, user)).rejects.toBeInstanceOf(UserErrorException);
        });

        it("should throw if the user can't afford the case type", () => {
            const type = new CaseTypeEntity();
            type.buyable = true;
            type.price = 1000;

            jest.spyOn(repo, 'findOne').mockResolvedValue(type);

            return expect(service.buyCase(1, user)).rejects.toBeInstanceOf(UserErrorException);
        });

        it('should give a case of the correct type to user and deduce the price from their points', async () => {
            const type = new CaseTypeEntity();
            type.buyable = true;
            type.price = 50;

            jest.spyOn(repo, 'findOne').mockResolvedValue(type);

            await service.buyCase(1, user);

            expect(jest.spyOn(caseService, 'giveCase')).toHaveBeenCalledWith(type, user);
            expect(user.points).toBe(50);
        });
    });
});
