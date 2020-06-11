import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { SelectQueryBuilder } from 'typeorm';
import { EntityService } from '../../common/utils/entity-service';
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
        private readonly categoryService: SteamKeyCategoryService
    ) {
        super(repo);
    }

    /**
     * Insert a new key.
     *
     * @param name [[SteamKeyEntity.name]]
     * @param code [[SteamKeyEntity.code]]
     * @param category [[SteamKeyCategoryEntity.name]]
     */
    public async add(name: string, code: string, category: string): Promise<void> {
        const key = new SteamKeyEntity();
        key.name = name;
        key.code = code;
        key.category = await this.categoryService.byNameOrFail(category);

        await this.repo.insert(key);
    }

    private availableKeyQuery(steamKeyTableAlias = 'key', caseTableAlias = 'case'): SelectQueryBuilder<SteamKeyEntity> {
        return this.repo
            .createQueryBuilder(steamKeyTableAlias)
            .leftJoin(`${steamKeyTableAlias}.case`, caseTableAlias)
            .where(`${caseTableAlias}.keyId IS NULL`);
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
}
