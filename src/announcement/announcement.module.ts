import { AnnouncementEntity } from './announcement.entity';
import { AnnouncementService } from './announcement.service';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
    imports: [TypeOrmModule.forFeature([AnnouncementEntity])],
    providers: [AnnouncementService],
    exports: [AnnouncementService],
})
export class AnnouncementModule {}
