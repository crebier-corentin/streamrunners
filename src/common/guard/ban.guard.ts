import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { BannedUserException } from '../exception/banned-user.exception';

@Injectable()
export class BanGuard implements CanActivate {
    public canActivate(context: ExecutionContext): boolean {
        const req = context.switchToHttp().getRequest();

        if (req.isAuthenticated() && req.user.banned) throw new BannedUserException();

        return true;
    }
}
