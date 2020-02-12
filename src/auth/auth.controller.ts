import { Controller, Get, UseGuards } from '@nestjs/common';
import { LoginGuard } from '../common/guard/login.guard';
import { AuthenticatedGuard } from '../common/guard/authenticated.guard';

@Controller('auth')
export class AuthController {
    constructor() {
        //
    }

    @UseGuards(LoginGuard)
    @Get('/twitch')
    loginRedirect() {
        //
    }

    @UseGuards(LoginGuard)
    @Get('/twitch/callback')
    loginCallback() {
        //
    }

    @UseGuards(AuthenticatedGuard)
    @Get()
    auth() {
        //
    }
}
