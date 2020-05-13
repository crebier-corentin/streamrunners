import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';

@Injectable()
export class AdminGuard implements CanActivate {
    public canActivate(context: ExecutionContext): boolean {
        const req = context.switchToHttp().getRequest();
        return req.user?.admin ?? false;
    }
}
