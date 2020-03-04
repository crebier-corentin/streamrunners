import { ArgumentsHost, Catch, ExceptionFilter } from '@nestjs/common';
import { Request, Response } from 'express';
import { UserErrorException } from '../exception/user-error.exception';

@Catch(UserErrorException)
export class FlashAndRedirectUserErrorFilter implements ExceptionFilter {
    public catch(exception: UserErrorException, host: ArgumentsHost): void {
        const ctx = host.switchToHttp();
        const request = ctx.getRequest<Request>();
        const response = ctx.getResponse<Response>();

        request.flash('error', exception.errorNonEmpty());

        response.redirect(request.originalUrl);
    }
}
