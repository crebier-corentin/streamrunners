import { Module } from '@nestjs/common';
import { UserModule } from '../user/user.module';
import { AuthController } from './auth.controller';
import { TwitchStrategy } from './twitch.strategy';
import { PassportModule } from '@nestjs/passport';

@Module({
    imports: [
        UserModule,
        PassportModule.register({
            defaultStrategy: 'twitch',
        }),
    ],
    providers: [TwitchStrategy],
    controllers: [AuthController],
})
export class AuthModule {}
