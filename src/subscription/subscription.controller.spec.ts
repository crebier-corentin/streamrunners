import { Test, TestingModule } from '@nestjs/testing';
import { UserEntity } from '../user/user.entity';
import { SubscriptionController } from './subscription.controller';
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

    describe('shop', () => {
        it('should return the error flash', () => {
            const req = {
                flash: jest.fn().mockReturnValue(['error1', 'error2']),
            };

            const res = controller.shop(req as any);
            expect(res.error).toEqual(['error1', 'error2']);
        });
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
