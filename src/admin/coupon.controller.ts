import {
    Body,
    Controller,
    Get,
    Post,
    Redirect,
    Render,
    Req,
    UseGuards,
    UsePipes,
    ValidationPipe,
} from '@nestjs/common';
import { Request } from 'express';
import { AuthenticatedGuard } from '../common/guard/authenticated.guard';
import { ModeratorGuard } from '../common/guard/moderator.guard';
import { SanitizationPipe } from '../common/pipe/sanitization-pipe.service';
import { CouponService } from '../coupon/coupon.service';
import { AddCouponDto } from './dto/add-coupon.dto';

@UseGuards(AuthenticatedGuard, ModeratorGuard)
@Controller('admin/coupon')
export class CouponController {
    public constructor(private readonly couponService: CouponService) {}

    @Render('admin/coupon')
    @Get()
    public coupon(@Req() req: Request): { success: string[] } {
        return { success: req.flash('success') };
    }

    @UsePipes(SanitizationPipe, ValidationPipe)
    @Post('add')
    @Redirect('/admin/coupon')
    public async addCoupon(@Body() dto: AddCouponDto, @Req() req: Request): Promise<void> {
        await this.couponService.add(dto.name, dto.amount, dto.max, dto.expires);

        req.flash('success', 'Coupon ajouté avec succès!');
    }
}
