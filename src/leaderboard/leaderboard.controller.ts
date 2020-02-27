import { Controller, Get, Header, Query, Render, Res } from '@nestjs/common';
import { UserService } from '../user/user.service';
import { LeaderboardDrawerService } from './leaderboard-drawer.service';

@Controller('leaderboard')
export class LeaderboardController {
    public constructor(
        private readonly userService: UserService,
        private readonly leaderboardDrawer: LeaderboardDrawerService
    ) {}

    @Get()
    @Render('leaderboard')
    public async index(): Promise<void> {
        //
    }

    @Get('image')
    @Header('Content-Type', 'image/png')
    public async image(
        @Query('unitOfTime') unitOfTime: 'day' | 'isoWeek' | 'month' | 'year' | undefined,
        @Res() res
    ): Promise<void> {
        res.send(await this.leaderboardDrawer.getLeaderboardFor(unitOfTime));
    }
}
