import { UserModule } from '../user/user.module';
import { UserService } from '../user/user.service';
import { BannerController } from './banner.controller';
import { BannerService } from './banner.service';
import { Module } from '@nestjs/common';

@Module({
    imports: [UserModule],
    providers: [
        {
            provide: BannerService,
            inject: [UserService],
            useFactory: async (userService: UserService) => {
                const bannerService = new BannerService(userService);
                await bannerService.loadDefaultBanner();
                await bannerService.updateBanner();
                return bannerService;
            },
        },
    ],
    controllers: [BannerController],
})
export class BannerModule {}
