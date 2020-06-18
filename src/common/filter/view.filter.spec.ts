/* eslint-disable @typescript-eslint/ban-ts-ignore */
import fs = require('fs');
import { ArgumentsHost, NotFoundException } from '@nestjs/common';
import { ViewFilter } from './view.filter';

describe('ErrorViewFilter', () => {
    let host: ArgumentsHost & { render: () => void };

    beforeEach(() => {
        // @ts-ignore
        host = {
            switchToHttp: jest.fn().mockReturnThis(),
            getResponse: jest.fn().mockReturnThis(),
            status: jest.fn().mockReturnThis(),
            render: jest.fn(),
        } as ArgumentsHost;
    });

    it('should be defined', () => {
        jest.spyOn(fs, 'readdirSync').mockReturnValue([]);

        expect(new ViewFilter()).toBeDefined();
    });

    it('should render the error view corresponding to the http status code', () => {
        // @ts-ignore
        jest.spyOn(fs, 'readdirSync').mockReturnValue(['500.nunj', '404.nunj']);

        new ViewFilter().catch(new NotFoundException(), host);
        expect(host.render).toHaveBeenCalledWith('error/404');
    });

    it("should default to 500 if the specific error does't exist", () => {
        // @ts-ignore
        jest.spyOn(fs, 'readdirSync').mockReturnValue(['500.nunj']);

        new ViewFilter().catch(new NotFoundException(), host);
        expect(host.render).toHaveBeenCalledWith('error/500');
    });

    it('should default to 500 if the exception is not HttpException', () => {
        jest.spyOn(console, 'error').mockImplementation();
        // @ts-ignore
        jest.spyOn(fs, 'readdirSync').mockReturnValue(['500.nunj']);

        new ViewFilter().catch(new Error(), host);
        expect(host.render).toHaveBeenCalledWith('error/500');
    });
});
