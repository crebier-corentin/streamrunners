import { Module } from '@nestjs/common';
import { ChatModule } from '../chat/chat.module';
import { StreamQueueModule } from '../stream-queue/stream-queue.module';
import { TwitchModule } from '../twitch/twitch.module';
import { UserModule } from '../user/user.module';
import { WatchController } from './watch.controller';
import { WatchService } from './watch.service';

@Module({
    imports: [StreamQueueModule, UserModule, ChatModule, TwitchModule],
    controllers: [WatchController],
    providers: [WatchService],
})
export class WatchModule {}
