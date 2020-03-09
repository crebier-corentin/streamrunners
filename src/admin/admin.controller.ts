import { Body, Controller, Get, Post, Redirect, Render, Req, UseFilters, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { User } from '../common/decorator/user.decorator';
import { FlashAndRedirectUserErrorFilter } from '../common/filter/flash-and-redirect-user-error.filter';
import { AuthenticatedGuard } from '../common/guard/authenticated.guard';
import { ModeratorGuard } from '../common/guard/moderator.guard';
import { UserEntity } from '../user/user.entity';
import { UserService } from '../user/user.service';
import { AdminService } from './admin.service';

@UseGuards(AuthenticatedGuard, ModeratorGuard)
@Controller('admin')
export class AdminController {
    public constructor(private readonly adminService: AdminService, private readonly userService: UserService) {}

    @Get()
    @Render('admin/index')
    public async index(
        @Req() req: Request
    ): Promise<{ totalUsers: number; totalPoints: number; success: string; error: string }> {
        return {
            totalUsers: await this.userService.count(),
            totalPoints: await this.userService.totalPoints(),
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
}
