import { UserEntity } from '../user/user.entity';
import { UserService } from '../user/user.service';
import { ModelService } from '../utils/ModelService';
import { RaffleParticipationEntity } from './raffle-participation.entity';
import { RaffleEntity } from './raffle.entity';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

export type RaffleEntityAndTotal = RaffleEntity & { total: number };
export type RaffleEntityAndTotalAndTicketCount = RaffleEntityAndTotal & { ticketCount: number };

@Injectable()
export class RaffleService extends ModelService<RaffleEntity> {
    constructor(
        @InjectRepository(RaffleEntity) repo,
        @InjectRepository(RaffleParticipationEntity) private readonly RPrepo: Repository<RaffleParticipationEntity>,
        private readonly userService: UserService
    ) {
        super(repo);
    }

    //Raffle Participation
    RPfindForUserAndRaffle(
        user: UserEntity | number,
        raffle: RaffleEntity | number
    ): Promise<RaffleParticipationEntity | undefined> {
        const userId = user instanceof UserEntity ? user.id : user;
        const raffleId = raffle instanceof RaffleEntity ? raffle.id : raffle;

        return this.RPrepo.createQueryBuilder('rp')
            .leftJoinAndSelect('rp.user', 'user')
            .leftJoinAndSelect('rp.raffle', 'raffle')
            .where('user.id = :userId', { userId })
            .andWhere('raffle.id = :raffleId', { raffleId })
            .getOne();
    }

    async RPfindOrCreate(user: UserEntity | number, raffle: RaffleEntity | number): Promise<RaffleParticipationEntity> {
        let rp = await this.RPfindForUserAndRaffle(user, raffle);

        //Create new RaffleParticipation
        if (rp == undefined) {
            rp = new RaffleParticipationEntity();

            //Relations
            rp.user = user instanceof UserEntity ? user : await this.userService.byId(user);
            rp.raffle = raffle instanceof RaffleEntity ? raffle : await this.repo.findOne(raffle);

            await this.RPrepo.save(rp);
        }

        return rp;
    }

    //Raffle
    async totalTickets(raffle: RaffleEntity): Promise<number> {
        return (
            await this.RPrepo.createQueryBuilder('rp')
                .select('SUM(rp.tickets)', 'sum')
                .where('rp.raffleId = :id', { id: raffle.id })
                .getRawOne()
        ).sum;
    }

    async active(): Promise<RaffleEntityAndTotal[]> {
        const { entities, raw } = await this.repo
            .createQueryBuilder('raffle')
            .leftJoin('raffle.participations', 'rp')
            .where('raffle.winnerId IS NULL')
            .andWhere('raffle.endingDate > NOW()')
            .addSelect('SUM(rp.tickets)', 'total')
            .groupBy('raffle.id')
            .getRawAndEntities();

        //Map total to entities
        let i = 0;
        return entities.map((e: RaffleEntityAndTotal) => {
            e.total = raw[i++].total ?? 0;
            return e;
        });
    }

    async activeAndTicketCount(user: UserEntity): Promise<RaffleEntityAndTotalAndTicketCount[]> {
        const raffles = await this.active();
        return Promise.all(
            raffles.map(async (r: RaffleEntityAndTotalAndTicketCount) => {
                r.ticketCount = (await this.RPfindForUserAndRaffle(user, r))?.tickets ?? 0; //Ticket count or 0 if none
                return r;
            })
        );
    }

    async endedAndNoWinner(): Promise<RaffleEntity[]> {
        return this.repo
            .createQueryBuilder('raffle')
            .where('raffle.winnerId IS NULL')
            .andWhere('raffle.endingDate <= NOW()')
            .getMany();
    }

    async pickWinner(raffle: RaffleEntity) {
        raffle.winner = await this.userService.pickRaffleWinner(raffle);
        await this.repo.save(raffle);
    }

    @Cron(CronExpression.EVERY_MINUTE)
    async pickWinners(): Promise<void> {
        const raffles = await this.endedAndNoWinner();
        await Promise.all(raffles.map(this.pickWinner.bind(this)));
    }

    ended(count = 5): Promise<RaffleEntity[]> {
        return this.repo
            .createQueryBuilder('raffle')
            .leftJoinAndSelect('raffle.winner', 'winner')
            .where('raffle.winnerId IS NOT NULL')
            .orderBy('raffle.createdAt', 'DESC')
            .limit(count)
            .getMany();
    }

    async buy(raffleId: number, user: UserEntity) {
        const raffle = await this.byIdOrFail(raffleId);
        //Assure that is active and can afford
        if (!raffle.isActive() || user.points < raffle.price) throw new InternalServerErrorException();

        const rp = await this.RPfindOrCreate(user, raffle);
        //Assure that user has less than max tickets
        if (raffle.maxTickets > 0 && rp.tickets === raffle.maxTickets) throw new InternalServerErrorException();

        //Pay and add ticket
        await this.userService.changePointsSave(user, -raffle.price);
        rp.tickets++;
        await this.RPrepo.save(rp);
    }
}
