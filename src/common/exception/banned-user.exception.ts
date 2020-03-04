import { UserErrorException } from './user-error.exception';

export class BannedUserException extends UserErrorException {
    public constructor() {
        super('Vous avez été banni.', 403);
    }
}
