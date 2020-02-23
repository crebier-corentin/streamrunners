import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { UserModule } from '../user/user.module';
import { AuthController } from './auth.controller';
import { SessionSerializer } from './session.serializer';
import { TwitchStrategy } from './twitch.strategy';

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
