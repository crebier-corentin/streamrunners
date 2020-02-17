import { AuthenticatedGuard } from '../guard/authenticated.guard';
import { LoginGuard } from '../guard/login.guard';
import { Controller, Get, Redirect, Req, UseGuards } from '@nestjs/common';

@Controller('auth')
export class AuthController {
    @UseGuards(LoginGuard)
    @Get('/twitch')
    loginRedirect() {
        //
    }

    @UseGuards(LoginGuard)
    @Redirect('/')
    @Get('/twitch/callback')
    loginCallback() {
        //
    }

    @UseGuards(AuthenticatedGuard)
    @Redirect('/')
    @Get('/logout')
    logout(@Req() req) {
        req.logout();
    }
}
