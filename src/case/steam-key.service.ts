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

    public async add(name: string, code: string): Promise<void> {
        const key = new SteamKeyEntity();
        key.name = name;
        key.code = code;

        await this.repo.insert(key);
    }

    private availableKeyQuery(steamKeyTableAlias = 'key', caseTableAlias = 'case'): SelectQueryBuilder<SteamKeyEntity> {
        return this.repo
            .createQueryBuilder(steamKeyTableAlias)
            .leftJoin(`${steamKeyTableAlias}.case`, caseTableAlias)
            .where(`${caseTableAlias}.keyId IS NULL`);
    }

    public availableKeyCount(): Promise<number> {
        return this.availableKeyQuery().getCount();
    }

    public async hasAvailableKey(): Promise<boolean> {
        return (await this.availableKeyCount()) > 0;
    }

    public getAvailableKey(): Promise<SteamKeyEntity | undefined> {
        return this.availableKeyQuery().getOne();
    }
}
