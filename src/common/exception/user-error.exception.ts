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
}
