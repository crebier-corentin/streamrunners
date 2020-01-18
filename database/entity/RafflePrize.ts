import {BaseEntity, Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn} from "typeorm";
import {User} from "./User";

@Entity()
export class RafflePrize extends BaseEntity {

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

    @ManyToOne(type => User, u => u.rafflePrizes, {nullable: true})
    winner: User | null;

    @CreateDateColumn()
    createdAt: Date;

    active(): boolean {
        return this.winner == null;
    }

    async pickWinner(): Promise<void> {
        this.winner = await User.random();
        await this.save();
    }
}
