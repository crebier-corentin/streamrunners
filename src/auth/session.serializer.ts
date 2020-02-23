import { Injectable } from '@nestjs/common';
import { PassportSerializer } from '@nestjs/passport';
import { UserEntity } from '../user/user.entity';
import { UserService } from '../user/user.service';

@Injectable()
export class SessionSerializer extends PassportSerializer {
    public constructor(private readonly userService: UserService) {
        super();
    }

    public serializeUser(user: UserEntity, done: (err: Error, payload: any) => void): void {
        done(null, { id: user.id });
    }

    public async deserializeUser(payload: { id: number }, done: (err: Error, user: any) => void): Promise<void> {
        done(null, await this.userService.byIdOrFail(payload.id));
    }
}
