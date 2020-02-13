import { StreamQueueService } from './stream-queue.service';
import { Test, TestingModule } from '@nestjs/testing';

describe('StreamQueueService', () => {
    let service: StreamQueueService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [StreamQueueService],
        }).compile();

        service = module.get<StreamQueueService>(StreamQueueService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });
});
