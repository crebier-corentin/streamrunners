import { StreamQueueEntity } from './stream-queue.entity';
import { StreamQueueService } from './stream-queue.service';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

describe('StreamQueueService', () => {
    let service: StreamQueueService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                StreamQueueService,
                {
                    provide: getRepositoryToken(StreamQueueEntity),
                    useValue: {},
                },
            ],
        }).compile();

        service = module.get<StreamQueueService>(StreamQueueService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });
});
