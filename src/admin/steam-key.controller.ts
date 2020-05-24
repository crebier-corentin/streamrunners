import {
    Body,
    Controller,
    Get,
    Post,
    Redirect,
    Render,
    Req,
    UseGuards,
    UsePipes,
    ValidationPipe,
} from '@nestjs/common';
import { Request } from 'express';
import { SteamKeyService } from '../case/steam-key.service';
import { AuthenticatedGuard } from '../common/guard/authenticated.guard';
import { ModeratorGuard } from '../common/guard/moderator.guard';
import { SanitizationPipe } from '../common/pipe/sanitization-pipe.service';
import { AddSteamKeyDto } from './dto/add-steam-key.dto';

@UseGuards(AuthenticatedGuard, ModeratorGuard)
@Controller('admin/steam')
export class SteamKeyController {
    public constructor(private readonly steamKeyService: SteamKeyService) {}

    @Render('admin/steam')
    @Get()
    public async coupon(
        @Req() req: Request
    ): Promise<{ success: string[]; totalKeys: number; availableKeys: number; categories: string[] }> {
        return {
            success: req.flash('success'),
            totalKeys: await this.steamKeyService.count(),
            availableKeys: await this.steamKeyService.availableKeyCount(),
            categories: await this.steamKeyService.allCategories(),
        };
    }

    @UsePipes(SanitizationPipe, ValidationPipe)
    @Post('add')
    @Redirect('/admin/steam')
    public async addCoupon(@Body() dto: AddSteamKeyDto, @Req() req: Request): Promise<void> {
        await this.steamKeyService.add(dto.name, dto.code, dto.category);

        req.flash('success', 'Clé steam ajouté avec succès!');
    }
}
