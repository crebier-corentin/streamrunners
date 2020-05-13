import { AdminGuard } from './admin.guard';

describe('AdminGuard', () => {
    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
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
        expect(new AdminGuard()).toBeDefined();
    });

    it('should block if the user is not a moderator or an admin', () => {
        expect(new AdminGuard().canActivate(getMockedContext({ admin: false, moderator: false }))).toBe(false);
    });

    it('should block if the user is a moderator', () => {
        expect(new AdminGuard().canActivate(getMockedContext({ admin: false, moderator: true }))).toBe(false);
    });

    it('should authorize if the user is an admin', () => {
        expect(new AdminGuard().canActivate(getMockedContext({ admin: true, moderator: false }))).toBe(true);
    });

    it('should block if the user is not logged in', () => {
        expect(new AdminGuard().canActivate(getMockedContext({ undefined }))).toBe(false);
    });
});
