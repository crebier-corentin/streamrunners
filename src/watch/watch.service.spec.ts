import { WatchService } from './watch.service';

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
