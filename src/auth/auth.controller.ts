import { Controller, Get, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { User } from '../user/user.decorator';
import { UserEntity } from '../user/user.entity';

@Controller('auth')
export class AuthController {
    constructor() {
        //
    }

    @UseGuards(AuthGuard('twitch'))
    @Get('/twitch')
    loginRedirect() {
        //
    }

    @UseGuards(AuthGuard('twitch'))
    @Get('/twitch/callback')
    loginCallback(@User() user: UserEntity) {
        //
    }
}
