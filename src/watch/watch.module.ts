import { StreamQueueModule } from '../stream-queue/stream-queue.module';
import { TwitchModule } from '../twitch/twitch.module';
import { UserModule } from '../user/user.module';
import { WatchController } from './watch.controller';
import { WatchService } from './watch.service';
import { Module } from '@nestjs/common';

@Module({
    imports: [StreamQueueModule, UserModule, TwitchModule],
    controllers: [WatchController],
    providers: [WatchService],
})
export class WatchModule {}
