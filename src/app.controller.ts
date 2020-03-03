import { Controller, Get, Render, Req, Res, UseGuards } from '@nestjs/common';
import { AuthenticatedGuard } from './common/guard/authenticated.guard';
import { UserService } from './user/user.service';

@Controller()
export class AppController {
    public constructor(private readonly userService: UserService) {}

    @Get()
    public async index(@Req() req, @Res() res): Promise<void> {
        if (req.isAuthenticated()) {
            res.render('./watch');
        } else {
            res.render('./index', {
                viewers: (await this.userService.viewers()).length,
            });
        }
    }

    @UseGuards(AuthenticatedGuard)
    @Render('inventory')
    @Get('inventory')
    public async inventory(): Promise<void> {
        //
    }
}
