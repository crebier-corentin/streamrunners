import { LoginGuard } from '../guard/login.guard';
import { Controller, Get, UseGuards } from '@nestjs/common';

@Controller('auth')
export class AuthController {
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
}
