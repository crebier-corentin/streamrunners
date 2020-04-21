import { HttpException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserErrorException } from '../common/exception/user-error.exception';
import { EntityService } from '../common/utils/entity-service';
import { UserEntity } from '../user/user.entity';
import { CaseContentEntity, CaseContentType } from './case-content.entity';
import { CaseContentService } from './case-content.service';
import { CaseTypeEntity } from './case-type.entity';
import { CaseEntity } from './case.entity';
import { SteamKeyService } from './steam-key.service';

@Injectable()
export class CaseService extends EntityService<CaseEntity> {
    public constructor(
        @InjectRepository(CaseEntity) repo,
        private readonly caseContentService: CaseContentService,
        private readonly steamKeyService: SteamKeyService
    ) {
        super(repo);
    }

    public byIdAndUserId(
        id: number,
        userId: number,
        loadTypeAndContentRelations: boolean
    ): Promise<CaseEntity | undefined> {
        const query = this.repo
            .createQueryBuilder('case')
            .leftJoin('case.user', 'user')
            .where('case.id = :id', { id })
            .andWhere('user.id = :userId', { userId });

        if (loadTypeAndContentRelations) {
            query.leftJoinAndSelect('case.type', 'type').leftJoinAndSelect('type.contents', 'contents');
        }

        return query.getOne();
    }

    public async byIdAndUserIdOrFail(
        id: number,
        userId: number,
        loadTypeAndContentRelations: boolean,
        exception: HttpException = new InternalServerErrorException()
    ): Promise<CaseEntity> {
        const entity = await this.byIdAndUserId(id, userId, loadTypeAndContentRelations);

        if (entity == undefined) {
            throw exception;
        }

        return entity;
    }

    private getRandomContent(contents: CaseContentEntity[]): CaseContentEntity {
        const weights = []; //Probabilities
        for (const content of contents) {
            weights.push(content.chance);
        }

        const num = Math.random() * 1000; //3 digit random number
        let s = 0;
        const lastIndex = weights.length - 1;

        for (let i = 0; i < lastIndex; ++i) {
            s += weights[i];
            if (num < s) {
                return contents[i];
            }
        }

        //Defaults to last content
        return contents[lastIndex];
    }

    public async openCase(
        _case: CaseEntity,
        user: UserEntity
    ): Promise<{
        spin: Pick<CaseContentEntity, 'name' | 'color' | 'image'>[];
        winning: Pick<CaseContentEntity, 'name' | 'color' | 'image'>;
    }> {
        if (_case.isOpened()) throw new UserErrorException('Caisse déjà ouverte.');

        const spin = [];

        //Generate spin
        for (let i = 0; i < 56; i++) {
            const content = await this.getRandomContent(_case.type.contents);
            spin.push({ name: content.name, color: content.color, image: content.image });
        }

        //Reload if no steam keys are available
        const steamKeyAvailable = await this.steamKeyService.hasAvailableKey();
        let winning: CaseContentEntity;
        do {
            winning = await this.getRandomContent(_case.type.contents);
        } while (!steamKeyAvailable && winning.contentType === CaseContentType.SteamKey);

        _case.content = winning;

        //Give prize
        await this.caseContentService.applyContent(_case, user);

        await this.save(_case);

        return { spin, winning: { name: winning.name, color: winning.color, image: winning.image } };
    }

    public async giveCase(type: CaseTypeEntity, user: UserEntity): Promise<void> {
        const _case = new CaseEntity();
        _case.type = type;
        _case.user = user;

        if (user.cases != undefined) user.cases.push(_case); //Otherwise _case will be deleted if user is saved

        await this.repo.save(_case);
    }
}
