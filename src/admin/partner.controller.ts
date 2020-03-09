import {
    Body,
    Controller,
    Get,
    ParseIntPipe,
    Post,
    Redirect,
    Render,
    Req,
    UsePipes,
    ValidationPipe,
} from '@nestjs/common';
import { Request } from 'express';
import { SanitizationPipe } from '../common/pipe/sanitization-pipe.service';
import { PartnerEntity } from '../partner/partner.entity';
import { PartnerService } from '../partner/partner.service';
import { AddPartnerDto } from './dto/add-partner.dto';

@Controller('admin/partner')
export class PartnerController {
    public constructor(private readonly partnerService: PartnerService) {}

    @Get()
    @Render('admin/partner')
    public async partner(@Req() req: Request): Promise<{ partners: PartnerEntity[]; success: string[] }> {
        return { partners: await this.partnerService.all(), success: req.flash('success') };
    }

    @UsePipes(SanitizationPipe, ValidationPipe)
    @Post('add')
    @Redirect('/admin/partner')
    public async addPartner(@Body() dto: AddPartnerDto, @Req() req: Request): Promise<void> {
        await this.partnerService.add(dto.name, dto.image, dto.url);

        req.flash('success', 'Partenaire ajouté avec succès!');
    }

    @UsePipes(SanitizationPipe, ValidationPipe)
    @Post('delete')
    @Redirect('/admin/partner')
    public async deletePartner(@Body('partnerId', ParseIntPipe) partnerId: number, @Req() req: Request): Promise<void> {
        const partner = await this.partnerService.byIdOrFail(partnerId);
        await this.partnerService.remove(partner);

        req.flash('success', 'Partenaire supprimé avec succès!');
    }
}
