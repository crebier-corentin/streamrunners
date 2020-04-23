import {
    Body,
    Controller,
    Get,
    ParseIntPipe,
    Post,
    Redirect,
    Render,
    Req,
    UseFilters,
    UseGuards,
} from '@nestjs/common';
import { Request } from 'express';
import { User } from '../common/decorator/user.decorator';
import { UserErrorException } from '../common/exception/user-error.exception';
import { FlashAndRedirectUserErrorFilter } from '../common/filter/flash-and-redirect-user-error.filter';
import { AuthenticatedGuard } from '../common/guard/authenticated.guard';
import { ModeratorGuard } from '../common/guard/moderator.guard';
import { SubscriptionLevelInfoService } from '../subscription/subscription-level-info.service';
import { SubscriptionLevel } from '../subscription/subscription.interfaces';
import { UserEntity } from '../user/user.entity';
import { UserService } from '../user/user.service';
import { AdminService } from './admin.service';

@UseGuards(AuthenticatedGuard, ModeratorGuard)
@Controller('admin')
export class AdminController {
    public constructor(
        private readonly adminService: AdminService,
        private readonly userService: UserService,
        private readonly subLevelInfoService: SubscriptionLevelInfoService
    ) {}

    @Get()
    @Render('admin/index')
    public async index(@Req() req: Request): Promise<any> {
        return {
            totalUsers: await this.userService.count(),
            totalPoints: await this.userService.totalPoints(),

            placeLimitNone: this.subLevelInfoService.getPlaceLimit(SubscriptionLevel.None),
            placeLimitVIP: this.subLevelInfoService.getPlaceLimit(SubscriptionLevel.VIP),
            placeLimitDiamond: this.subLevelInfoService.getPlaceLimit(SubscriptionLevel.Diamond),

            success: req.flash('success'),
            error: req.flash('error'),
        };
    }

    @UseFilters(new FlashAndRedirectUserErrorFilter('/admin'))
    @Post('ban')
    @Redirect('/admin')
    public async ban(@Body('username') username: string, @User() user: UserEntity, @Req() req: Request): Promise<void> {
        await this.adminService.ban(username, user);

        req.flash('success', 'Utilisateur banni avec succès.');
    }

    @UseFilters(new FlashAndRedirectUserErrorFilter('/admin'))
    @Post('partner')
    @Redirect('/admin')
    public async partner(@Body('username') username: string, @Req() req: Request): Promise<void> {
        const user = await this.userService.byUsernameOrFail(
            username,
            [],
            new UserErrorException(`Impossible de trouver l'utilisateur "${username}".`)
        );
        await this.userService.togglePartner(user);

        req.flash(
            'success',
            `Utilisateur ${user.partner ? 'ajouté dans' : 'enlevé de'} la liste des partneraires avec succès.`
        );
    }

    @UseFilters(new FlashAndRedirectUserErrorFilter('/admin'))
    @Post('place-limit')
    @Redirect('/admin')
    public async placeLimit(
        @Body('level') level: SubscriptionLevel,
        @Body('limit', ParseIntPipe) limit: number,
        @Req() req: Request
    ): Promise<void> {
        await this.subLevelInfoService.setPlaceLimit(level, limit);

        req.flash('success', 'Limite mis à jour.');
    }
}
