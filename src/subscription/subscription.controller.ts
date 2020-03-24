import { Body, Controller, Get, Post, Query, Redirect, Req, Res, Session, UseFilters, UseGuards } from '@nestjs/common';
import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { User } from '../common/decorator/user.decorator';
import { FlashAndRedirectUserErrorFilter } from '../common/filter/flash-and-redirect-user-error.filter';
import { AuthenticatedGuard } from '../common/guard/authenticated.guard';
import { UserEntity } from '../user/user.entity';
import { SubscriptionService } from './subscription.service';

@UseGuards(AuthenticatedGuard)
@Controller('subscription')
export class SubscriptionController {
    public constructor(private readonly subscriptionService: SubscriptionService) {}

    @Get()
    public index(@Req() req: Request, @Res() res: Response, @Session() session, @User() user: UserEntity): void {
        const data = {
            success: req.flash('success'),
            error: req.flash('error'),
        };

        //Has subscription
        if (user.currentSubscription?.isActive()) {
            res.render('subscription/info', data);
        } else {
            //Generate PayPal-Request-Id
            session.createSubscriptionKey = uuidv4();

            res.render('subscription/shop', data);
        }
    }

    @UseFilters(new FlashAndRedirectUserErrorFilter('/subscription'))
    @Post('buy')
    public async buy(
        @Body('type') type: string,
        @Res() res: Response,
        @Session() session,
        @User() user: UserEntity
    ): Promise<void> {
        const url = await this.subscriptionService.createSubscriptionAndGetRedirectUrl(
            user,
            type,
            session.createSubscriptionKey
        );
        res.redirect(url);
    }

    @UseFilters(new FlashAndRedirectUserErrorFilter('/subscription'))
    @Redirect('/subscription')
    @Post('cancel')
    public async cancel(@Req() req: Request, @User() user: UserEntity): Promise<void> {
        await this.subscriptionService.cancelCurrent(user);

        req.flash('success', 'Abonnement annulé.');
    }

    @Redirect('/subscription')
    @Get('paypal/return')
    public paypalReturn(@Req() req: Request): void {
        req.flash('success', 'Vous êtes désormais abonnés !');
    }

    @Redirect('/subscription')
    @Get('paypal/cancel')
    public async paypalCancel(@Query('subscription_id') subId: string, @User() user: UserEntity): Promise<void> {
        await this.subscriptionService.cancelPending(user, subId);
    }
}
