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
import {formatDateSQL, formatRandomSQL} from "../../other/utils";
import * as moment from "moment";
import {formatDuration} from "../../shared/shared-utils";

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

    //TODO: Turn this into a manual many to many relation with many to one
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

    formattedEnded(): string {
        return moment(this.endingDate).locale("fr").format("LL");
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

    static ended(count: number = 5): Promise<Raffle[]> {
        return Raffle.createQueryBuilder("raffle")
            .where("raffle.winnerId != NULL")
            .orderBy("raffle.createdAt", "DESC")
            .limit(count)
            .getMany();
    }
}
