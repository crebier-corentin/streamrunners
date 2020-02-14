import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ChatController } from './chat.controller';
import { ChatService } from './chat.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChatMessageEntity } from './chat-message.entity';
import * as ExpressRateLimit from 'express-rate-limit';

@Module({
    imports: [TypeOrmModule.forFeature([ChatMessageEntity])],
    controllers: [ChatController],
    providers: [ChatService],
    exports: [ChatService],
})
export class ChatModule implements NestModule {
    configure(consumer: MiddlewareConsumer) {
        //1 request/second per user
        // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
        // @ts-ignore
        const rateLimit = ExpressRateLimit({ keyGenerator: req => req.user.id, max: 1, windowMs: 1000 });

        consumer.apply(rateLimit).forRoutes('/chat/add');
    }
}
