import { UserEntity } from '../user/user.entity';
import { EntityService } from '../utils/entity-service';
import { AnnouncementEntity } from './announcement.entity';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class AnnouncementService extends EntityService<AnnouncementEntity> {
    constructor(@InjectRepository(AnnouncementEntity) repo) {
        super(repo);
    }

    async current(): Promise<AnnouncementEntity | undefined> {
        return await this.repo.findOne({ where: { active: true } });
    }

    async disablePrevious() {
        await this.repo
            .createQueryBuilder()
            .update()
            .set({ active: false })
            .where('active = true')
            .execute();
    }

    async setNew(text: string, color: string, url: string, user: UserEntity) {
        await this.disablePrevious();

        const announcement = new AnnouncementEntity();
        announcement.text = text;
        announcement.color = color;
        announcement.url = url;
        announcement.active = true;
        announcement.createdBy = user;

        await this.repo.save(announcement);
    }
}
