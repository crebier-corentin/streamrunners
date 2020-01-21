import {
    BaseEntity,
    Column,
    CreateDateColumn,
    Entity,
    JoinColumn, JoinTable,
    ManyToMany,
    ManyToOne, OneToMany,
    PrimaryGeneratedColumn
} from "typeorm";
import {User} from "./User";
import {formatDateSQL, formatRandomSQL, getDBType} from "../../other/utils";
import * as moment from "moment";
import {formatDuration} from "../../shared/shared-utils";
import {RaffleParticipation} from "./RaffleParticipation";

@Entity()
export class Raffle extends BaseEntity {

    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    title: string;

    @Column()
    icon: string;

    @Column()
    price: number;

    @Column({default: -1})
    maxTickets: number;

    @Column("datetime")
    endingDate: Date | number;

    @Column({nullable: true})
    code: string | null;

    @ManyToOne(type => User, u => u.rafflesWon, {nullable: true})
    @JoinColumn({name: "winnerId"})
    winner: User | null;

    @OneToMany(type => RaffleParticipation, r => r.raffle)
    participations: RaffleParticipation[];

    @CreateDateColumn()
    createdAt: Date;

    endingDateDate(): Date {
        if (this.endingDate instanceof Date) {
            return this.endingDate;
        }
        return new Date(this.endingDate);

    }

    active(): boolean {
        return this.winner == null;
    }

    async pickWinner(): Promise<void> {
        this.winner = await User.createQueryBuilder("user")
            .leftJoin("user.raffleParticipations", "rp")
            .leftJoin("rp.raffle", "raffle")
            .where("raffle.id = :id", {id: this.id})
            .orderBy((await getDBType()) === "sqlite" ? "RANDOM()" : "-LOG(1.0 - rand()) / rp.tickets") //Only mysql has weighted random
            .getOne();

        await this.save();
    }

    remainingTime(): string {
        const timeLeft = moment.duration(moment(this.endingDate).diff(moment()));

        return formatDuration(timeLeft);
    }

    formattedEnded(): string {
        return moment(this.endingDate).locale("fr").format("LL");
    }

    static actives(): Promise<Raffle[]> {
        return Raffle.createQueryBuilder("raffle")
            .where("raffle.winnerId IS NULL")
            .getMany();
    }

    static endedAndNoWinner(): Promise<Raffle[]> {
        return Raffle.createQueryBuilder("raffle")
            .where("raffle.winnerId = NULL")
            .andWhere(`raffle.endingDate <= ${formatDateSQL(new Date())}`)
            .getMany();
    }

    static async pickWinners(): Promise<void> {
        const raffles = await Raffle.endedAndNoWinner();
        await Promise.all(raffles.map(r => r.pickWinner()));
    }

    static ended(count: number = 5): Promise<Raffle[]> {
        return Raffle.createQueryBuilder("raffle")
            .where("raffle.winnerId IS NOT NULL")
            .orderBy("raffle.createdAt", "DESC")
            .limit(count)
            .getMany();
    }
}
