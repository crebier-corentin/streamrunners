import { forwardRef, Inject, Injectable, InternalServerErrorException } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityService } from '../common/utils/entity-service';
import { DiscordBotService } from '../discord/discord-bot.service';
import { UserEntity } from '../user/user.entity';
import { NotEnoughPointsException } from '../user/user.exception';
import { UserService } from '../user/user.service';
import { RaffleParticipationService } from './raffle-participation.service';
import { RaffleEntity, RaffleEntityExtra } from './raffle.entity';

@Injectable()
export class RaffleService extends EntityService<RaffleEntity> {
    public constructor(
        @InjectRepository(RaffleEntity) repo,
        @Inject(forwardRef(() => RaffleParticipationService))
        private readonly rpService: RaffleParticipationService,
        @Inject(forwardRef(() => UserService))
        private readonly userService: UserService,
        @Inject(forwardRef(() => DiscordBotService))
        private readonly discordBot: DiscordBotService
    ) {
        super(repo);
    }

    public async totalTickets(raffle: RaffleEntity): Promise<number> {
        return (
            await this.repo
                .createQueryBuilder('raffle')
                .where('raffle.id = :id', { id: raffle.id })
                .leftJoin('raffle.participations', 'rp')
                .select('SUM(rp.tickets)', 'sum')
                .getRawOne()
        ).sum;
    }

    public async totalValue(): Promise<number> {
        return (
            await this.repo
                .createQueryBuilder('raffle')
                .select('SUM(raffle.value)', 'sum')
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
            .orderBy('endingDate', 'ASC')
            .getRawAndEntities();

        //Map total to entities
        let i = 0;
        return entities.map((e: RaffleEntityExtra) => {
            e.totalTickets = Number(raw[i++].total ?? 0);
            return e;
        });
    }

    public async activeAndTicketCount(user: UserEntity): Promise<RaffleEntityExtra[]> {
        const raffles = await this.active();
        return Promise.all(
            raffles.map(async (r: RaffleEntityExtra) => {
                r.userTickets = (await this.rpService.findForUserAndRaffle(user, r))?.tickets ?? 0; //Ticket count or 0 if none
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
            .orderBy('raffle.endingDate', 'DESC')
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

        const rp = await this.rpService.findOrCreate(user, raffle);
        //Assure that user has less than max tickets
        if (raffle.maxTickets > 0 && rp.tickets + amount > raffle.maxTickets) throw new InternalServerErrorException();

        //Pay and add ticket
        await this.userService.changePointsSave(user, -(raffle.price * amount));
        rp.tickets += amount;
        await this.rpService.save(rp);
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
        await this.discordBot.updateRaffleValueCount();
    }
}
