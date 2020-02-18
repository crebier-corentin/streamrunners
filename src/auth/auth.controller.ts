import { AuthenticatedGuard } from '../guard/authenticated.guard';
import { LoginGuard } from '../guard/login.guard';
import { Controller, Get, Redirect, Req, UseGuards } from '@nestjs/common';

@Controller('auth')
export class AuthController {
    @UseGuards(LoginGuard)
    @Get('/twitch')
    public loginRedirect(): void {
        //
    }

    @UseGuards(LoginGuard)
    @Redirect('/')
    @Get('/twitch/callback')
    public loginCallback(): void {
        //
    }

    @UseGuards(AuthenticatedGuard)
    @Redirect('/')
    @Get('/logout')
    public logout(@Req() req): void {
        req.logout();
    }
}
