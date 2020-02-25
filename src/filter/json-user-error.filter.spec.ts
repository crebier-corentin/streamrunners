/* eslint-disable @typescript-eslint/ban-ts-ignore */
import { ArgumentsHost } from '@nestjs/common';
import { UserError } from '../utils/user-error';
import { JsonUserErrorFilter } from './json-user-error.filter';

class TestUserError extends UserError {
    public errorTitle(): string {
        return 'Test';
    }

    public errorMessage(): string {
        return 'test';
    }
}

describe('UserErrorFilter', () => {
    let host: ArgumentsHost & { status: () => void; json: () => void };

    beforeEach(() => {
        // @ts-ignore
        host = {
            switchToHttp: jest.fn().mockReturnThis(),
            getResponse: jest.fn().mockReturnThis(),
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        } as ArgumentsHost;
    });

    it('should be defined', () => {
        expect(new JsonUserErrorFilter()).toBeDefined();
    });

    it('should return the error message with status code 422', () => {
        new JsonUserErrorFilter().catch(new TestUserError(), host);
        expect(host.status).toHaveBeenCalledWith(422);
        expect(host.json).toHaveBeenCalledWith({ title: 'Test', message: 'test' });
    });
});
