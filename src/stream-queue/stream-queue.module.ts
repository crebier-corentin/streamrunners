import { DiscordModule } from '../discord/discord.module';
import { TwitchModule } from '../twitch/twitch.module';
import { StreamQueueEntity } from './stream-queue.entity';
import { StreamQueueService } from './stream-queue.service';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
    imports: [TypeOrmModule.forFeature([StreamQueueEntity]), TwitchModule, DiscordModule],
    providers: [StreamQueueService],
    exports: [StreamQueueService],
})
export class StreamQueueModule {}
