import { Body, Controller, Get, Post, Query, Redirect, Req, Res, UseFilters, UseGuards } from '@nestjs/common';
import { Request, Response } from 'express';
import { User } from '../common/decorator/user.decorator';
import { FlashAndRedirectUserErrorFilter } from '../common/filter/flash-and-redirect-user-error.filter';
import { AuthenticatedGuard } from '../common/guard/authenticated.guard';
import { UserEntity } from '../user/user.entity';
import { SubscriptionLevel } from './subscription.interfaces';
import { SubscriptionService } from './subscription.service';

@UseGuards(AuthenticatedGuard)
@Controller('subscription')
export class SubscriptionController {
    public constructor(private readonly subscriptionService: SubscriptionService) {}

    @Get()
    public index(@Req() req: Request, @Res() res: Response, @User() user: UserEntity): void {
        const data = {
            success: req.flash('success'),
            error: req.flash('error'),
        };

        if (user.subscriptionLevel === SubscriptionLevel.None) {
            return res.render('subscription/shop', data);
        }
        //Has subscription
        else {
            return res.render('subscription/info', data);
        }
    }

    @UseFilters(new FlashAndRedirectUserErrorFilter('/subscription'))
    @Post('buy')
    public async buy(@Body('type') type: string, @User() user: UserEntity, @Res() res: Response): Promise<void> {
        const url = await this.subscriptionService.createSubscriptionAndGetRedirectUrl(user, type);
        res.redirect(url);
    }

    @Redirect('subscription/')
    @Get('paypal/return')
    public paypalReturn(@Req() req: Request): void {
        req.flash('success', 'Vous êtes désormais abonnés !');
    }

    @Redirect('subscription/')
    @Get('paypal/cancel')
    public async paypalCancel(@Query('subscription_id') subId: string, @User() user: UserEntity): Promise<void> {
        await this.subscriptionService.cancelPending(user, subId);
    }
}
