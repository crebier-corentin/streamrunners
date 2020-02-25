export class UserError {
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
