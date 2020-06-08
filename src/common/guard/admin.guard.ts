import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';

/**
 * Only allows authenticated admins.
 *
 * @category Guard
 *
 */
@Injectable()
export class AdminGuard implements CanActivate {
    public canActivate(context: ExecutionContext): boolean {
        const req = context.switchToHttp().getRequest();
        return req.user?.admin ?? false;
    }
}
