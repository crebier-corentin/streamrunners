import { Test, TestingModule } from '@nestjs/testing';
import { UserErrorException } from '../common/exception/user-error.exception';
import { UserEntity } from '../user/user.entity';
import { UserService } from '../user/user.service';
import { AdminService } from './admin.service';

describe('AdminService', () => {
    let service: AdminService;
    let userService: UserService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                AdminService,
                {
                    provide: UserService,
                    useValue: {
                        byIdOrFail: jest.fn(),
                        save: jest.fn(),
                        ban: jest.fn(),
                    },
                },
            ],
        }).compile();

        service = module.get<AdminService>(AdminService);
        userService = module.get<UserService>(UserService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('ban', () => {
        let bannedBy: UserEntity;
        let user: UserEntity;

        beforeEach(() => {
            bannedBy = new UserEntity();
            bannedBy.username = 'b';
            bannedBy.moderator = true;

            user = new UserEntity();
            user.username = 'a';
            user.moderator = false;

            user.banned = false;
            user.bannedBy = null;
            user.banDate = null;

            jest.spyOn(userService, 'byIdOrFail').mockResolvedValue(user);
        });

        it('should fail if the user is a moderator', () => {
            user.moderator = true;

            expect(service.ban(1, bannedBy)).rejects.toBeInstanceOf(UserErrorException);
        });

        it('should fail if the user is already banned', () => {
            user.banned = true;
            user.bannedBy = bannedBy;
            user.banDate = new Date();

            expect(service.ban(1, bannedBy)).rejects.toBeInstanceOf(UserErrorException);
        });

        it('should ban the user', async () => {
            const spyBan = jest.spyOn(userService, 'ban');

            await service.ban(1, bannedBy);

            expect(spyBan).toHaveBeenCalledWith(user, bannedBy);
        });
    });

    describe('toggleModerator', () => {
        it('should set moderator to false if the current value is true', async () => {
            const user = new UserEntity();
            user.id = 1;
            user.admin = false;
            user.moderator = false;

            jest.spyOn(userService, 'byIdOrFail').mockResolvedValue(user);

            await service.toggleModerator(1);

            expect(user.moderator).toBe(true);
        });

        it('should set moderator to true if the current value is false', async () => {
            const user = new UserEntity();
            user.id = 1;
            user.admin = false;
            user.moderator = true;

            jest.spyOn(userService, 'byIdOrFail').mockResolvedValue(user);

            await service.toggleModerator(1);

            expect(user.moderator).toBe(false);
        });

        it('should throw if the user if an admin', () => {
            const user = new UserEntity();
            user.id = 1;
            user.admin = true;
            user.moderator = true;

            jest.spyOn(userService, 'byIdOrFail').mockResolvedValue(user);

            expect(service.toggleModerator(1)).rejects.toBeInstanceOf(UserErrorException);
        });
    });
});
