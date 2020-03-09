import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PartnerEntity } from './partner.entity';
import { PartnerService } from './partner.service';

@Module({
    imports: [TypeOrmModule.forFeature([PartnerEntity])],
    providers: [PartnerService],
    exports: [PartnerService],
})
export class PartnerModule {}
