import { HttpException } from '@nestjs/common';

/**
 * Exception used to represent an error that should be displayed to the user.\
 * Be it via json using [[JsonUserErrorFilter]] or flashing the error with [[FlashAndRedirectUserErrorFilter]].
 *
 * [[JsonUserErrorFilter]] uses both [[title]] and [[message]].\
 * [[FlashAndRedirectUserErrorFilter]] **only** uses [[message]].
 *
 * ```typescript
 * new UserErrorException("message"); //message == "message" and status == 422
 * new UserErrorException("message", 400); //message == "message" and status == 400
 * new UserErrorException("title", "message"); //title == "title", message == "message" and status == 422
 * new UserErrorException("title", "message", 400); //title == "title", message == "message" and status == 400
 * ```
 *
 * @category Exception
 *
 */
export class UserErrorException extends HttpException {
    public readonly title: string | null;

    public constructor(title: string, message: string, status: number);
    public constructor(title: string, message: string);
    public constructor(message: string, status: number);
    public constructor(message: string);
    public constructor(
        titleOrMessage: string,
        messageOrStatus: string | number = 422,
        statusOrUndefined: number | undefined = 422
    ) {
        let title;
        let message;
        let status;

        //(title: string, message: string, status: number)
        if (typeof messageOrStatus == 'string') {
            title = titleOrMessage;
            message = messageOrStatus;
            status = statusOrUndefined;
        }
        //(message: string, status: number)
        else {
            title = '';
            message = titleOrMessage;
            status = messageOrStatus;
        }

        super(message, status);
        this.title = title;
    }
}
