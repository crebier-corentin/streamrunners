import { Module } from '@nestjs/common';
import { AnnouncementModule } from '../announcement/announcement.module';
import { CouponModule } from '../coupon/coupon.module';
import { RaffleModule } from '../raffle/raffle.module';
import { UserModule } from '../user/user.module';
import { AdminController } from './admin.controller';

@Module({
    imports: [AnnouncementModule, RaffleModule, CouponModule, UserModule],
    controllers: [AdminController],
})
export class AdminModule {}
