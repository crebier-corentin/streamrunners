import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import * as ExpressRateLimit from 'express-rate-limit';
import { CaseModule } from '../case/case.module';
import { ChatModule } from '../chat/chat.module';
import { StreamQueueModule } from '../stream-queue/stream-queue.module';
import { SubscriptionModule } from '../subscription/subscription.module';
import { TwitchModule } from '../twitch/twitch.module';
import { UserModule } from '../user/user.module';
import { WatchController } from './watch.controller';
import { WatchService } from './watch.service';

@Module({
    imports: [StreamQueueModule, UserModule, ChatModule, TwitchModule, CaseModule, SubscriptionModule],
    controllers: [WatchController],
    providers: [WatchService],
})
export class WatchModule implements NestModule {
    public configure(consumer: MiddlewareConsumer): void {
        //1 request/second per user
        // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
        // @ts-ignore
        const rateLimit = ExpressRateLimit({ keyGenerator: req => req.user?.id ?? req.ip, max: 1, windowMs: 1000 });

        consumer.apply(rateLimit).forRoutes('/watch/update');
    }
}
