import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserErrorException } from '../common/exception/user-error.exception';
import { EntityService } from '../common/utils/entity-service';
import { UserEntity } from '../user/user.entity';
import { UserService } from '../user/user.service';
import { CouponEntity } from './coupon.entity';

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
        if (entity == undefined) throw new UserErrorException("Le coupon n'existe pas.");

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

        if (!coupon.isValid()) throw new UserErrorException("Le coupon n'est plus valide.");

        if (await this.couponUsed(coupon, user)) throw new UserErrorException('Le coupon est déjà utilisé.');

        //Coupon is valid
        await this.repo
            .createQueryBuilder()
            .relation('users')
            .of(coupon)
            .add(user);

        await this.userService.changePointsSave(user, coupon.amount);

        return coupon;
    }

    public async add(name: string, amount: number, max: number, expires: Date): Promise<void> {
        const coupon = new CouponEntity();
        coupon.name = name;
        coupon.amount = amount;
        coupon.max = max;
        coupon.expires = expires;
        await this.repo.save(coupon);
    }
}
