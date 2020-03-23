import { Test, TestingModule } from '@nestjs/testing';
import { Request, Response } from 'express';
import { UserEntity } from '../user/user.entity';
import { SubscriptionController } from './subscription.controller';
import { SubscriptionLevel } from './subscription.interfaces';
import { SubscriptionService } from './subscription.service';

describe('Subscription Controller', () => {
    let controller: SubscriptionController;
    let subService: SubscriptionService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                {
                    provide: SubscriptionService,
                    useValue: {
                        createSubscriptionAndGetRedirectUrl: jest.fn(),
                        cancelPending: jest.fn(),
                    },
                },
            ],
            controllers: [SubscriptionController],
        }).compile();

        controller = module.get<SubscriptionController>(SubscriptionController);
        subService = module.get<SubscriptionService>(SubscriptionService);
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    describe('index', () => {
        let req: Request;
        let res: Response;
        let user: UserEntity;

        beforeEach(() => {
            req = {
                flash: jest.fn((name: string) => {
                    switch (name) {
                        case 'success':
                            return ['success1', 'success2'];
                        case 'error':
                            return ['error1', 'error2'];
                    }
                }),
            } as any;

            res = {
                render: jest.fn(),
            } as any;

            user = new UserEntity();
        });

        it('should render shop if the user has no active subscription', () => {
            user.subscriptionLevel = SubscriptionLevel.None;

            controller.index(req, res, user);

            expect(res.render).toHaveBeenCalledWith('subscription/shop', {
                success: ['success1', 'success2'],
                error: ['error1', 'error2'],
            });
        });

        it.each([SubscriptionLevel.VIP, SubscriptionLevel.Diamond])(
            'should render shop if the user has an active subscription (%)',
            lvl => {
                user.subscriptionLevel = lvl;

                controller.index(req, res, user);

                expect(res.render).toHaveBeenCalledWith('subscription/info', {
                    success: ['success1', 'success2'],
                    error: ['error1', 'error2'],
                });
            }
        );
    });

    describe('buy', () => {
        it('should redirect to the url provided by SubscriptionService', async () => {
            jest.spyOn(subService, 'createSubscriptionAndGetRedirectUrl').mockResolvedValue(
                'https://www.paypal.com/webapps/billing/subscriptions?ba_token=BA-TEST'
            );

            const res = {
                redirect: jest.fn(),
            };
            await controller.buy('vip', new UserEntity(), res as any);

            expect(res.redirect).toHaveBeenCalledWith(
                'https://www.paypal.com/webapps/billing/subscriptions?ba_token=BA-TEST'
            );
        });
    });
});
