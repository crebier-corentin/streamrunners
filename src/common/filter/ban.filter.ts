import { ArgumentsHost, Catch, ExceptionFilter } from '@nestjs/common';
import { Response } from 'express';
import { BannedUserException } from '../exception/banned-user.exception';

/**
 * Catches [[BannedUserException]]. Thrown by [[BanGuard]].\
 * Renders view/error/ban.nunj.
 *
 * @remark
 * This filter is global.
 *
 * @category Filter
 */
@Catch(BannedUserException)
export class BanFilter<T> implements ExceptionFilter {
    public catch(exception: BannedUserException, host: ArgumentsHost): void {
        const response = host.switchToHttp().getResponse<Response>();

        response.status(403).render('error/ban');
    }
}
