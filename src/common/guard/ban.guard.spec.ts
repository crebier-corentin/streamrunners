import { ExecutionContext } from '@nestjs/common';
import { UserEntity } from '../../user/user.entity';
import { BannedUserException } from '../exception/banned-user.exception';
import { BanGuard } from './ban.guard';

describe('BanGuard', () => {
    it('should be defined', () => {
        expect(new BanGuard()).toBeDefined();
    });

    it('should return true if the user is not authenticated', () => {
        const context = ({
            switchToHttp: jest.fn().mockReturnThis(),
            getRequest: jest.fn().mockReturnValue({ isAuthenticated: jest.fn().mockReturnValue(false) }),
        } as any) as ExecutionContext;

        expect(new BanGuard().canActivate(context)).toBe(true);
    });

    it('should return true if the user is not banned', () => {
        const context = ({
            switchToHttp: jest.fn().mockReturnThis(),
            getRequest: jest.fn().mockReturnValue({
                isAuthenticated: jest.fn().mockReturnValue(true),
                user: { bannedBy: null },
            }),
        } as any) as ExecutionContext;

        expect(new BanGuard().canActivate(context)).toBe(true);
    });

    it('should throw if the user is banned', () => {
        const context = ({
            switchToHttp: jest.fn().mockReturnThis(),
            getRequest: jest.fn().mockReturnValue({
                isAuthenticated: jest.fn().mockReturnValue(true),
                user: { bannedBy: new UserEntity() },
            }),
        } as any) as ExecutionContext;

        expect(() => {
            new BanGuard().canActivate(context);
        }).toThrow(BannedUserException);
    });
});
