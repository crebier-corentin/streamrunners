import { UserError } from '../utils/user-error';

export class StreamOfflineException extends UserError {
    public errorTitle(): string {
        return 'Votre stream est hors-ligne.';
    }

    public errorMessage(): string {
        return `Votre stream doit être en ligne pour pouvoir vous ajouter dans la queue.`;
    }
}
