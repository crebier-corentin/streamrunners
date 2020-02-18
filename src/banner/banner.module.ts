import { UserModule } from '../user/user.module';
import { BannerController } from './banner.controller';
import { BannerService } from './banner.service';
import { Module } from '@nestjs/common';

@Module({
    imports: [UserModule],
    providers: [BannerService],
    controllers: [BannerController],
})
export class BannerModule {}
