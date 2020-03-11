import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityService } from '../common/utils/entity-service';
import { UserEntity } from '../user/user.entity';
import { UserService } from '../user/user.service';
import { RaffleParticipationEntity } from './raffle-participation.entity';
import { RaffleEntity } from './raffle.entity';
import { RaffleService } from './raffle.service';

@Injectable()
export class RaffleParticipationService extends EntityService<RaffleParticipationEntity> {
    public constructor(
        @InjectRepository(RaffleParticipationEntity) repo,
        private readonly userService: UserService,
        @Inject(forwardRef(() => RaffleService))
        private readonly raffleService: RaffleService
    ) {
        super(repo);
    }

    public findForUserAndRaffle(
        user: UserEntity | number,
        raffle: RaffleEntity | number
    ): Promise<RaffleParticipationEntity | undefined> {
        const userId = user instanceof UserEntity ? user.id : user;
        const raffleId = raffle instanceof RaffleEntity ? raffle.id : raffle;

        return this.repo
            .createQueryBuilder('rp')
            .leftJoinAndSelect('rp.user', 'user')
            .leftJoinAndSelect('rp.raffle', 'raffle')
            .where('user.id = :userId', { userId })
            .andWhere('raffle.id = :raffleId', { raffleId })
            .getOne();
    }

    public async findOrCreate(
        user: UserEntity | number,
        raffle: RaffleEntity | number
    ): Promise<RaffleParticipationEntity> {
        let rp = await this.findForUserAndRaffle(user, raffle);

        //Create new RaffleParticipation
        if (rp == undefined) {
            rp = new RaffleParticipationEntity();

            //Relations
            rp.user = user instanceof UserEntity ? user : await this.userService.byId(user);
            rp.raffle = raffle instanceof RaffleEntity ? raffle : await this.raffleService.byIdOrFail(raffle);

            await this.repo.save(rp);
        }

        return rp;
    }
}
