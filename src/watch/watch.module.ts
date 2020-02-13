import { TwitchModule } from '../twitch/twitch.module';
import { StreamQueueEntity } from './stream-queue.entity';
import { StreamQueueService } from './stream-queue.service';
import { WatchController } from './watch.controller';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
    imports: [TypeOrmModule.forFeature([StreamQueueEntity]), TwitchModule],
    controllers: [WatchController],
    providers: [StreamQueueService],
    exports: [StreamQueueService],
})
export class WatchModule {}
