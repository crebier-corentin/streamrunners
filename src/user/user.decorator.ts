import { createParamDecorator } from '@nestjs/common';
import { UserEntity } from './user.entity';

export const User = createParamDecorator((data, req) => {
    return req.user as UserEntity;
});
