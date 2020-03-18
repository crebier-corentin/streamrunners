/* eslint-disable */
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity } from '../user/user.entity';
import { PaypalService } from './paypal.service';
import { SubscriptionEntity } from './subscription.entity';
import { SubscriptionLevel, SubscriptionStatus } from './subscription.interfaces';
import { SubscriptionService } from './subscription.service';
import MockDate = require('mockdate');

describe('SubscriptionService', () => {
    let service: SubscriptionService;
    let repo: Repository<SubscriptionEntity>;
    let paypal: PaypalService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                SubscriptionService,
                {
                    provide: getRepositoryToken(SubscriptionEntity),
                    useClass: Repository,
                },
                {
                    provide: PaypalService,
                    useValue: {},
                },
            ],
        }).compile();

        service = module.get<SubscriptionService>(SubscriptionService);
        repo = module.get<Repository<SubscriptionEntity>>(getRepositoryToken(SubscriptionEntity));
        paypal = module.get<PaypalService>(PaypalService);

        // @ts-ignore
        jest.spyOn(repo, 'save').mockImplementation(entity => entity);

        MockDate.reset();
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('getActiveSubscription', () => {
        const mockedGetOne = jest.fn();
        let user: UserEntity;
        let activeSub: SubscriptionEntity;
        let cancelledActiveSub: SubscriptionEntity;

        beforeEach(() => {
            jest.spyOn(repo, 'createQueryBuilder').mockReturnValue({
                leftJoin: jest.fn().mockReturnThis(),
                where: jest.fn().mockReturnThis(),
                andWhere: jest.fn().mockReturnThis(),
                getOne: mockedGetOne,
            } as any);

            user = new UserEntity();
            user.id = 1;

            activeSub = new SubscriptionEntity();
            activeSub.id = 1;
            activeSub.user = user;
            activeSub.status = SubscriptionStatus.Active;
            activeSub.level = SubscriptionLevel.VIP;
            activeSub.expires = null;

            cancelledActiveSub = new SubscriptionEntity();
            cancelledActiveSub.id = 2;
            cancelledActiveSub.user = user;
            cancelledActiveSub.status = SubscriptionStatus.CancelledActive;
            cancelledActiveSub.level = SubscriptionLevel.Diamond;
            cancelledActiveSub.expires = new Date('2020-02-01T12:00');
        });

        it('should return a subscription with the status Active if there is one', () => {
            mockedGetOne.mockResolvedValueOnce(activeSub);

            return expect(service.getActiveSubscription(user)).resolves.toEqual(activeSub);
        });

        it("should return a subscription with the status CancelledActive if there is no Active one and it's not expired", () => {
            mockedGetOne.mockResolvedValueOnce(undefined).mockResolvedValueOnce(cancelledActiveSub);
            MockDate.set('2020-01-01T12:00');

            return expect(service.getActiveSubscription(user)).resolves.toEqual(cancelledActiveSub);
        });

        it('should return null and update the status to Cancelled if there is no Active subscription and there is an expired CancelledActive', async () => {
            mockedGetOne.mockResolvedValueOnce(undefined).mockResolvedValueOnce(cancelledActiveSub);
            MockDate.set('2020-03-01T12:00');

            const sub = await service.getActiveSubscription(user);
            expect(sub).toBe(null);

            expect(cancelledActiveSub.status).toBe(SubscriptionStatus.Cancelled);
        });

        it('should return null if there are no Active or CancelledActive subscription', () => {
            mockedGetOne.mockResolvedValueOnce(undefined).mockResolvedValueOnce(undefined);

            return expect(service.getActiveSubscription(user)).resolves.toBe(null);
        });
    });
});
