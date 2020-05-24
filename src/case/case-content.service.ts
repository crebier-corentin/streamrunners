import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityService } from '../common/utils/entity-service';
import { UserEntity } from '../user/user.entity';
import { UserService } from '../user/user.service';
import { CaseContentEntity } from './case-content.entity';
import { CaseEntity } from './case.entity';
import { SteamKeyService } from './steam-key.service';

@Injectable()
export class CaseContentService extends EntityService<CaseContentService> {
    public constructor(
        @InjectRepository(CaseContentEntity) repo,
        private readonly userService: UserService,
        private readonly steamKeyService: SteamKeyService
    ) {
        super(repo);
    }

    private async applyPrizePointsAndMeteores(content: CaseContentEntity, user: UserEntity): Promise<void> {
        await this.userService.changePointsSave(user, content.amountPoints);
        await this.userService.changeMeteoresSave(user, content.amountMeteores);
    }

    private async applySteamKey(_case: CaseEntity): Promise<void> {
        const key = await this.steamKeyService.getAvailableKeyByCategory(_case.content.keyCategory);
        if (key == undefined) throw new InternalServerErrorException();

        _case.key = key;
    }

    public applyContent(_case: CaseEntity, user: UserEntity): Promise<void> {
        return _case.content.keyCategory == null
            ? this.applyPrizePointsAndMeteores(_case.content, user)
            : this.applySteamKey(_case);
    }
}
