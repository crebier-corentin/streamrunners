/* eslint-disable @typescript-eslint/ban-ts-ignore */
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity } from '../user/user.entity';
import { AnnouncementEntity } from './announcement.entity';
import { AnnouncementService } from './announcement.service';

describe('AnnouncementService', () => {
    let service: AnnouncementService;
    let repo: Repository<AnnouncementEntity>;
    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                AnnouncementService,
                {
                    provide: getRepositoryToken(AnnouncementEntity),
                    useClass: Repository,
                },
            ],
        }).compile();

        service = module.get<AnnouncementService>(AnnouncementService);
        repo = module.get<Repository<AnnouncementEntity>>(getRepositoryToken(AnnouncementEntity));
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('setNew', () => {
        it('should disable previous announcement and create a new active one', async () => {
            const mockedDisable = jest.spyOn(service, 'disableCurrent').mockResolvedValue();
            // @ts-ignore
            const mockedSave = jest.spyOn(repo, 'save').mockImplementation(entity => entity);

            const user = new UserEntity();
            user.id = 1;

            const expectedAnnouncement = new AnnouncementEntity();
            expectedAnnouncement.text = 'text';
            expectedAnnouncement.color = 'red';
            expectedAnnouncement.url = 'https://example';
            expectedAnnouncement.active = true;
            expectedAnnouncement.createdBy = user;

            await service.setNew('text', 'red', 'https://example', user);

            expect(mockedDisable).toHaveBeenCalled();
            expect(mockedSave).toHaveBeenCalledWith(expectedAnnouncement);
        });
    });
});
