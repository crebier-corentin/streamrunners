import { readdirSync } from 'fs';
import { join } from 'path';
import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus } from '@nestjs/common';
import { Response } from 'express';
import { VIEW_DIR_PATH } from '../utils/constants';

/**
 * Catches all exceptions and renders a nunjucks view located in views/error/[status code].nunj.\
 * If the exception is not an HttpException, the 500 status is used.\
 * If the specific view doesn't exist, 500.nunj will be used instead.
 *
 * @remark
 * This filter is global.
 *
 * @category Filter
 *
 */
@Catch()
export class ViewFilter<T> implements ExceptionFilter {
    private readonly errorViews: Set<string>;

    public constructor() {
        const viewErrorDirPath = join(VIEW_DIR_PATH, 'error/');
        const files = readdirSync(viewErrorDirPath);

        //Remove the .nunj extension
        this.errorViews = new Set<string>(files.map(f => f.slice(0, -5)));
    }

    public catch(exception: T, host: ArgumentsHost): void {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();

        if (!(exception instanceof HttpException)) {
            console.error(exception);
        }

        const status = exception instanceof HttpException ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;

        //Default to 500.nunj if specific error page does not exist
        const view = this.errorViews.has(status.toString()) ? status.toString() : '500';
        response.status(status).render(`error/${view}`);
    }
}
