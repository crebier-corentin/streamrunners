import { UserErrorException } from '../common/exception/user-error.exception';
import { UserEntity } from './user.entity';

/**
 * Exception thrown when the user tries to buy something but not being able to afford it.
 *
 * ```typescript
 * //Assuming user has only 400 points
 *
 * throw new NotEnoughPointsException(user, 500); //message = "Cela coûte 500 points et vous n'avez que 400 points."
 * throw new NotEnoughPointsException(user, 500, "La place"); //message = "La place coûte 500 points et vous n'avez que 400 points."
 * ```
 *
 * @category Exception
 *
 */
export class NotEnoughPointsException extends UserErrorException {
    /**
     *
     * @param user The user lacking enough points
     * @param cost The cost that the user can't afford
     * @param objectName The name of the product, added at the start of the [[message]].
     */
    public constructor(user: UserEntity, cost: number, objectName = 'Cela') {
        super(
            "Vous n'avez pas assez de points.",
            `${objectName} coûte ${cost} points et vous n'avez que ${user.points} points.`
        );
    }
}
