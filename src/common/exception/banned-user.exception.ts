import { UserErrorException } from './user-error.exception';

/**
 * Exception thrown by [[BanGuard]] when the user is banned.\
 * Caught by [[BanFilter]].
 *
 * @Category Exception
 */
export class BannedUserException extends UserErrorException {
    public constructor() {
        super('Vous avez été banni.', 403);
    }
}
