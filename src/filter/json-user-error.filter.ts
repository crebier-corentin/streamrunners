import { ArgumentsHost, Catch, ExceptionFilter } from '@nestjs/common';
import { Response } from 'express';
import { UserError } from '../utils/user-error';

@Catch(UserError)
export class JsonUserErrorFilter implements ExceptionFilter {
    public catch(exception: UserError, host: ArgumentsHost): void {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();

        response.status(422).json({
            title: exception.errorTitle(),
            message: exception.errorMessage(),
        });
    }
}
