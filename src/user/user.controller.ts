import { Controller } from '@nestjs/common';
import { UserService } from './user.service';
import { Crud } from '@nestjsx/crud';
import { User } from './user.entity';

@Crud({
    model: {
        type: User,
    },
    routes: {
        only: ['getOneBase', 'getManyBase'],
    },
})
@Controller('user')
export class UserController {
    constructor(public service: UserService) {}
}
