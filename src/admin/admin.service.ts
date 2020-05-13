import { Injectable } from '@nestjs/common';
import { UserErrorException } from '../common/exception/user-error.exception';
import { UserEntity } from '../user/user.entity';
import { UserService } from '../user/user.service';

@Injectable()
export class AdminService {
    public constructor(private readonly userService: UserService) {}

    public async ban(userId: number, bannedBy: UserEntity): Promise<void> {
        const user = await this.userService.byIdOrFail(
            userId,
            ['bannedBy'],
            new UserErrorException(`Impossible de trouver l'utilisateur.`)
        );

        //Can't ban moderator
        if (user.moderator) throw new UserErrorException('Impossible de bannir un modérateur.');
        //Can't ban someone banned already
        if (user.banned)
            throw new UserErrorException(
                `L'utilisateur a déjà été banni par ${user.bannedBy.username} (${user.banDate.toISOString()})`
            );

        await this.userService.ban(user, bannedBy);
    }

    public async toggleModerator(userId: number): Promise<void> {
        const user = await this.userService.byIdOrFail(
            userId,
            [],
            new UserErrorException(`Impossible de trouver l'utilisateur.`)
        );

        if (user.admin)
            throw new UserErrorException('Impossible de rajouter/enlever un administrateur des modérateurs.');

        user.moderator = !user.moderator;
        await this.userService.save(user);
    }
}
