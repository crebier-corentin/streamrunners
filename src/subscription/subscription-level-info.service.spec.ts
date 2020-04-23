/* eslint-disable @typescript-eslint/ban-ts-ignore */
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SubscriptionLevelInfoEntity } from './subscription-level-info.entity';
import { SubscriptionLevelInfoService } from './subscription-level-info.service';
import { SubscriptionLevel } from './subscription.interfaces';

describe('SubscriptionLevelInfoService', () => {
    let service: SubscriptionLevelInfoService;
    let repo: Repository<SubscriptionLevelInfoEntity>;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                SubscriptionLevelInfoService,
                {
                    provide: getRepositoryToken(SubscriptionLevelInfoEntity),
                    useClass: Repository,
                },
            ],
        }).compile();

        service = module.get<SubscriptionLevelInfoService>(SubscriptionLevelInfoService);
        repo = module.get<Repository<SubscriptionLevelInfoEntity>>(getRepositoryToken(SubscriptionLevelInfoEntity));
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('onApplicationBootstrap', () => {
        it('it should throw if at least one SubscriptionLevelInfoEntity is missing', () => {
            return expect(service.onApplicationBootstrap()).rejects.toBeDefined();
        });

        it('it should load the place limits into placeCache', async () => {
            const expectedPlacesCache = new Map<SubscriptionLevel, number>();

            for (const level of Object.values(SubscriptionLevel)) {
                const info = new SubscriptionLevelInfoEntity();
                info.level = level;
                info.maxPlaces = Math.round(Math.random() * 10); //Random number for test

                jest.spyOn(repo, 'findOne').mockResolvedValueOnce(info);

                expectedPlacesCache.set(level, info.maxPlaces);
            }

            await service.onApplicationBootstrap();

            // @ts-ignore
            expect(service.placeCache).toEqual(expectedPlacesCache);
        });
    });

    describe('setPlaceLimit', () => {
        it.each([SubscriptionLevel.None, SubscriptionLevel.VIP, SubscriptionLevel.Diamond])(
            'should update the database and update placesCache',
            async lvl => {
                const mockedUpdate = jest.spyOn(repo, 'update').mockImplementation();

                await service.setPlaceLimit(lvl, 10);

                expect(mockedUpdate).toHaveBeenCalled();
                expect(service.getPlaceLimit(lvl));
            }
        );
    });
});
