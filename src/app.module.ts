import { AppController } from './app.controller';
import { AuthModule } from './auth/auth.module';
import ormconfig = require('./ormconfig');
import { StreamQueueModule } from './stream-queue/stream-queue.module';
import { UserModule } from './user/user.module';
import { WatchModule } from './watch/watch.module';
import { TwitchModule } from './twitch/twitch.module';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChatModule } from './chat/chat.module';

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
    ],
    controllers: [AppController],
})
export class AppModule {}
