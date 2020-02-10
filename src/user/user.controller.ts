import { Controller } from '@nestjs/common';
import { UserService } from './user.service';
import { Crud } from '@nestjsx/crud';
import { UserEntity } from './user.entity';

@Crud({
    model: {
        type: UserEntity,
    },
    routes: {
        only: ['getOneBase', 'getManyBase'],
    },
})
@Controller('user')
export class UserController {
    constructor(public service: UserService) {}
}
