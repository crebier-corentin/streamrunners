import { ArgumentsHost, Catch, ExceptionFilter } from '@nestjs/common';
import { Response } from 'express';
import { UserError } from '../utils/user-error';

@Catch(UserError)
export class UserErrorFilter implements ExceptionFilter {
    public catch(exception: UserError, host: ArgumentsHost): void {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();

        response.status(422).json({
            message: exception.errorMessage(),
        });
    }
}
