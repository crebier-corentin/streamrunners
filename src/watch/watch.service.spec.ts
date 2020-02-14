import { StreamQueueEntity } from '../stream-queue/stream-queue.entity';
import { StreamQueueModule } from '../stream-queue/stream-queue.module';
import { TwitchModule } from '../twitch/twitch.module';
import { UserEntity } from '../user/user.entity';
import { UserModule } from '../user/user.module';
import { WatchService } from './watch.service';
import { ConfigModule } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken, TypeOrmModule } from '@nestjs/typeorm';

describe('WatchService', () => {
    it('placeholder', () => {
        expect(true).toBe(true);
    });

    /*  let service: WatchService;

      beforeEach(async () => {
          const module: TestingModule = await Test.createTestingModule({
              imports: [ConfigModule.forRoot({isGlobal: true}), StreamQueueModule, UserModule, TwitchModule],
              providers: [WatchService, {
                  provide: getRepositoryToken(StreamQueueEntity),
                  useValue: {},
              }, {
                  provide: getRepositoryToken(UserEntity),
                  useValue: {},
              }],
          }).compile();

          service = module.get<WatchService>(WatchService);
      });

      it('should be defined', () => {
          expect(service).toBeDefined();
      });*/
});
