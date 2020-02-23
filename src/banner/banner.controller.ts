import { Controller, Get, Header, Res } from '@nestjs/common';
import { BannerService } from './banner.service';

@Controller('banner')
export class BannerController {
    public constructor(private readonly bannerService: BannerService) {}

    @Get()
    @Header('Content-Type', 'image/png')
    public banner(@Res() res): void {
        res.send(this.bannerService.getBanner());
    }
}
