import { HttpException } from '@nestjs/common';

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
