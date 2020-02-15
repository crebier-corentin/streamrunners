import { AppController } from './app.controller';
import { AuthModule } from './auth/auth.module';
import ormconfig = require('./ormconfig');
import { ChatModule } from './chat/chat.module';
import { CouponModule } from './coupon/coupon.module';
import { StreamQueueModule } from './stream-queue/stream-queue.module';
import { TwitchModule } from './twitch/twitch.module';
import { UserModule } from './user/user.module';
import { WatchModule } from './watch/watch.module';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
    imports: [
        ConfigModule.forRoot({ isGlobal: true }),
        TypeOrmModule.forRoot(ormconfig),
        ScheduleModule.forRoot(),
        UserModule,
        AuthModule,
        TwitchModule,
        WatchModule,
        StreamQueueModule,
        ChatModule,
        CouponModule,
    ],
    controllers: [AppController],
})
export class AppModule {}
