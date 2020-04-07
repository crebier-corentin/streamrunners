import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from '../user/user.module';
import { CaseContentEntity } from './case-content.entity';
import { CaseTypeEntity } from './case-type.entity';
import { CaseTypeService } from './case-type.service';
import { CaseController } from './case.controller';
import { CaseEntity } from './case.entity';
import { CaseService } from './case.service';

@Module({
    imports: [TypeOrmModule.forFeature([CaseEntity, CaseTypeEntity, CaseContentEntity]), UserModule],
    providers: [CaseService, CaseTypeService],
    controllers: [CaseController],
    exports: [CaseService, CaseTypeService],
})
export class CaseModule {}
