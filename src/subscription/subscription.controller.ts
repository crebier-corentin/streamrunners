import { Body, Controller, Get, Post, Query, Render, Req, Res, UseFilters, UseGuards } from '@nestjs/common';
import { Request, Response } from 'express';
import { User } from '../common/decorator/user.decorator';
import { FlashAndRedirectUserErrorFilter } from '../common/filter/flash-and-redirect-user-error.filter';
import { AuthenticatedGuard } from '../common/guard/authenticated.guard';
import { UserEntity } from '../user/user.entity';
import { SubscriptionService } from './subscription.service';

@UseGuards(AuthenticatedGuard)
@Controller('subscription')
export class SubscriptionController {
    public constructor(private readonly subscriptionService: SubscriptionService) {}

    @Render('subscription/shop')
    @Get()
    public shop(@Req() req: Request): { error: any } {
        return {
            error: req.flash('error'),
        };
    }

    @UseFilters(new FlashAndRedirectUserErrorFilter('/subscription'))
    @Post('buy')
    public async buy(@Body('type') type: string, @User() user: UserEntity, @Res() res: Response): Promise<void> {
        const url = await this.subscriptionService.createSubscriptionAndGetRedirectUrl(user, type);
        res.redirect(url);
    }

    @Get('paypal/return')
    public paypalReturn(): string {
        return 'placeholder';
    }

    @Get('paypal/cancel')
    public async paypalCancel(@Query('subscription_id') subId: string, @User() user: UserEntity): Promise<string> {
        await this.subscriptionService.cancelPending(user, subId);
        return 'placeholder';
    }
}
