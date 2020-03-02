import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DiscordBotService } from '../discord/discord-bot.service';
import { UserEntity } from '../user/user.entity';
import { NotEnoughPointsException } from '../user/user.exception';
import { UserService } from '../user/user.service';
import { EntityService } from '../utils/entity-service';
import { RaffleParticipationEntity } from './raffle-participation.entity';
import { RaffleEntity, RaffleEntityExtra } from './raffle.entity';

@Injectable()
export class RaffleService extends EntityService<RaffleEntity> {
    public constructor(
        @InjectRepository(RaffleEntity) repo,
        @InjectRepository(RaffleParticipationEntity) private readonly RPrepo: Repository<RaffleParticipationEntity>,
        private readonly userService: UserService,
        private readonly discordBot: DiscordBotService
    ) {
        super(repo);
    }

    //Raffle Participation
    private RPfindForUserAndRaffle(
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

    private async RPfindOrCreate(
        user: UserEntity | number,
        raffle: RaffleEntity | number
    ): Promise<RaffleParticipationEntity> {
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
    public async totalTickets(raffle: RaffleEntity): Promise<number> {
        return (
            await this.RPrepo.createQueryBuilder('rp')
                .select('SUM(rp.tickets)', 'sum')
                .where('rp.raffleId = :id', { id: raffle.id })
                .getRawOne()
        ).sum;
    }

    private async active(): Promise<RaffleEntityExtra[]> {
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
        return entities.map((e: RaffleEntityExtra) => {
            e.totalTickets = raw[i++].total ?? 0;
            return e;
        });
    }

    public async activeAndTicketCount(user: UserEntity): Promise<RaffleEntityExtra[]> {
        const raffles = await this.active();
        return Promise.all(
            raffles.map(async (r: RaffleEntityExtra) => {
                r.userTickets = (await this.RPfindForUserAndRaffle(user, r))?.tickets ?? 0; //Ticket count or 0 if none
                return r;
            })
        );
    }

    private async endedAndNoWinner(): Promise<RaffleEntity[]> {
        return this.repo
            .createQueryBuilder('raffle')
            .where('raffle.winnerId IS NULL')
            .andWhere('raffle.endingDate <= NOW()')
            .getMany();
    }

    private async pickWinner(raffle: RaffleEntity): Promise<void> {
        raffle.winner = await this.userService.pickRaffleWinner(raffle);
        await this.repo.save(raffle);
    }

    @Cron(CronExpression.EVERY_MINUTE)
    private async pickWinners(): Promise<void> {
        const raffles = await this.endedAndNoWinner();
        await Promise.all(raffles.map(this.pickWinner.bind(this)));
    }

    public ended(count = 5): Promise<RaffleEntity[]> {
        return this.repo
            .createQueryBuilder('raffle')
            .leftJoinAndSelect('raffle.winner', 'winner')
            .where('raffle.winnerId IS NOT NULL')
            .orderBy('raffle.createdAt', 'DESC')
            .limit(count)
            .getMany();
    }

    public async buy(raffleId: number, amount: number, user: UserEntity): Promise<void> {
        //Assure that amount is superior to 0
        if (amount <= 0) throw new InternalServerErrorException();

        const raffle = await this.byIdOrFail(raffleId);
        //Assure that is active and can afford
        if (!raffle.isActive()) throw new InternalServerErrorException();
        if (!user.canAfford(raffle.price * amount)) throw new NotEnoughPointsException(user, raffle.price, 'Le ticket');

        const rp = await this.RPfindOrCreate(user, raffle);
        //Assure that user has less than max tickets
        if (raffle.maxTickets > 0 && rp.tickets + amount > raffle.maxTickets) throw new InternalServerErrorException();

        //Pay and add ticket
        await this.userService.changePointsSave(user, -(raffle.price * amount));
        rp.tickets += amount;
        await this.RPrepo.save(rp);
    }

    public async add({
        title,
        description,
        icon,
        price,
        maxTickets,
        endingDate,
        code,
        value,
    }: {
        title: string;
        description: string | null | undefined;
        icon: string;
        price: number;
        maxTickets: number;
        endingDate: Date;
        code: string | null | undefined;
        value: number;
    }): Promise<void> {
        const raffle = new RaffleEntity();
        raffle.title = title;
        raffle.description = description ?? '';
        raffle.icon = icon;
        raffle.price = price;
        raffle.maxTickets = maxTickets;
        raffle.endingDate = endingDate;
        raffle.code = code;
        raffle.value = value;

        await this.repo.save(raffle);

        //Discord notification
        await this.discordBot.sendRaffleNotificationMessage(raffle);
    }
}
