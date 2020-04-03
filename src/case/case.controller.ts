import { Body, Controller, ParseIntPipe, Post, Render, UnprocessableEntityException, UseGuards } from '@nestjs/common';
import { User } from '../common/decorator/user.decorator';
import { AuthenticatedGuard } from '../common/guard/authenticated.guard';
import { UserEntity } from '../user/user.entity';
import { CaseContentEntity } from './case-content.entity';
import { CaseService } from './case.service';

@UseGuards(AuthenticatedGuard)
@Controller('case')
export class CaseController {
    public constructor(private readonly caseService: CaseService) {}

    @Render('case')
    @Post('show')
    public async show(
        @Body('caseId', ParseIntPipe) caseId,
        @User() user: UserEntity
    ): Promise<{ caseId: number; caseContents: any[] }> {
        const _case = await this.caseService.byIdAndUserIdOrFail(
            caseId,
            user.id,
            true,
            new UnprocessableEntityException()
        );

        if (_case.isOpened()) new UnprocessableEntityException();

        return {
            caseId: _case.id,
            caseContents: _case.type.contents,
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
}
