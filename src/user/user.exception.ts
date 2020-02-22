import { UserEntity } from './user.entity';

export class NotEnoughPointsException {
    public constructor(public readonly user: UserEntity, public readonly cost: number) {}
}
