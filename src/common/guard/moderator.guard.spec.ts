import { ModeratorGuard } from './moderator.guard';

describe('ModeratorGuard', () => {
    const getMockedContext = user => {
        return {
            switchToHttp: jest.fn().mockReturnThis(),
            getRequest: jest.fn().mockReturnValue({ user }),
            getClass: jest.fn().mockReturnThis(),
            getArgs: jest.fn().mockReturnThis(),
            getArgByIndex: jest.fn().mockReturnThis(),
            switchToRpc: jest.fn().mockReturnThis(),
            getHandler: jest.fn().mockReturnThis(),
            switchToWs: jest.fn().mockReturnThis(),
            getType: jest.fn().mockReturnThis(),
        };
    };

    it('should be defined', () => {
        expect(new ModeratorGuard()).toBeDefined();
    });

    it('should block if the user is not moderator', () => {
        expect(
            new ModeratorGuard().canActivate(
                getMockedContext({ moderator: false }),
            ),
        ).toBe(false);
    });

    it('should authorize if the user is moderator', () => {
        expect(
            new ModeratorGuard().canActivate(
                getMockedContext({ moderator: true }),
            ),
        ).toBe(true);
    });

    it('should block if the user is not logged in', () => {
        expect(
            new ModeratorGuard().canActivate(getMockedContext({ undefined })),
        ).toBe(false);
    });
});
