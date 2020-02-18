import { User } from '../decorator/user.decorator';
import { AuthenticatedGuard } from '../guard/authenticated.guard';
import { UserEntity } from '../user/user.entity';
import { RaffleEntity } from './raffle.entity';
import { RaffleEntityAndTotalAndTicketCount, RaffleService } from './raffle.service';
import { Body, Controller, Get, ParseIntPipe, Post, Redirect, Render, UseGuards } from '@nestjs/common';

@UseGuards(AuthenticatedGuard)
@Controller('giveaway')
export class RaffleController {
    public constructor(private readonly raffleService: RaffleService) {}

    @Get()
    @Render('giveaway')
    public async index(
        @User() user: UserEntity
    ): Promise<{ rafflesActive: RaffleEntityAndTotalAndTicketCount[]; rafflesEnded: RaffleEntity[] }> {
        const rafflesActive = await this.raffleService.activeAndTicketCount(user);
        const rafflesEnded = await this.raffleService.ended();

        return { rafflesActive, rafflesEnded };
    }

    @Post('buy')
    @Redirect('/giveaway')
    public async buy(@Body('raffleId', ParseIntPipe) raffleId: number, @User() user: UserEntity): Promise<void> {
        await this.raffleService.buy(raffleId, user);
    }
}
