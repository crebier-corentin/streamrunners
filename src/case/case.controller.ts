import {
    Body,
    Controller,
    Get,
    ParseIntPipe,
    Post,
    Redirect,
    Render,
    Req,
    UnprocessableEntityException,
    UseFilters,
    UseGuards,
} from '@nestjs/common';
import { User } from '../common/decorator/user.decorator';
import { FlashAndRedirectUserErrorFilter } from '../common/filter/flash-and-redirect-user-error.filter';
import { AuthenticatedGuard } from '../common/guard/authenticated.guard';
import { UserEntity } from '../user/user.entity';
import { CaseContentEntity } from './case-content.entity';
import { CaseTypeEntity } from './case-type.entity';
import { CaseTypeService } from './case-type.service';
import { CaseService } from './case.service';
import { SteamKeyCategoryEntity } from './steam-key/steam-key-category.entity';
import { SteamKeyService } from './steam-key/steam-key.service';
import Request = Express.Request;

@UseGuards(AuthenticatedGuard)
@Controller('case')
export class CaseController {
    public constructor(
        private readonly caseService: CaseService,
        private readonly caseTypeService: CaseTypeService,
        private readonly steamKeyService: SteamKeyService
    ) {}

    @Render('case')
    @Post('show')
    public async show(
        @Body('caseId', ParseIntPipe) caseId,
        @User() user: UserEntity
    ): Promise<{ caseId: number; caseContents: CaseContentEntity[]; steamKeyAvailable: boolean }> {
        const _case = await this.caseService.byIdAndUserIdOrFail(
            caseId,
            user.id,
            true,
            new UnprocessableEntityException()
        );

        if (_case.isOpened()) new UnprocessableEntityException();

        //For steamKeyAvailable we need to check every keyCategory in contents
        const steamKeyAvailable = await (async (): Promise<boolean> => {
            //Get all the unique categories
            const keyCategories = _case.type.contents.reduce((categories, content) => {
                if (content.keyCategory != null) {
                    categories.add(content.keyCategory);
                }

                return categories;
            }, new Set<SteamKeyCategoryEntity>());

            //Check if a key is available for each category
            for (const category of keyCategories) {
                if (!(await this.steamKeyService.hasAvailableKeyByCategory(category))) {
                    return false;
                }
            }

            return true;
        })();

        return {
            caseId: _case.id,
            caseContents: _case.type.contents,
            steamKeyAvailable,
        };
    }

    @Post('open')
    public async open(
        @Body('caseId', ParseIntPipe) caseId,
        @User() user: UserEntity
    ): Promise<{
        spin: Pick<CaseContentEntity, 'name' | 'color' | 'image'>[];
        winning: Pick<CaseContentEntity, 'name' | 'color' | 'image'>;
    }> {
        const _case = await this.caseService.byIdAndUserIdOrFail(
            caseId,
            user.id,
            true,
            new UnprocessableEntityException()
        );

        return this.caseService.openCase(_case, user);
    }

    @Render('case-shop')
    @Get('shop')
    public async shop(@Req() req: Request): Promise<{ error: any; caseTypes: CaseTypeEntity[] }> {
        return {
            error: req.flash('error'),
            caseTypes: await this.caseTypeService.getBuyableCaseTypes(),
        };
    }

    @Redirect('/inventory')
    @UseFilters(new FlashAndRedirectUserErrorFilter('/case/shop'))
    @Post('buy')
    public async buy(
        @Body('caseTypeId', ParseIntPipe) caseTypeId: number,
        @User() user: UserEntity,
        @Req() req: Request
    ): Promise<void> {
        await this.caseTypeService.buyCase(caseTypeId, user);

        req.flash('success', 'Caisse achetée !');
    }
}
