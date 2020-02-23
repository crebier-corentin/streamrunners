import { Body, Controller, Get, Post, Render, UseGuards } from '@nestjs/common';
import { User } from '../decorator/user.decorator';
import { AuthenticatedGuard } from '../guard/authenticated.guard';
import { UserEntity } from '../user/user.entity';
import { CouponException } from './coupon.exception';
import { CouponService } from './coupon.service';

@UseGuards(AuthenticatedGuard)
@Controller('coupon')
export class CouponController {
    public constructor(private readonly couponService: CouponService) {}

    @Get()
    @Render('coupon')
    public index(): void {
        //
    }

    @Post('add')
    public async useCoupon(
        @Body('coupon') couponCode: string,
        @User() user: UserEntity
    ): Promise<{ error: boolean; message: string }> {
        try {
            const coupon = await this.couponService.useCoupon(couponCode, user);

            return { error: false, message: `Le coupon d'une valeur de : ${coupon.amount} à été utilisé !` };
        } catch (e) {
            if (e instanceof CouponException) {
                return { error: true, message: e.errorMessage() };
            }

            throw e;
        }
    }
}
