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
    endingDate: Date;

    @Column({nullable: true})
    code: string | null;

    @ManyToOne(type => User, u => u.rafflesWon, {nullable: true})
    @JoinColumn({name: "winnerId"})
    winner: User | null;

    @OneToMany(type => RaffleParticipation, r => r.raffle)
    participations: RaffleParticipation[];

    @CreateDateColumn()
    createdAt: Date;

    active(): boolean {
        return this.winner == null && this.endingDate.getTime() > new Date().getTime();
    }

    async pickWinner(): Promise<void> {
        this.winner = await User.createQueryBuilder("user")
            .leftJoin("user.raffleParticipations", "rp")
            .leftJoin("rp.raffle", "raffle")
            .where("raffle.id = :id", {id: this.id})
            .orderBy("-LOG(1.0 - rand()) / rp.tickets")
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

    async totalTickets(): Promise<number> {
        return (await RaffleParticipation.createQueryBuilder("rp")
            .select("SUM(rp.tickets)", "sum")
            .where("rp.raffleId = :id", {id: this.id})
            .getRawOne()).sum;
    }

    static async actives(): Promise<Raffle[]> {
        return Raffle.createQueryBuilder("raffle")
            .where("raffle.winnerId IS NULL")
            .andWhere("raffle.endingDate > NOW()")
            .getMany();
    }

    static async endedAndNoWinner(): Promise<Raffle[]> {
        return Raffle.createQueryBuilder("raffle")
            .where("raffle.winnerId IS NULL")
            .andWhere("raffle.endingDate <= NOW()")
            .getMany();
    }

    static async pickWinners(): Promise<void> {
        const raffles = await Raffle.endedAndNoWinner();
        await Promise.all(raffles.map(r => r.pickWinner()));
    }

    static ended(count: number = 5): Promise<Raffle[]> {
        return Raffle.createQueryBuilder("raffle")
            .leftJoinAndSelect("raffle.winner", "winner")
            .where("raffle.winnerId IS NOT NULL")
            .orderBy("raffle.createdAt", "DESC")
            .limit(count)
            .getMany();
    }
}
