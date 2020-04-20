import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from '../user/user.module';
import { CaseContentEntity } from './case-content.entity';
import { CaseContentService } from './case-content.service';
import { CaseTypeEntity } from './case-type.entity';
import { CaseTypeService } from './case-type.service';
import { CaseController } from './case.controller';
import { CaseEntity } from './case.entity';
import { CaseService } from './case.service';
import { SteamKeyEntity } from './steam-key.entity';
import { SteamKeyService } from './steam-key.service';

@Module({
    imports: [TypeOrmModule.forFeature([CaseEntity, CaseTypeEntity, CaseContentEntity, SteamKeyEntity]), UserModule],
    providers: [CaseService, CaseTypeService, CaseContentService, SteamKeyService],
    controllers: [CaseController],
    exports: [CaseService, CaseTypeService, SteamKeyService],
})
export class CaseModule {}
