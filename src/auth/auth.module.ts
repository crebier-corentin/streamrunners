import { Module } from '@nestjs/common';
import { UserModule } from '../user/user.module';
import { AuthController } from './auth.controller';
import { TwitchStrategy } from './twitch.strategy';
import { PassportModule } from '@nestjs/passport';
import { SessionSerializer } from './session.serializer';

@Module({
    imports: [
        UserModule,
        PassportModule.register({
            defaultStrategy: 'twitch',
            session: true,
        }),
    ],
    providers: [TwitchStrategy, SessionSerializer],
    controllers: [AuthController],
})
export class AuthModule {}
