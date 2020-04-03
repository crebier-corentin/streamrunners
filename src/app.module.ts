import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OgmaModule } from 'nestjs-ogma';
import { AdminModule } from './admin/admin.module';
import { AnnouncementModule } from './announcement/announcement.module';
import { AppController } from './app.controller';
import { AuthModule } from './auth/auth.module';
import { BannerModule } from './banner/banner.module';
import { CaseModule } from './case/case.module';
import { ChatModule } from './chat/chat.module';
import { CouponModule } from './coupon/coupon.module';
import { DiscordModule } from './discord/discord.module';
import { LeaderboardModule } from './leaderboard/leaderboard.module';
import { PartnerModule } from './partner/partner.module';
import { RaffleModule } from './raffle/raffle.module';
import { StreamQueueModule } from './stream-queue/stream-queue.module';
import { SubscriptionModule } from './subscription/subscription.module';
import { TwitchModule } from './twitch/twitch.module';
import { UserModule } from './user/user.module';
import { WatchModule } from './watch/watch.module';
import ormconfig = require('./ormconfig');

@Module({
    imports: [
        ConfigModule.forRoot({ isGlobal: true }),
        TypeOrmModule.forRoot(ormconfig),
        ScheduleModule.forRoot(),
        OgmaModule.forRootAsync(OgmaModule, {
            inject: [ConfigService],
            useFactory: (config: ConfigService) => ({
                interceptor: { format: config.get('ENV') === 'development' ? 'dev' : 'prod' },
            }),
        }),
        UserModule,
        AuthModule,
        TwitchModule,
        WatchModule,
        StreamQueueModule,
        ChatModule,
        CouponModule,
        RaffleModule,
        BannerModule,
        DiscordModule,
        AnnouncementModule,
        AdminModule,
        LeaderboardModule,
        PartnerModule,
        SubscriptionModule,
        CaseModule,
    ],
    controllers: [AppController],
})
export class AppModule {}
