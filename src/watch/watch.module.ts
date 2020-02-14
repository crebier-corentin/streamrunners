import { StreamQueueModule } from '../stream-queue/stream-queue.module';
import { UserModule } from '../user/user.module';
import { TwitchModule } from '../twitch/twitch.module';
import { WatchController } from './watch.controller';
import { WatchService } from './watch.service';
import { Module } from '@nestjs/common';
import { ChatModule } from '../chat/chat.module';

@Module({
    imports: [StreamQueueModule, UserModule, ChatModule, TwitchModule],
    controllers: [WatchController],
    providers: [WatchService],
})
export class WatchModule {}
