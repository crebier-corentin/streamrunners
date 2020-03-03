import { Controller, Get, Redirect, Req, UseGuards } from '@nestjs/common';
import { AuthenticatedGuard } from '../common/guard/authenticated.guard';
import { LoginGuard } from '../common/guard/login.guard';

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
