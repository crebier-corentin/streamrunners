import { UserEntity } from '../user/user.entity';
import { UserService } from '../user/user.service';
import { EntityService } from '../utils/entity-service';
import { CouponEntity } from './coupon.entity';
import { CouponException, CouponExceptionType } from './coupon.exception';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class CouponService extends EntityService<CouponEntity> {
    public constructor(@InjectRepository(CouponEntity) repo, private readonly userService: UserService) {
        super(repo);
    }

    private byName(name: string): Promise<CouponEntity | undefined> {
        return this.repo.findOne({ where: { name }, relations: ['users'] });
    }

    private async byNameOrFail(name: string): Promise<CouponEntity> {
        const entity = await this.byName(name);
        if (entity == undefined) throw new CouponException(CouponExceptionType.NotFound);

        return entity;
    }

    private async couponUsed(coupon: CouponEntity, user: UserEntity): Promise<boolean> {
        const count = await this.repo
            .createQueryBuilder('coupon')
            .leftJoin('coupon.users', 'user')
            .where('coupon.id = :couponId', { couponId: coupon.id })
            .andWhere('user.id = :userId', { userId: user.id })
            .getCount();

        return count > 0;
    }

    public async useCoupon(name: string, user: UserEntity): Promise<CouponEntity> {
        const coupon = await this.byNameOrFail(name);

        if (!coupon.isValid()) throw new CouponException(CouponExceptionType.Invalid);

        if (await this.couponUsed(coupon, user)) throw new CouponException(CouponExceptionType.AlreadyUsed);

        //Coupon is valid
        coupon.users.push(user);
        this.repo.save(coupon);

        this.userService.changePointsSave(user, coupon.amount);

        return coupon;
    }
}
