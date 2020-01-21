import {BaseEntity, Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn} from "typeorm";
import {User} from "./User";
import {Raffle} from "./Raffle";

@Entity()
export class RaffleParticipation extends BaseEntity {

    @PrimaryGeneratedColumn()
    id: number;

    @OneToMany(type => User, u => u.raffleParticipations)
    user: User;

    @OneToMany(type => Raffle, r => r.participations)
    raffle: Raffle;

    @Column()
    tickets: number;

    @CreateDateColumn()
    createdAt: Date;
}
