import { UserEntity } from '../user/user.entity';
import { UserService } from '../user/user.service';
import { Injectable } from '@nestjs/common';
import { PassportSerializer } from '@nestjs/passport';

@Injectable()
export class SessionSerializer extends PassportSerializer {
    constructor(private readonly userService: UserService) {
        super();
    }

    serializeUser(user: UserEntity, done: (err: Error, payload: any) => void): void {
        done(null, { id: user.id });
    }

    async deserializeUser(payload: { id: number }, done: (err: Error, user: any) => void): Promise<void> {
        done(null, await this.userService.fromId(payload.id));
    }
}
