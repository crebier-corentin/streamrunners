import { createParamDecorator } from '@nestjs/common';
import { UserEntity } from '../../user/user.entity';

/**
 * @returns The authenticated user.
 */
export const User = createParamDecorator((data, req) => {
    return req.user as UserEntity;
});
