import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import * as ExpressRateLimit from 'express-rate-limit';
import { UserModule } from '../user/user.module';
import { ChatMessageEntity } from './chat-message.entity';
import { ChatController } from './chat.controller';
import { ChatService } from './chat.service';

@Module({
    imports: [TypeOrmModule.forFeature([ChatMessageEntity]), UserModule],
    controllers: [ChatController],
    providers: [ChatService],
    exports: [ChatService],
})
export class ChatModule implements NestModule {
    public configure(consumer: MiddlewareConsumer): void {
        //1 request/second per user
        // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
        // @ts-ignore
        const rateLimit = ExpressRateLimit({ keyGenerator: req => req.user.id, max: 1, windowMs: 1000 });

        consumer.apply(rateLimit).forRoutes('/chat/add');
    }
}
