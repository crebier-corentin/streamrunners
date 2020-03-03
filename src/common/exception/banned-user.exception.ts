import { UserErrorException } from './user-error.exception';

export class BannedUserException extends UserErrorException {
    public constructor() {
        super(403);
    }

    public errorTitle(): string {
        return 'Vous avez été banni.';
    }
}
