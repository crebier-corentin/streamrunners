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
import { SteamKeyCategoryEntity } from './steam-key/steam-key-category.entity';
import { SteamKeyCategoryService } from './steam-key/steam-key-category.service';
import { SteamKeyController } from './steam-key/steam-key.controller';
import { SteamKeyEntity } from './steam-key/steam-key.entity';
import { SteamKeyService } from './steam-key/steam-key.service';

@Module({
    imports: [
        TypeOrmModule.forFeature([
            CaseEntity,
            CaseTypeEntity,
            CaseContentEntity,
            SteamKeyEntity,
            SteamKeyCategoryEntity,
        ]),
        UserModule,
    ],
    providers: [CaseService, CaseTypeService, CaseContentService, SteamKeyService, SteamKeyCategoryService],
    controllers: [CaseController, SteamKeyController],
    exports: [CaseService, CaseTypeService, SteamKeyService, SteamKeyCategoryService],
})
export class CaseModule {}
