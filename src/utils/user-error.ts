import { HttpException } from '@nestjs/common';

export class UserError extends HttpException {
    public constructor() {
        //For logging the correct http return code
        super('', 422);
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
