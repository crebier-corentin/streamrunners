import { Body, Controller, ParseIntPipe, Post, Redirect, Req, UseFilters, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { User } from '../../common/decorator/user.decorator';
import { UserErrorException } from '../../common/exception/user-error.exception';
import { FlashAndRedirectUserErrorFilter } from '../../common/filter/flash-and-redirect-user-error.filter';
import { AuthenticatedGuard } from '../../common/guard/authenticated.guard';
import { UserEntity } from '../../user/user.entity';
import { SteamKeyCategoryService } from './steam-key-category.service';
import { SteamKeyService } from './steam-key.service';

@UseGuards(AuthenticatedGuard)
@Controller('key')
export class SteamKeyController {
    public constructor(
        private readonly steamKeyService: SteamKeyService,
        private readonly steamKeyCategoryService: SteamKeyCategoryService
    ) {}

    @UseFilters(new FlashAndRedirectUserErrorFilter('/case/shop'))
    @Redirect('/inventory')
    @Post('buy')
    public async buy(
        @Body('steamKeyCategoryId', ParseIntPipe) steamKeyCategoryId: number,
        @User() user: UserEntity,
        @Req() req: Request
    ): Promise<void> {
        const category = await this.steamKeyCategoryService.byIdOrFail(
            steamKeyCategoryId,
            [],
            new UserErrorException('Type de clé inconnu.')
        );
        await this.steamKeyService.buyKey(user, category);

        req.flash('Clé acheté avec succès!');
    }
}
