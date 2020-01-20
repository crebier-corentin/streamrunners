import {
    BaseEntity,
    Column,
    CreateDateColumn,
    Entity,
    JoinColumn, JoinTable,
    ManyToMany,
    ManyToOne,
    PrimaryGeneratedColumn
} from "typeorm";
import {User} from "./User";
import {formatDateSQL, formatDuration, formatRandomSQL} from "../../other/utils";
import * as moment from "moment";

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

    @Column({nullable: true})
    code: string | null;

    @Column("datetime")
    endingDate: Date;

    @ManyToOne(type => User, u => u.rafflesWon, {nullable: true})
    @JoinColumn({name: "winnerId"})
    winner: User | null;

    @ManyToMany(type => User, u => u.rafflesParticipated, {cascade: true})
    @JoinTable()
    participants: User[];

    @CreateDateColumn()
    createdAt: Date;

    active(): boolean {
        return this.winner == null;
    }

    async pickWinner(): Promise<void> {
        this.winner = await User.createQueryBuilder("user")
            .leftJoin("user.rafflesParticipated", "raffle")
            .where("raffle.id = :id", {id: this.id})
            .orderBy(await formatRandomSQL())
            .getOne();
        await this.save();
    }

    remainingTime(): string {
        const timeLeft = moment.duration(moment(this.endingDate).diff(moment()));

        return formatDuration(timeLeft);
    }

    static actives(): Promise<Raffle[]> {
        return Raffle.createQueryBuilder("raffle")
            .where("raffle.winnerId = NULL")
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
}
