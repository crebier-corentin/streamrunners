import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';

/**
 * Only allows authenticated moderators and admins.
 *
 * @Category Guard
 *
 */
@Injectable()
export class ModeratorGuard implements CanActivate {
    public canActivate(context: ExecutionContext): boolean {
        const req = context.switchToHttp().getRequest();
        return (req.user?.admin || req.user?.moderator) ?? false;
    }
}
