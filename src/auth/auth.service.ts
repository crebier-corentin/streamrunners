import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { User } from '../user/user.entity';

@Injectable()
export class AuthService {
    constructor(private readonly jwt: JwtService) {}

    public signUser(user: User) {
        return this.jwt.signAsync({ id: user.id });
    }
}
