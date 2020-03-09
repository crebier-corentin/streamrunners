import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PartnerEntity } from './partner.entity';
import { PartnerService } from './partner.service';

describe('PartnerService', () => {
    let service: PartnerService;
    let repo: Repository<PartnerEntity>;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                PartnerService,
                {
                    provide: getRepositoryToken(PartnerEntity),
                    useClass: Repository,
                },
            ],
        }).compile();

        service = module.get<PartnerService>(PartnerService);
        repo = module.get<Repository<PartnerEntity>>(getRepositoryToken(PartnerEntity));
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('add', () => {
        it('should create a new PartnerEntity', async () => {
            const spySave = jest.spyOn(repo, 'save').mockImplementation();

            await service.add('test', '/img/test', 'https://test.com');

            const expectedPartner = new PartnerEntity();
            expectedPartner.name = 'test';
            expectedPartner.image = '/img/test';
            expectedPartner.url = 'https://test.com';

            expect(spySave).toHaveBeenCalledWith(expectedPartner);
        });
    });
});
