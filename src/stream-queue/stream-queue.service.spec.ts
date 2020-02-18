import { DiscordBotService } from '../discord/discord-bot.service';
import { TwitchService } from '../twitch/twitch.service';
import { StreamQueueEntity } from './stream-queue.entity';
import { StreamQueueService } from './stream-queue.service';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

describe('StreamQueueService', () => {
    let service: StreamQueueService;
    let repo: Repository<StreamQueueEntity>;
    let twitch: TwitchService;
    let discord: DiscordBotService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                StreamQueueService,
                {
                    provide: getRepositoryToken(StreamQueueEntity),
                    useClass: Repository,
                },
                {
                    provide: TwitchService,
                    useValue: {},
                },
                {
                    provide: DiscordBotService,
                    useValue: { sendStreamNotificationMessage: jest.fn() },
                },
            ],
        }).compile();

        service = module.get<StreamQueueService>(StreamQueueService);
        repo = module.get<Repository<StreamQueueEntity>>(getRepositoryToken(StreamQueueEntity));
        twitch = module.get<TwitchService>(TwitchService);
        discord = module.get<DiscordBotService>(DiscordBotService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });
});
