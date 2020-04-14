import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DiscordModule } from '../discord/discord.module';
import { TwitchModule } from '../twitch/twitch.module';
import { StreamQueueEntity } from './stream-queue.entity';
import { StreamQueueService } from './stream-queue.service';

@Module({
    imports: [TypeOrmModule.forFeature([StreamQueueEntity]), DiscordModule, TwitchModule],
    providers: [StreamQueueService],
    exports: [StreamQueueService],
})
export class StreamQueueModule {}
