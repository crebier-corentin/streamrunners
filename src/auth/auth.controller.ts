import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) {}

    @UseGuards(AuthGuard('twitch'))
    @Get('/twitch')
    loginRedirect() {
        //
    }

    @UseGuards(AuthGuard('twitch'))
    @Get('/twitch/callback')
    loginCallback(@Req() req) {
        return this.authService.signUser(req.user);
    }
}
