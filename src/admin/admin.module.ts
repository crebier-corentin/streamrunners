import { Module } from '@nestjs/common';
import { AnnouncementModule } from '../announcement/announcement.module';
import { CouponModule } from '../coupon/coupon.module';
import { RaffleModule } from '../raffle/raffle.module';
import { UserModule } from '../user/user.module';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { AnnouncementController } from './announcement.controller';
import { CouponController } from './coupon.controller';
import { RaffleController } from './raffle.controller';

@Module({
    imports: [AnnouncementModule, RaffleModule, CouponModule, UserModule],
    controllers: [AdminController, CouponController, RaffleController, AnnouncementController],
    providers: [AdminService],
})
export class AdminModule {}
