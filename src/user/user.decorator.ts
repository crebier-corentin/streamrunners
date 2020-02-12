import { UserEntity } from './user.entity';
import { createParamDecorator } from '@nestjs/common';

export const User = createParamDecorator((data, req) => {
    return req.user as UserEntity;
});
