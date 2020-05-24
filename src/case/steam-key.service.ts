import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { SelectQueryBuilder } from 'typeorm';
import { EntityService } from '../common/utils/entity-service';
import { SteamKeyEntity } from './steam-key.entity';

@Injectable()
export class SteamKeyService extends EntityService<SteamKeyEntity> {
    public constructor(@InjectRepository(SteamKeyEntity) repo) {
        super(repo);
    }

    public async add(name: string, code: string, category: string): Promise<void> {
        const key = new SteamKeyEntity();
        key.name = name;
        key.code = code;
        key.category = category;

        await this.repo.insert(key);
    }

    private availableKeyQuery(steamKeyTableAlias = 'key', caseTableAlias = 'case'): SelectQueryBuilder<SteamKeyEntity> {
        return this.repo
            .createQueryBuilder(steamKeyTableAlias)
            .leftJoin(`${steamKeyTableAlias}.case`, caseTableAlias)
            .where(`${caseTableAlias}.keyId IS NULL`);
    }

    private availableKeyQueryByCategory(
        category: string,
        steamKeyTableAlias = 'key',
        caseTableAlias = 'case'
    ): SelectQueryBuilder<SteamKeyEntity> {
        return this.availableKeyQuery(
            steamKeyTableAlias,
            caseTableAlias
        ).andWhere(`${steamKeyTableAlias}.category = :category`, { category });
    }

    public availableKeyCount(): Promise<number> {
        return this.availableKeyQuery().getCount();
    }

    public async hasAvailableKeyByCategory(category: string): Promise<boolean> {
        return (await this.availableKeyQueryByCategory(category).getCount()) > 0;
    }

    public getAvailableKeyByCategory(category: string): Promise<SteamKeyEntity | undefined> {
        return this.availableKeyQueryByCategory(category).getOne();
    }

    public async allCategories(): Promise<string[]> {
        const raw = await this.repo
            .createQueryBuilder('key')
            .select('key.category', 'category')
            .distinct(true)
            .getRawMany();
        return raw.map(k => k.category);
    }
}
