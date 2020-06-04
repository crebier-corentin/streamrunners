import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';

/**
 * Only allows authenticated users.
 *
 * @Category Guard
 *
 */
@Injectable()
export class AuthenticatedGuard implements CanActivate {
    public canActivate(context: ExecutionContext): boolean {
        const request = context.switchToHttp().getRequest();
        return request.isAuthenticated();
    }
}
