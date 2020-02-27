import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LeaderboardModule } from '../leaderboard/leaderboard.module';
import { UserModule } from '../user/user.module';
import { DiscordBotService } from './discord-bot.service';
import { DiscordUserEntity } from './discord-user.entity';
import { DiscordUserService } from './discord-user.service';

@Module({
    imports: [
        TypeOrmModule.forFeature([DiscordUserEntity]),
        forwardRef(() => UserModule),
        forwardRef(() => LeaderboardModule),
    ],
    providers: [DiscordUserService, DiscordBotService],
    exports: [DiscordBotService],
})
export class DiscordModule {}
