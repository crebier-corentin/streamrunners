import { BannerService } from './banner.service';
import { Controller, Get, Header, Res } from '@nestjs/common';

@Controller('banner')
export class BannerController {
    constructor(private readonly bannerService: BannerService) {}

    @Get()
    @Header('Content-Type', 'image/png')
    banner(@Res() res) {
        res.send(this.bannerService.getBanner());
    }
}
