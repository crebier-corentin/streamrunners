import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { SelectQueryBuilder } from 'typeorm';
import { UserErrorException } from '../../common/exception/user-error.exception';
import { EntityService } from '../../common/utils/entity-service';
import { UserEntity } from '../../user/user.entity';
import { UserService } from '../../user/user.service';
import { SteamKeyCategoryEntity } from './steam-key-category.entity';
import { SteamKeyCategoryService } from './steam-key-category.service';
import { SteamKeyEntity } from './steam-key.entity';

/**
 * Entity service for [[SteamKeyEntity]].
 *
 * @category Service
 *
 */
@Injectable()
export class SteamKeyService extends EntityService<SteamKeyEntity> {
    public constructor(
        @InjectRepository(SteamKeyEntity) repo,
        private readonly categoryService: SteamKeyCategoryService,
        private readonly userService: UserService
    ) {
        super(repo);
    }

    /**
     * Insert a new key.
     *
     * @param name [[SteamKeyEntity.name]]
     * @param code [[SteamKeyEntity.code]]
     * @param category [[SteamKeyCategoryEntity.id]]
     */
    public async add(name: string, code: string, category: number): Promise<void> {
        const key = new SteamKeyEntity();
        key.name = name;
        key.code = code;
        key.category = await this.categoryService.byIdOrFail(category);

        await this.repo.insert(key);
    }

    private availableKeyQuery(steamKeyTableAlias = 'key', caseTableAlias = 'case'): SelectQueryBuilder<SteamKeyEntity> {
        return this.repo
            .createQueryBuilder(steamKeyTableAlias)
            .leftJoin(`${steamKeyTableAlias}.case`, caseTableAlias)
            .where(`${caseTableAlias}.keyId IS NULL`)
            .andWhere(`${steamKeyTableAlias}.userId IS NULL`);
    }

    private availableKeyQueryByCategory(
        category: SteamKeyCategoryEntity,
        steamKeyTableAlias = 'key',
        caseTableAlias = 'case',
        categoryTableAlias = 'category'
    ): SelectQueryBuilder<SteamKeyEntity> {
        return this.availableKeyQuery(steamKeyTableAlias, caseTableAlias)
            .leftJoin(`${steamKeyTableAlias}.category`, categoryTableAlias)
            .andWhere(`${categoryTableAlias}.id = :categoryId`, { categoryId: category.id });
    }

    /**
     * @returns The number of keys available.
     */
    public availableKeyCount(): Promise<number> {
        return this.availableKeyQuery().getCount();
    }

    /**
     *
     * @param category
     *
     * @returns If there is an available key of the wanted category.
     */
    public async hasAvailableKeyByCategory(category: SteamKeyCategoryEntity): Promise<boolean> {
        return (await this.availableKeyQueryByCategory(category).getCount()) > 0;
    }

    /**
     * Use [[hasAvailableKeyByCategory]] to check if a key is available.
     *
     * @param category
     *
     * @returns An available key of the wanted category or undefined if none are available.
     */
    public getAvailableKeyByCategory(category: SteamKeyCategoryEntity): Promise<SteamKeyEntity | undefined> {
        return this.availableKeyQueryByCategory(category).getOne();
    }

    /**
     * Gives a key to a user.
     *
     * @remark
     * Will throw if the key already belongs to a case or user.
     *
     * @param user User to give the key to.
     * @param key Key to give.
     */
    public async giveKey(user: UserEntity, key: SteamKeyEntity): Promise<void> {
        if (key.case != null || key.user != null) {
            throw new InternalServerErrorException('La clé appartient déjà à un autre utilisateur ou caisse.');
        }

        //Set relations in entities
        user.keys?.push(key);
        key.user = user;

        await this.repo.save(key);
    }

    /**
     * Buys a key in points and gives it to the user's inventory.\
     * Will throw if the key category is not buyable, if the user can't afford a key or if no keys of this category are available.
     *
     * @param user User wants to buy the key.
     * @param category Category of the key to buy.
     */
    public async buyKey(user: UserEntity, category: SteamKeyCategoryEntity): Promise<void> {
        if (!category.buyable) throw new UserErrorException("Ce type de clé n'est pas achetable.");
        if (!user.canAffordPoints(category.cost))
            throw new UserErrorException("Vous n'avez pas assez de steamcoins pour acheter cette clé.");

        const key = await this.getAvailableKeyByCategory(category);
        if (key == undefined) throw new UserErrorException('Aucune clé disponible.');

        await this.userService.changePointsSave(user, -category.cost);

        await this.giveKey(user, key);
    }
}
