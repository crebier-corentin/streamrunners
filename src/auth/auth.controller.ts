import { Controller, Get, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { JwtService } from '@nestjs/jwt';
import { User } from '../user/user.decorator';
import { UserEntity } from '../user/user.entity';

@Controller('auth')
export class AuthController {
    constructor(private readonly jwt: JwtService) {}

    @UseGuards(AuthGuard('twitch'))
    @Get('/twitch')
    loginRedirect() {
        //
    }

    @UseGuards(AuthGuard('twitch'))
    @Get('/twitch/callback')
    loginCallback(@User() user: UserEntity) {
        return this.jwt.signAsync({ id: user.id });
    }
}
