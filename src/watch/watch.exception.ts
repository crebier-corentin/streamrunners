import { UserErrorException } from '../common/exception/user-error.exception';

export class StreamOfflineException extends UserErrorException {
    public errorTitle(): string {
        return 'Votre stream est hors-ligne.';
    }

    public errorMessage(): string {
        return `Votre stream doit être en ligne pour pouvoir vous ajouter dans la queue.`;
    }
}
