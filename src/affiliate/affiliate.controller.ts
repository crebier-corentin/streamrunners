import { Controller, Get, NotFoundException, Param, Redirect, Render, Session, UseGuards } from '@nestjs/common';
import { AuthenticatedGuard } from '../common/guard/authenticated.guard';
import { UnauthenticatedGuard } from '../common/guard/unauthenticated.guard';
import { UserService } from '../user/user.service';

@Controller('affiliate')
export class AffiliateController {
    public constructor(private readonly userService: UserService) {}

    @UseGuards(AuthenticatedGuard)
    @Render('affiliate')
    @Get()
    public async index(): Promise<void> {
        //
    }

    @UseGuards(UnauthenticatedGuard)
    @Redirect('/')
    @Get(':username')
    public async affiliate(@Param('username') username, @Session() session): Promise<void> {
        const user = await this.userService.byUsernameOrFail(username, [], new NotFoundException());

        session.affiliateUserId = user.id;
    }
}
