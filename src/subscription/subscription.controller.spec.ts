import { Test, TestingModule } from '@nestjs/testing';
import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { UserEntity } from '../user/user.entity';
import { SubscriptionController } from './subscription.controller';
import { SubscriptionEntity } from './subscription.entity';
import { SubscriptionService } from './subscription.service';

jest.mock('uuid');

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
        let session;
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

            session = {};

            user = new UserEntity();

            //Mock uuid
            uuidv4.mockReturnValue('test-uuid');
        });

        it('should set session.createSubscriptionKey and render shop if the user has no active subscription', () => {
            user.currentSubscription = undefined;

            controller.index(req, res, session, user);

            expect(res.render).toHaveBeenCalledWith('subscription/shop', {
                success: ['success1', 'success2'],
                error: ['error1', 'error2'],
            });
            expect(session.createSubscriptionKey).toBe('test-uuid');
        });

        it('should render shop if the user has an active subscription', () => {
            user.currentSubscription = new SubscriptionEntity();
            user.currentSubscription.isActive = jest.fn().mockReturnValue(true);

            controller.index(req, res, session, user);

            expect(res.render).toHaveBeenCalledWith('subscription/info', {
                success: ['success1', 'success2'],
                error: ['error1', 'error2'],
            });
            expect(session.createSubscriptionKey).toBe(undefined);
        });
    });

    describe('buy', () => {
        it('should redirect to the url provided by SubscriptionService', async () => {
            const mockedCreate = jest
                .spyOn(subService, 'createSubscriptionAndGetRedirectUrl')
                .mockResolvedValue('https://www.paypal.com/webapps/billing/subscriptions?ba_token=BA-TEST');

            const res = {
                redirect: jest.fn(),
            };
            const session = { createSubscriptionKey: 'example-id' };
            const user = new UserEntity();
            user.id = 1;

            await controller.buy('vip', res as any, session, user);

            expect(res.redirect).toHaveBeenCalledWith(
                'https://www.paypal.com/webapps/billing/subscriptions?ba_token=BA-TEST'
            );
            expect(mockedCreate).toHaveBeenCalledWith(user, 'vip', 'example-id');
        });
    });
});
