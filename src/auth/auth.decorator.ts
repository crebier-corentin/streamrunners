import { applyDecorators, CanActivate, UseGuards } from '@nestjs/common';
import { ModeratorGuard } from './moderator.guard';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiUnauthorizedResponse } from '@nestjs/swagger';

export function Auth(moderator: boolean) {
    const guards: CanActivate | Function[] = [AuthGuard];
    if (moderator) {
        guards.push(ModeratorGuard);
    }

    return applyDecorators(
        UseGuards(...guards),
        ApiBearerAuth(),
        ApiUnauthorizedResponse({ description: 'Unauthorized' }),
    );
}
