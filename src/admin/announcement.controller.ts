import { Body, Controller, Get, Post, Redirect, Render, UseGuards, UsePipes, ValidationPipe } from '@nestjs/common';
import { AnnouncementService } from '../announcement/announcement.service';
import { User } from '../common/decorator/user.decorator';
import { AuthenticatedGuard } from '../common/guard/authenticated.guard';
import { ModeratorGuard } from '../common/guard/moderator.guard';
import { SanitizationPipe } from '../common/pipe/sanitization-pipe.service';
import { UserEntity } from '../user/user.entity';
import { AddAnnouncementDto } from './dto/add-announcement.dto';

@UseGuards(AuthenticatedGuard, ModeratorGuard)
@Controller('admin/announcement')
export class AnnouncementController {
    public constructor(private readonly announcementService: AnnouncementService) {}

    @Get()
    @Render('admin/announcement')
    public async announcement(): Promise<void> {
        //
    }

    @UsePipes(SanitizationPipe, ValidationPipe)
    @Post('add')
    @Redirect('/admin/announcement')
    public async addAnnouncement(@Body() dto: AddAnnouncementDto, @User() user: UserEntity): Promise<void> {
        await this.announcementService.setNew(dto.text, dto.color, dto.url, user);
    }

    @Post('disable')
    @Redirect('/admin/announcement')
    public async disableAnnouncement(): Promise<void> {
        await this.announcementService.disableCurrent();
    }
}
