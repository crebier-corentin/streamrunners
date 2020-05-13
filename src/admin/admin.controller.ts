import {
    Body,
    Controller,
    Get,
    ParseIntPipe,
    Post,
    Query,
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
import { JsonUserErrorFilter } from '../common/filter/json-user-error.filter';
import { AdminGuard } from '../common/guard/admin.guard';
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

    @Get('users')
    @Render('admin/users')
    public async users(
        @Query('page') page: number,
        @Query('search') search: string
    ): Promise<{ search: string; totalPages: number; currentPage: number; users: UserEntity[]; url: string }> {
        //Defaults to page 1
        page = Number(page);
        page = (page <= 0 || Number.isNaN(page) ? 1 : page) ?? 1;

        //Defaults search to empty string
        search = search ?? '';

        const [users, totalUsers] = await this.userService.searchPaginate(page, 20, search);

        return {
            users,
            totalPages: Math.ceil(totalUsers / 20),
            currentPage: page,
            search,
            url: `/admin/users?search=${encodeURIComponent(search)}&page=`,
        };
    }

    @UseFilters(JsonUserErrorFilter)
    @Post('set-points')
    public async setPoints(
        @Body('userId', ParseIntPipe) userId: number,
        @Body('value', ParseIntPipe) value: number
    ): Promise<void> {
        const user = await this.userService.byIdOrFail(
            userId,
            [],
            new UserErrorException(`Impossible de trouver l'utilisateur.`)
        );

        if (value < 0) throw new UserErrorException("Impossible d'avoir moins de 0 points.");

        user.points = value;
        await this.userService.save(user);
    }

    @UseFilters(JsonUserErrorFilter)
    @Post('partner')
    public async partner(@Body('userId', ParseIntPipe) userId: number): Promise<void> {
        const user = await this.userService.byIdOrFail(
            userId,
            [],
            new UserErrorException(`Impossible de trouver l'utilisateur.`)
        );
        await this.userService.togglePartner(user);
    }

    @UseFilters(JsonUserErrorFilter)
    @Post('ban')
    public async ban(@Body('userId', ParseIntPipe) userId: number, @User() user: UserEntity): Promise<void> {
        await this.adminService.ban(userId, user);
    }

    @UseFilters(JsonUserErrorFilter)
    @Post('unban')
    public async unban(@Body('userId', ParseIntPipe) userId: number): Promise<void> {
        const userToBeUnbanned = await this.userService.byIdOrFail(userId);
        await this.userService.unban(userToBeUnbanned);
    }

    @UseFilters(JsonUserErrorFilter)
    @UseGuards(AdminGuard)
    @Post('moderator')
    public async moderator(@Body('userId', ParseIntPipe) userId: number): Promise<void> {
        await this.adminService.toggleModerator(userId);
    }
}
