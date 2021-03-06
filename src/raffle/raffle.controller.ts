import { Body, Controller, Get, ParseIntPipe, Post, Render, UseGuards } from '@nestjs/common';
import { classToPlain, serialize } from 'class-transformer';
import { User } from '../common/decorator/user.decorator';
import { AuthenticatedGuard } from '../common/guard/authenticated.guard';
import { UserEntity } from '../user/user.entity';
import { RaffleEntity } from './raffle.entity';
import { RaffleService } from './raffle.service';

@UseGuards(AuthenticatedGuard)
@Controller('raffle')
export class RaffleController {
    public constructor(private readonly raffleService: RaffleService) {}

    @Get()
    @Render('raffle')
    public async index(@User() user: UserEntity): Promise<{ rafflesActive: string; rafflesEnded: RaffleEntity[] }> {
        const rafflesActive = await this.raffleService.activeAndTicketCount(user);
        const rafflesEnded = await this.raffleService.ended();

        return { rafflesActive: serialize(rafflesActive), rafflesEnded };
    }

    @Post('buy')
    public async buy(
        @Body('raffleId', ParseIntPipe) raffleId: number,
        @Body('amount', ParseIntPipe) amount: number,
        @User() user: UserEntity
    ): Promise<{ points: number; raffles: any }> {
        await this.raffleService.buy(raffleId, amount, user);

        const raffles = await this.raffleService.activeAndTicketCount(user);
        return { points: user.points, raffles: classToPlain(raffles) };
    }
}
