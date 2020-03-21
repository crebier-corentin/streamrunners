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
import { RaffleService } from '../raffle/raffle.service';
import { AddRaffleDto } from './dto/add-raffle.dto';

@UseGuards(AuthenticatedGuard, ModeratorGuard)
@Controller('admin/raffle')
export class RaffleController {
    public constructor(private readonly raffleService: RaffleService) {}

    @Get()
    @Render('admin/raffle')
    public raffle(@Req() req: Request): { success: string[] } {
        return { success: req.flash('success') };
    }

    @UsePipes(SanitizationPipe, ValidationPipe)
    @Post('add')
    @Redirect('/admin/raffle')
    public async addRaffle(@Body() dto: AddRaffleDto, @Req() req: Request): Promise<void> {
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

        req.flash('success', 'Giveaway ajouté avec succès!');
    }
}
