import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';

/**
 * Only allows unauthenticated users.
 *
 * @Category Guard
 *
 */
@Injectable()
export class UnauthenticatedGuard implements CanActivate {
    public canActivate(context: ExecutionContext): boolean {
        const request = context.switchToHttp().getRequest();
        return !request.isAuthenticated();
    }
}
