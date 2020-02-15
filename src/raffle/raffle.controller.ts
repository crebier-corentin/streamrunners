import { User } from '../decorator/user.decorator';
import { AuthenticatedGuard } from '../guard/authenticated.guard';
import { UserEntity } from '../user/user.entity';
import { RaffleService } from './raffle.service';
import { Body, Controller, Get, ParseIntPipe, Post, Redirect, Render, UseGuards } from '@nestjs/common';

@UseGuards(AuthenticatedGuard)
@Controller('giveaway')
export class RaffleController {
    constructor(private readonly raffleService: RaffleService) {}

    @Get()
    @Render('giveaway')
    async index(@User() user: UserEntity) {
        const rafflesActive = await this.raffleService.activeAndTicketCount(user);
        const rafflesEnded = await this.raffleService.ended();

        return { rafflesActive, rafflesEnded };
    }

    @Post('buy')
    @Redirect('/giveaway')
    async buy(@Body('raffleId', ParseIntPipe) raffleId: number, @User() user: UserEntity) {
        await this.raffleService.buy(raffleId, user);
    }
}
