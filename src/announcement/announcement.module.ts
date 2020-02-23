import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AnnouncementEntity } from './announcement.entity';
import { AnnouncementService } from './announcement.service';

@Module({
    imports: [TypeOrmModule.forFeature([AnnouncementEntity])],
    providers: [AnnouncementService],
    exports: [AnnouncementService],
})
export class AnnouncementModule {}
