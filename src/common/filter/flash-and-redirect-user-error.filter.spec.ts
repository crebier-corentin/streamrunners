import { UserErrorException } from '../exception/user-error.exception';
import { FlashAndRedirectUserErrorFilter } from './flash-and-redirect-user-error.filter';

class TestUserError extends UserErrorException {
    public errorTitle(): string {
        return '';
    }

    public errorMessage(): string {
        return 'test';
    }
}

describe('FlashUserErrorFilter', () => {
    it('should be defined', () => {
        expect(new FlashAndRedirectUserErrorFilter()).toBeDefined();
    });

    it('should flash the error message and redirect the user back', () => {
        const request = {
            flash: jest.fn(),
            originalUrl: '/test/example',
        };

        const response = {
            redirect: jest.fn(),
        };

        const host = {
            switchToHttp: jest.fn().mockReturnThis(),
            getRequest: jest.fn().mockReturnValue(request),
            getResponse: jest.fn().mockReturnValue(response),
        };

        new FlashAndRedirectUserErrorFilter().catch(new TestUserError(), host as any);

        expect(request.flash).toHaveBeenCalledWith('error', 'test');
        expect(response.redirect).toHaveBeenCalledWith('/test/example');
    });
});
