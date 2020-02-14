import { UserService } from './model/user/user.service';
import { Controller, Get, Req, Res } from '@nestjs/common';

@Controller()
export class AppController {
    constructor(private readonly userService: UserService) {}

    @Get()
    async index(@Req() req, @Res() res) {
        if (req.isAuthenticated()) {
            res.render('./watch');
        } else {
            res.render('./index', {
                viewers: (await this.userService.viewers()).length,
            });
        }
    }
}
