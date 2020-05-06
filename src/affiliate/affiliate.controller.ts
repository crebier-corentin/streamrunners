import { Controller, Get, NotFoundException, Param, Redirect, Render, Session, UseGuards } from '@nestjs/common';
import { User } from '../common/decorator/user.decorator';
import { AuthenticatedGuard } from '../common/guard/authenticated.guard';
import { UnauthenticatedGuard } from '../common/guard/unauthenticated.guard';
import { UserEntity } from '../user/user.entity';
import { UserService } from '../user/user.service';

@Controller('affiliate')
export class AffiliateController {
    public constructor(private readonly userService: UserService) {}

    @UseGuards(AuthenticatedGuard)
    @Render('affiliate')
    @Get()
    public async index(@User() user: UserEntity): Promise<{ affiliates: UserEntity[]; affiliatesValidated: number }> {
        //Load relations
        user = await this.userService.byId(user.id, ['affiliates', 'affiliatedTo']);

        return {
            affiliates: user.affiliates,
            affiliatesValidated: user.affiliates.filter(u => u.gotAffiliateCase).length,
        };
    }

    @UseGuards(UnauthenticatedGuard)
    @Redirect('/')
    @Get(':username')
    public async affiliate(@Param('username') username, @Session() session): Promise<void> {
        const user = await this.userService.byUsernameOrFail(username, [], new NotFoundException());

        session.affiliateUserId = user.id;
    }
}
