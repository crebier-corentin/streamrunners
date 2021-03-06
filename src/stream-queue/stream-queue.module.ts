import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TwitchModule } from '../twitch/twitch.module';
import { StreamQueueEntity } from './stream-queue.entity';
import { StreamQueueService } from './stream-queue.service';

@Module({
    imports: [TypeOrmModule.forFeature([StreamQueueEntity]), TwitchModule],
    providers: [StreamQueueService],
    exports: [StreamQueueService],
})
export class StreamQueueModule {}
