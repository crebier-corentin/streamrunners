import { Controller, Get, Render, Req, Res, UseGuards } from '@nestjs/common';
import { AuthenticatedGuard } from './common/guard/authenticated.guard';
import { RaffleService } from './raffle/raffle.service';
import { UserService } from './user/user.service';

@Controller()
export class AppController {
    public constructor(private readonly userService: UserService, private readonly raffleService: RaffleService) {}

    @Get()
    public async index(@Req() req, @Res() res): Promise<void> {
        if (req.isAuthenticated()) {
            res.render('./watch');
        } else {
            res.render('./index', {
                viewers: (await this.userService.viewers(30)).length,
                totalUsers: await this.userService.count(),
                raffleTotalValue: await this.raffleService.totalValue(),
                streamerPartners: JSON.stringify(await this.userService.partners()),
            });
        }
    }

    @Render('rules')
    @Get('rules')
    public rules(): void {
        //
    }

    @Render('cgu')
    @Get('cgu')
    public cgu(): void {
        //
    }

    @Render('contact')
    @Get('contact')
    public contact(): void {
        //
    }

    @UseGuards(AuthenticatedGuard)
    @Render('inventory')
    @Get('inventory')
    public async inventory(): Promise<void> {
        //
    }

    @UseGuards(AuthenticatedGuard)
    @Render('option')
    @Get('option')
    public async option(): Promise<void> {
        //
    }

    @UseGuards(AuthenticatedGuard)
    @Render('morepoints')
    @Get('morepoints')
    public async morepoints(): Promise<void> {
        //
    }

    @UseGuards(AuthenticatedGuard)
    @Render('affiliate')
    @Get('affiliate')
    public async affiliate(): Promise<void> {
        //
    }

    @UseGuards(AuthenticatedGuard)
    @Render('usertab')
    @Get('usertab')
    public async usertab(): Promise<void> {
        //
    }
}
