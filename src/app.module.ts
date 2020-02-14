import { AppController } from './app.controller';
import { AuthModule } from './route/auth/auth.module';
import ormconfig = require('./ormconfig');
import { StreamQueueModule } from './model/stream-queue/stream-queue.module';
import { UserModule } from './model/user/user.module';
import { WatchModule } from './route/watch/watch.module';
import { TwitchModule } from './twitch/twitch.module';
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
    ],
    controllers: [AppController],
})
export class AppModule {}
