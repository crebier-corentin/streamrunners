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
                        byUsernameOrFail: jest.fn(),
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

            jest.spyOn(userService, 'byUsernameOrFail').mockResolvedValue(user);
        });

        it('should fail if the user is a moderator', () => {
            user.moderator = true;

            expect(service.ban('a', bannedBy)).rejects.toBeInstanceOf(UserErrorException);
        });

        it('should fail if the user is already banned', () => {
            user.banned = true;
            user.bannedBy = bannedBy;
            user.banDate = new Date();

            expect(service.ban('a', bannedBy)).rejects.toBeInstanceOf(UserErrorException);
        });

        it('should ban the user', async () => {
            const spyBan = jest.spyOn(userService, 'ban');

            await service.ban('a', bannedBy);

            expect(spyBan).toHaveBeenCalledWith(user, bannedBy);
        });
    });
});
