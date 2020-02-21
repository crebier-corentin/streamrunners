import { UserEntity } from '../user/user.entity';
import { EntityService } from '../utils/entity-service';
import { AnnouncementEntity } from './announcement.entity';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class AnnouncementService extends EntityService<AnnouncementEntity> {
    public constructor(@InjectRepository(AnnouncementEntity) repo) {
        super(repo);
    }

    public current(): Promise<AnnouncementEntity | undefined> {
        return this.repo.findOne({ where: { active: true } });
    }

    public async disableCurrent(): Promise<void> {
        await this.repo
            .createQueryBuilder()
            .update()
            .set({ active: false })
            .where('active = true')
            .execute();
    }

    public async setNew(text: string, color: string, url: string, user: UserEntity): Promise<void> {
        await this.disableCurrent();

        const announcement = new AnnouncementEntity();
        announcement.text = text;
        announcement.color = color;
        announcement.url = url;
        announcement.active = true;
        announcement.createdBy = user;

        await this.repo.save(announcement);
    }
}
