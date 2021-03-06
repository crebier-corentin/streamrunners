/* eslint-disable @typescript-eslint/ban-ts-ignore */
import { ArgumentsHost } from '@nestjs/common';
import { UserErrorException } from '../exception/user-error.exception';
import { JsonUserErrorFilter } from './json-user-error.filter';

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
        new JsonUserErrorFilter().catch(new UserErrorException('Test', 'test'), host);
        expect(host.status).toHaveBeenCalledWith(422);
        expect(host.json).toHaveBeenCalledWith({ title: 'Test', message: 'test' });
    });
});
