import { DiscordModule } from '../discord/discord.module';
import { StreamQueueEntity } from './stream-queue.entity';
import { StreamQueueService } from './stream-queue.service';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
    imports: [TypeOrmModule.forFeature([StreamQueueEntity]), DiscordModule],
    providers: [StreamQueueService],
    exports: [StreamQueueService],
})
export class StreamQueueModule {}
