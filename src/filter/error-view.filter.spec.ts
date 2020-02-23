/* eslint-disable @typescript-eslint/ban-ts-ignore */
import { ArgumentsHost, NotFoundException } from '@nestjs/common';
import { ErrorViewFilter } from './error-view.filter';
import fs = require('fs');

describe('ErrorViewFilter', () => {
    let host: ArgumentsHost & { render: () => void };

    beforeEach(() => {
        // @ts-ignore
        host = {
            switchToHttp: jest.fn().mockReturnThis(),
            getResponse: jest.fn().mockReturnThis(),
            render: jest.fn(),
        } as ArgumentsHost;
    });

    it('should be defined', () => {
        jest.spyOn(fs, 'readdirSync').mockReturnValue([]);

        expect(new ErrorViewFilter()).toBeDefined();
    });

    it('should render the error view corresponding to the http status code', () => {
        // @ts-ignore
        jest.spyOn(fs, 'readdirSync').mockReturnValue(['500.nunj', '404.nunj']);

        new ErrorViewFilter().catch(new NotFoundException(), host);
        expect(host.render).toHaveBeenCalledWith('error/404');
    });

    it("should default to 500 if the specific error does't exist", () => {
        // @ts-ignore
        jest.spyOn(fs, 'readdirSync').mockReturnValue(['500.nunj']);

        new ErrorViewFilter().catch(new NotFoundException(), host);
        expect(host.render).toHaveBeenCalledWith('error/500');
    });

    it('should default to 500 if the exception is not HttpException', () => {
        // @ts-ignore
        jest.spyOn(fs, 'readdirSync').mockReturnValue(['500.nunj']);

        new ErrorViewFilter().catch(new Error(), host);
        expect(host.render).toHaveBeenCalledWith('error/500');
    });
});
