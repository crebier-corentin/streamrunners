import { ArgumentsHost, Catch, ExceptionFilter } from '@nestjs/common';
import { Request, Response } from 'express';
import { UserErrorException } from '../exception/user-error.exception';

/**
 * Catches [[UserErrorException]], flashes the message into "error" and redirect the user.\
 * **Only** uses message.
 *
 * Example:
 * ```typescript
 * //In some controller
 *
 * @Get("view")
 * public example(@Req() req: Request): void {
 *     const errors = req.flash("error");
 *     //Display the errors if there are any to the user...
 * }
 *
 * @Post("Render")
 * @UseFilters(new FlashAndRedirectUserErrorFilter("/view"))
 * public example(@Req() req: Request): void {
 *     //Do something...
 *     if(condition) throw new UserErrorException("oops");
 * }
 * ```
 *
 * @Category Filter
 *
 */
@Catch(UserErrorException)
export class FlashAndRedirectUserErrorFilter implements ExceptionFilter {
    /**
     *
     * @param redirectUrl The url the user will be redirected to. (Full path starting with `/` needed.)
     */
    public constructor(private readonly redirectUrl: string) {}

    public catch(exception: UserErrorException, host: ArgumentsHost): void {
        const ctx = host.switchToHttp();
        const request = ctx.getRequest<Request>();
        const response = ctx.getResponse<Response>();

        request.flash('error', exception.message);

        response.redirect(this.redirectUrl);
    }
}
