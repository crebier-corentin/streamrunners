import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityService } from '../common/utils/entity-service';
import { SteamKeyEntity } from './steam-key.entity';

@Injectable()
export class SteamKeyService extends EntityService<SteamKeyEntity> {
    public constructor(@InjectRepository(SteamKeyEntity) repo) {
        super(repo);
    }

    public async hasAvailableKey(): Promise<boolean> {
        return (
            (await this.repo
                .createQueryBuilder('key')
                .leftJoin('key.case', 'case')
                .where('case.keyId IS NULL')
                .getCount()) > 0
        );
    }

    public getAvailableKey(): Promise<SteamKeyEntity | undefined> {
        return this.repo
            .createQueryBuilder('key')
            .leftJoin('key.case', 'case')
            .where('case.keyId IS NULL')
            .getOne();
    }
}
