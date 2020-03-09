import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityService } from '../common/utils/entity-service';
import { PartnerEntity } from './partner.entity';

@Injectable()
export class PartnerService extends EntityService<PartnerEntity> {
    public constructor(@InjectRepository(PartnerEntity) repo) {
        super(repo);
    }

    public async add(name: string, image: string, url: string): Promise<void> {
        const partner = new PartnerEntity();
        partner.name = name;
        partner.image = image;
        partner.url = url;

        await this.repo.save(partner);
    }
}
