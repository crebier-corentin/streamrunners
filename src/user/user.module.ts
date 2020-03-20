import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DiscordModule } from '../discord/discord.module';
import { SubscriptionModule } from '../subscription/subscription.module';
import { TwitchModule } from '../twitch/twitch.module';
import { UserEntity } from './user.entity';
import { UserService } from './user.service';
import { UserSubscriber } from './user.subscriber';

@Module({
    imports: [
        TypeOrmModule.forFeature([UserEntity]),
        TwitchModule,
        forwardRef(() => DiscordModule),
        forwardRef(() => SubscriptionModule),
    ],
    providers: [UserService, UserSubscriber],
    exports: [UserService],
})
export class UserModule {}
