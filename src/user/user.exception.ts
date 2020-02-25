import { UserError } from '../utils/user-error';
import { UserEntity } from './user.entity';

export class NotEnoughPointsException extends UserError {
    public constructor(
        public readonly user: UserEntity,
        public readonly cost: number,
        public readonly objectName: string = 'Cela'
    ) {
        super();
    }

    public errorTitle(): string {
        return "Vous n'avez pas assez de points.";
    }

    public errorMessage(): string {
        return `${this.objectName} coûte ${this.cost} points et vous n'avez que ${this.user.points} points.`;
    }
}
