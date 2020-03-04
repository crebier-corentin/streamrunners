import { UserErrorException } from '../common/exception/user-error.exception';
import { UserEntity } from './user.entity';

export class NotEnoughPointsException extends UserErrorException {
    public constructor(user: UserEntity, cost: number, objectName = 'Cela') {
        super(
            "Vous n'avez pas assez de points.",
            `${objectName} coûte ${cost} points et vous n'avez que ${user.points} points.`
        );
    }
}
