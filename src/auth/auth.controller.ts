import { AuthenticatedGuard } from '../common/guard/authenticated.guard';
import { LoginGuard } from '../common/guard/login.guard';
import { Controller, Get, UseGuards } from '@nestjs/common';

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
