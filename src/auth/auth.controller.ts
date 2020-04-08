import { Controller, Get, Redirect, Req, Session, UseGuards } from '@nestjs/common';
import * as moment from 'moment';
import { User } from '../common/decorator/user.decorator';
import { AuthenticatedGuard } from '../common/guard/authenticated.guard';
import { LoginGuard } from '../common/guard/login.guard';
import { UserEntity } from '../user/user.entity';
import { UserService } from '../user/user.service';

@Controller('auth')
export class AuthController {
    public constructor(private readonly userService: UserService) {}

    @UseGuards(LoginGuard)
    @Get('/twitch')
    public loginRedirect(): void {
        //
    }

    @UseGuards(LoginGuard)
    @Redirect('/')
    @Get('/twitch/callback')
    public async loginCallback(@User() rawUser: UserEntity, @Session() session): Promise<void> {
        //Handle affiliate
        //Ignore trying to affiliate themselves and account created more than oen hour ago
        if (
            session.affiliateUserId != undefined &&
            session.affiliateUserId !== rawUser.id &&
            moment() < moment(rawUser.createdAt).add(1, 'hour')
        ) {
            //Load affiliatedTo relation
            const user = await this.userService.byId(rawUser.id, ['affiliatedTo']);
            //Ignore if user is already affiliated
            if (user.affiliatedTo == null) {
                user.affiliatedTo = await this.userService.byIdOrFail(session.affiliateUserId);
                await this.userService.save(user);
            }
        }
    }

    @UseGuards(AuthenticatedGuard)
    @Redirect('/')
    @Get('/logout')
    public logout(@Req() req): void {
        req.logout();
    }
}
