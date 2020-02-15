import { UserModule } from '../user/user.module';
import { CouponController } from './coupon.controller';
import { CouponEntity } from './coupon.entity';
import { CouponService } from './coupon.service';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
    imports: [TypeOrmModule.forFeature([CouponEntity]), UserModule],
    controllers: [CouponController],
    providers: [CouponService],
    exports: [CouponService],
})
export class CouponModule {}
