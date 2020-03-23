/* eslint-disable */
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity } from '../user/user.entity';
import { PaypalService } from './paypal.service';
import { SubscriptionEntity } from './subscription.entity';
import { SubscriptionLevel } from './subscription.interfaces';
import { SubscriptionService } from './subscription.service';
import { ConfigService } from '@nestjs/config';
import { UserErrorException } from '../common/exception/user-error.exception';
import { HttpException } from '@nestjs/common';
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
                    useValue: {
                        getSubscriptionDetails: jest.fn(),
                        createSubscription: jest.fn(),
                    },
                },
                {
                    provide: ConfigService,
                    useValue: {
                        get: jest.fn((key: string) => {
                            switch (key) {
                                case 'VIP_PLAN_ID':
                                    return 'P-VIP';
                                case 'DIAMOND_PLAN_ID':
                                    return 'P-DIAMOND';
                                case 'HOSTNAME':
                                    return 'https://example.com';
                            }
                        }),
                    },
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

    describe.each([
        [SubscriptionLevel.VIP, 'P-VIP'],
        [SubscriptionLevel.Diamond, 'P-DIAMOND'],
    ])('createSubscriptionAndGetRedirectUrl (%s)', (lvl, planId) => {
        let user: UserEntity;

        beforeEach(() => {
            user = new UserEntity();
            user.id = 1;
        });

        it('should throw if type is not VIP or Diamond', () => {
            return expect(service.createSubscriptionAndGetRedirectUrl(user, 'none')).rejects.toBeInstanceOf(
                UserErrorException
            );
        });

        it('should throw if the user already has an active subscription', () => {
            const sub = new SubscriptionEntity();
            sub.details = {
                status: 'ACTIVE',
            };
            jest.spyOn(service, 'getCurrentSubscription').mockResolvedValue(sub);

            return expect(service.createSubscriptionAndGetRedirectUrl(user, lvl)).rejects.toBeInstanceOf(
                UserErrorException
            );
        });

        it('should create a paypal subscription with the correct plan, save it to the database and the return the approve url', async () => {
            jest.spyOn(service, 'getCurrentSubscription').mockResolvedValue(undefined);
            const mockPaypal = jest.spyOn(paypal, 'createSubscription').mockResolvedValue({
                id: 'SUB-TEST',
                status: 'APPROVAL_PENDING',
                links: [
                    {
                        href: 'https://www.paypal.com/webapps/billing/subscriptions?ba_token=BA-TEST',
                        rel: 'approve',
                        method: 'GET',
                    },
                    {
                        href: 'https://api.paypal.com/v1/billing/subscriptions/SUB-TEST',
                        rel: 'edit',
                        method: 'PATCH',
                    },
                    {
                        href: 'https://api.paypal.com/v1/billing/subscriptions/SUB-TEST',
                        rel: 'self',
                        method: 'GET',
                    },
                ],
            });
            const mockSave = jest.spyOn(repo, 'save');

            const url = await service.createSubscriptionAndGetRedirectUrl(user, lvl);

            const paypalArg = mockPaypal.mock.calls[0][0];
            expect(paypalArg.plan_id).toBe(planId);
            expect(paypalArg.application_context.return_url).toBe('https://example.com/subscription/paypal/return');
            expect(paypalArg.application_context.cancel_url).toBe('https://example.com/subscription/paypal/cancel');

            const expectedSub = new SubscriptionEntity();
            expectedSub.paypalId = 'SUB-TEST';
            expectedSub.user = user;
            expectedSub.level = lvl;
            expectedSub.current = true;
            expect(mockSave).toHaveBeenCalledWith(expectedSub);

            expect(url).toBe('https://www.paypal.com/webapps/billing/subscriptions?ba_token=BA-TEST');
        });
    });

    describe('cancelPending', () => {
        let user: UserEntity;

        beforeEach(() => {
            user = new UserEntity();
            user.id = 1;
        });

        it("should throw if the subscription doesn't exist", () => {
            jest.spyOn(repo, 'findOne').mockResolvedValue(undefined);

            return expect(service.cancelPending(user, '404')).rejects.toBeInstanceOf(HttpException);
        });

        it("should throw if the subscription doesn't belong to the user", () => {
            const sub = new SubscriptionEntity();
            sub.user = new UserEntity();
            sub.user.id = 2;
            jest.spyOn(repo, 'findOne').mockResolvedValue(sub);

            return expect(service.cancelPending(user, 'SUB-TEST')).rejects.toBeInstanceOf(HttpException);
        });

        it('should throw if the subscription is active', () => {
            const sub = new SubscriptionEntity();
            sub.user = new UserEntity();
            sub.user.id = 1;
            sub.details = { status: 'ACTIVE' };
            jest.spyOn(repo, 'findOne').mockResolvedValue(sub);

            return expect(service.cancelPending(user, 'SUB-TEST')).rejects.toBeInstanceOf(HttpException);
        });

        it('should set current to false', async () => {
            const sub = new SubscriptionEntity();
            sub.user = new UserEntity();
            sub.user.id = 1;
            sub.details = { status: 'APPROVAL_PENDING' };
            jest.spyOn(repo, 'findOne').mockResolvedValue(sub);

            await service.cancelPending(user, 'SUB-TEST');

            expect(sub.current).toBe(false);
        });
    });
});
