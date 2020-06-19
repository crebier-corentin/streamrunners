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
import { SteamKeyCategoryEntity } from '../case/steam-key/steam-key-category.entity';
import { SteamKeyCategoryService } from '../case/steam-key/steam-key-category.service';
import { SteamKeyService } from '../case/steam-key/steam-key.service';
import { AuthenticatedGuard } from '../common/guard/authenticated.guard';
import { ModeratorGuard } from '../common/guard/moderator.guard';
import { SanitizationPipe } from '../common/pipe/sanitization-pipe.service';
import { AddSteamKeyDto } from './dto/add-steam-key.dto';

@UseGuards(AuthenticatedGuard, ModeratorGuard)
@Controller('admin/steam')
export class SteamKeyController {
    public constructor(
        private readonly steamKeyService: SteamKeyService,
        private readonly steamKeyCategoryService: SteamKeyCategoryService
    ) {}

    @Render('admin/steam')
    @Get()
    public async coupon(
        @Req() req: Request
    ): Promise<{ success: any; totalKeys: number; categories: SteamKeyCategoryEntity[]; availableKeys: number }> {
        return {
            success: req.flash('success'),
            totalKeys: await this.steamKeyService.count(),
            availableKeys: await this.steamKeyService.availableKeyCount(),
            categories: await this.steamKeyCategoryService.all(),
        };
    }

    @UsePipes(SanitizationPipe, ValidationPipe)
    @Post('add')
    @Redirect('/admin/steam')
    public async addCoupon(@Body() dto: AddSteamKeyDto, @Req() req: Request): Promise<void> {
        await this.steamKeyService.add(dto.name, dto.code, dto.categoryId);

        req.flash('success', 'Clé steam ajouté avec succès!');
    }
}
