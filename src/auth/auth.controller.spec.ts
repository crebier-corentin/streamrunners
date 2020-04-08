import { Test, TestingModule } from '@nestjs/testing';
import { UserEntity } from '../user/user.entity';
import { UserService } from '../user/user.service';
import { AuthController } from './auth.controller';
import MockDate = require('mockdate');

describe('AuthController', () => {
    let controller: AuthController;
    let userService: UserService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                {
                    provide: UserService,
                    useValue: {
                        byId: jest.fn(),
                        byIdOrFail: jest.fn(),
                        save: jest.fn(),
                    },
                },
            ],
            controllers: [AuthController],
        }).compile();

        controller = module.get<AuthController>(AuthController);
        userService = module.get<UserService>(UserService);

        MockDate.reset();
    });

    describe('loginCallback', () => {
        it('should not update user.affiliatedTo if session.affiliateUserId is undefined', async () => {
            const user = new UserEntity();
            user.id = 1;
            user.affiliatedTo = null;

            await controller.loginCallback(user, {});

            expect(user.affiliatedTo).toBeNull();
        });

        it("should not update user.affiliatedTo if session.affiliateUserId is the same as the user's id", async () => {
            const user = new UserEntity();
            user.id = 1;
            user.affiliatedTo = null;

            await controller.loginCallback(user, { affiliateUserId: 1 });

            expect(user.affiliatedTo).toBeNull();
        });

        it('should not update user.affiliatedTo if the account was created more than one hour ago', async () => {
            const user = new UserEntity();
            user.id = 1;
            user.affiliatedTo = null;
            user.createdAt = new Date('2020-01-01 12:00:00');

            MockDate.set('2020-01-01 13:00:00');

            await controller.loginCallback(user, { affiliateUserId: 2 });

            expect(user.affiliatedTo).toBeNull();
        });

        it('should not update user.affiliatedTo if user.affiliateUserId is not null', async () => {
            const affiliate = new UserEntity();
            affiliate.id = 3;

            const user = new UserEntity();
            user.id = 1;
            user.affiliatedTo = affiliate;
            user.createdAt = new Date('2020-01-01 12:00:00');

            MockDate.set('2020-01-01 12:00:01');

            jest.spyOn(userService, 'byId').mockResolvedValue(user);

            await controller.loginCallback(user, { affiliateUserId: 2 });

            expect(user.affiliatedTo).toEqual(affiliate);
        });

        it('should update user.affiliatedTo', async () => {
            const affiliate = new UserEntity();
            affiliate.id = 2;

            const user = new UserEntity();
            user.id = 1;
            user.affiliatedTo = null;
            user.createdAt = new Date('2020-01-01 12:00:00');

            MockDate.set('2020-01-01 12:00:01');

            jest.spyOn(userService, 'byId').mockResolvedValue(user);
            jest.spyOn(userService, 'byIdOrFail').mockResolvedValue(affiliate);

            await controller.loginCallback(user, { affiliateUserId: 2 });

            expect(user.affiliatedTo).toEqual(affiliate);
        });
    });
});
