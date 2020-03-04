import { ArgumentsHost, Catch, ExceptionFilter } from '@nestjs/common';
import { Response } from 'express';
import { UserErrorException } from '../exception/user-error.exception';

@Catch(UserErrorException)
export class JsonUserErrorFilter implements ExceptionFilter {
    public catch(exception: UserErrorException, host: ArgumentsHost): void {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();

        response.status(exception.getStatus()).json({
            title: exception.title,
            message: exception.message,
        });
    }
}
