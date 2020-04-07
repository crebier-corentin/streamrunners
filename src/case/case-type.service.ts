import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityService } from '../common/utils/entity-service';
import { CaseTypeEntity } from './case-type.entity';

@Injectable()
export class CaseTypeService extends EntityService<CaseTypeEntity> {
    public constructor(@InjectRepository(CaseTypeEntity) repo) {
        super(repo);
    }
}
