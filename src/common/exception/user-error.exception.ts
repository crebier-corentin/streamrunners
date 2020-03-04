import { HttpException } from '@nestjs/common';

export class UserErrorException extends HttpException {
    public constructor(status = 422) {
        //For logging the correct http return code
        super('', status);
    }

    public errorTitle(): string {
        return '';
    }

    public errorMessage(): string {
        return '';
    }

    public errorFull(separator = '\n'): string {
        return this.errorTitle() + separator + this.errorMessage();
    }

    /**
     * Return errorTitle() if errorMessage() is empty,
     * errorMessage() if errorTitle() is empty,
     * Defaults to errorTitle() if both or none are not empty.
     */
    public errorNonEmpty(): string {
        const title = this.errorTitle();
        const message = this.errorMessage();

        if (title != '' && message != '') return title;
        //Both not empty
        else if (message != '') return message;
        //Only message not empty
        else return title; //Only title not empty or both empty
    }
}
