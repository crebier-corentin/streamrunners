/* eslint-disable @typescript-eslint/ban-ts-ignore */
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity } from '../user/user.entity';
import { UserService } from '../user/user.service';
import { CouponEntity } from './coupon.entity';
import { CouponExceptionType } from './coupon.exception';
import { CouponService } from './coupon.service';
import MockDate = require('mockdate');

describe('CouponService', () => {
    let service: CouponService;
    let repo: Repository<CouponEntity>;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                CouponService,
                {
                    provide: UserService,
                    useValue: {
                        changePointsSave: jest.fn((user: UserEntity, amount: number) => {
                            user.points += amount;
                        }),
                    },
                },
                {
                    provide: getRepositoryToken(CouponEntity),
                    useClass: Repository,
                },
            ],
        }).compile();

        service = module.get<CouponService>(CouponService);
        repo = module.get<Repository<CouponEntity>>(getRepositoryToken(CouponEntity));

        // @ts-ignore
        jest.spyOn(repo, 'save').mockImplementation(entity => entity);

        MockDate.reset();
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('useCoupon', () => {
        it("should fail if coupon doesn't exist", () => {
            jest.spyOn(repo, 'findOne').mockResolvedValue(undefined);

            return expect(service.useCoupon('a', new UserEntity())).rejects.toHaveProperty(
                'type',
                CouponExceptionType.NotFound
            );
        });

        it('should fail if coupon is expired', () => {
            const coupon = new CouponEntity();
            coupon.expires = new Date('2000-01-01T12:00:00.000Z');

            jest.spyOn(repo, 'findOne').mockResolvedValue(coupon);
            MockDate.set('2019-01-01T12:00:00.000Z');

            return expect(service.useCoupon('a', new UserEntity())).rejects.toHaveProperty(
                'type',
                CouponExceptionType.Invalid
            );
        });

        it('should fail if coupon is maxed out', () => {
            const coupon = new CouponEntity();
            coupon.expires = new Date('2020-01-01T12:00:00.000Z');
            coupon.max = 2;
            coupon.users = [new UserEntity(), new UserEntity()];

            jest.spyOn(repo, 'findOne').mockResolvedValue(coupon);
            MockDate.set('2019-01-01T12:00:00.000Z');

            return expect(service.useCoupon('a', new UserEntity())).rejects.toHaveProperty(
                'type',
                CouponExceptionType.Invalid
            );
        });

        it('should fail if coupon has already been used by user', () => {
            const coupon = new CouponEntity();
            coupon.expires = new Date('2020-01-01T12:00:00.000Z');
            coupon.max = 2;
            coupon.users = [];

            jest.spyOn(repo, 'findOne').mockResolvedValue(coupon);
            MockDate.set('2019-01-01T12:00:00.000Z');
            //Mock couponUsed query
            // @ts-ignore
            jest.spyOn(repo, 'createQueryBuilder').mockReturnValue({
                leftJoin: jest.fn().mockReturnThis(),
                where: jest.fn().mockReturnThis(),
                andWhere: jest.fn().mockReturnThis(),
                getCount: jest.fn().mockResolvedValue(1),
            });

            return expect(service.useCoupon('a', new UserEntity())).rejects.toHaveProperty(
                'type',
                CouponExceptionType.AlreadyUsed
            );
        });

        it("should add user to coupon's users and add points to user", async () => {
            const coupon = new CouponEntity();
            coupon.amount = 200;
            coupon.expires = new Date('2020-01-01T12:00:00.000Z');
            coupon.max = 2;
            coupon.users = [];

            jest.spyOn(repo, 'findOne').mockResolvedValue(coupon);
            MockDate.set('2019-01-01T12:00:00.000Z');
            //Mock couponUsed query
            // @ts-ignore
            jest.spyOn(repo, 'createQueryBuilder').mockReturnValue({
                leftJoin: jest.fn().mockReturnThis(),
                where: jest.fn().mockReturnThis(),
                andWhere: jest.fn().mockReturnThis(),
                getCount: jest.fn().mockResolvedValue(0),
            });

            const user = new UserEntity();
            user.points = 100;

            const couponUsed = await service.useCoupon('a', user);
            expect(user.points).toBe(300);
            expect(couponUsed.users).toEqual(expect.arrayContaining([user]));
        });
    });
});
