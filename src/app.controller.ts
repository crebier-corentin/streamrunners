import { Controller, Get, Render, Req, Res, UseGuards } from '@nestjs/common';
import { CaseEntity } from './case/case.entity';
import { CaseService } from './case/case.service';
import { User } from './common/decorator/user.decorator';
import { AuthenticatedGuard } from './common/guard/authenticated.guard';
import { RaffleService } from './raffle/raffle.service';
import { UserEntity } from './user/user.entity';
import { UserService } from './user/user.service';
import Request = Express.Request;

@Controller()
export class AppController {
    public constructor(
        private readonly userService: UserService,
        private readonly raffleService: RaffleService,
        private readonly caseService: CaseService
    ) {}

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
    public async inventory(
        @Req() req: Request | any,
        @User() user: UserEntity
    ): Promise<{ openedCases: CaseEntity[]; closedCases: CaseEntity[]; success: any }> {
        req.user = await this.userService.byId(req.user.id, ['currentSubscription', 'rafflesWon']); //Load raffle relation

        const openedCases = await this.caseService.getOpenedCases(user);
        const closedCases = await this.caseService.getClosedCases(user);

        return {
            openedCases,
            closedCases,
            success: req.flash('success'),
        };
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
}
