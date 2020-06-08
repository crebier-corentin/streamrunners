import { ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/**
 * Redirects the user to twitch's login api page and logs them in the site.
 *
 * @category Guard
 *
 */
@Injectable()
export class LoginGuard extends AuthGuard('twitch') {
    public async canActivate(context: ExecutionContext): Promise<boolean> {
        const result = (await super.canActivate(context)) as boolean;
        const request = context.switchToHttp().getRequest();
        await super.logIn(request);
        return result;
    }
}
