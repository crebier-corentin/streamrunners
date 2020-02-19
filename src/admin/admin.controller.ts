import { AnnouncementService } from '../announcement/announcement.service';
import { CouponService } from '../coupon/coupon.service';
import { User } from '../decorator/user.decorator';
import { AuthenticatedGuard } from '../guard/authenticated.guard';
import { ModeratorGuard } from '../guard/moderator.guard';
import { SanitizationPipe } from '../pipe/sanitization-pipe.service';
import { RaffleService } from '../raffle/raffle.service';
import { UserEntity } from '../user/user.entity';
import { UserService } from '../user/user.service';
import { AddAnnouncementDto } from './dto/add-announcement.dto';
import { AddCouponDto } from './dto/add-coupon.dto';
import { AddRaffleDto } from './dto/add-raffle.dto';
import { Body, Controller, Get, Post, Redirect, Render, UseGuards, UsePipes, ValidationPipe } from '@nestjs/common';

@UseGuards(AuthenticatedGuard, ModeratorGuard)
@Controller('admin')
export class AdminController {
    public constructor(
        private readonly userService: UserService,
        private readonly raffleService: RaffleService,
        private readonly announcementService: AnnouncementService,
        private readonly couponService: CouponService
    ) {}

    @Get()
    @Render('admin/index')
    public async index(): Promise<{ totalUsers: number; totalPoints: number }> {
        return { totalUsers: await this.userService.count(), totalPoints: await this.userService.totalPoints() };
    }

    //Raffle
    @Get('raffle')
    @Render('admin/raffle')
    public async raffle(): Promise<void> {
        //
    }

    @UsePipes(SanitizationPipe, ValidationPipe)
    @Post('raffle/add')
    @Redirect('/admin/raffle')
    public async addRaffle(@Body() dto: AddRaffleDto): Promise<void> {
        await this.raffleService.add({
            title: dto.title,
            description: dto.description,
            icon: dto.icon,
            price: dto.price,
            maxTickets: dto.maxTickets,
            endingDate: dto.endingDate,
            code: dto.code,
            value: dto.value,
        });
    }

    //Announcement
    @Get('announcement')
    @Render('admin/announcement')
    public async announcement(): Promise<void> {
        //
    }

    @UsePipes(SanitizationPipe, ValidationPipe)
    @Post('announcement/add')
    @Redirect('/admin/announcement')
    public async addAnnouncement(@Body() dto: AddAnnouncementDto, @User() user: UserEntity): Promise<void> {
        await this.announcementService.setNew(dto.text, dto.color, dto.url, user);
    }

    @Post('announcement/disable')
    @Redirect('/admin/announcement')
    public async disableAnnouncement(): Promise<void> {
        await this.announcementService.disableCurrent();
    }

    //Coupon
    @Render('admin/coupon')
    @Get('coupon')
    public async coupon(): Promise<void> {
        //
    }

    @UsePipes(SanitizationPipe, ValidationPipe)
    @Post('coupon/add')
    @Redirect('/admin/coupon')
    public async addCoupon(@Body() dto: AddCouponDto): Promise<void> {
        await this.couponService.add(dto.name, dto.amount, dto.max, dto.expires);
    }
}
