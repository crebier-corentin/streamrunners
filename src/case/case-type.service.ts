import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserErrorException } from '../common/exception/user-error.exception';
import { EntityService } from '../common/utils/entity-service';
import { UserEntity } from '../user/user.entity';
import { UserService } from '../user/user.service';
import { CaseTypeEntity } from './case-type.entity';
import { CaseService } from './case.service';

/**
 * Entity service for [[CaseTypeEntity]].
 *
 * @category Service
 */
@Injectable()
export class CaseTypeService extends EntityService<CaseTypeEntity> {
    public constructor(
        @InjectRepository(CaseTypeEntity) repo,
        private readonly caseService: CaseService,
        private readonly userService: UserService
    ) {
        super(repo);
    }

    /**
     * @returns All buyable case types to display in the shop.
     */
    public getBuyableCaseTypes(): Promise<CaseTypeEntity[]> {
        return this.repo
            .createQueryBuilder('type')
            .leftJoinAndSelect('type.contents', 'content')
            .where('type.buyable = TRUE')
            .orderBy('type.price', 'ASC')
            .addOrderBy('content.chance', 'DESC')
            .getMany();
    }

    /**
     * Buys a case in points and adds to the user's inventory.
     * Will throw if the case type is unknown, if the case type is not buyable or if the user can't afford the cas.
     *
     * @param caseTypeId [[CaseTypeEntity.id]] of the wanted case.
     * @param user User who wants to buy a case.
     */
    public async buyCase(caseTypeId: number, user: UserEntity): Promise<void> {
        const caseType = await this.byIdOrFail(caseTypeId, [], new UserErrorException('Type de caisse inconnu.', 404));

        //The case type must be buyable and the user must have enough points
        if (!caseType.buyable) throw new UserErrorException("Ce type de caisse n'est pas achetable.");
        if (!user.canAffordPoints(caseType.price))
            throw new UserErrorException("Vous n'avez pas assez de steamcoins pour acheter cette caisse.");

        await this.caseService.giveCase(caseType, user);
        await this.userService.changePointsSave(user, -caseType.price);
    }
}
