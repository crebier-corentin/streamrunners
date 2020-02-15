/* eslint-disable @typescript-eslint/no-unused-vars */
import { UserEntity } from '../user/user.entity';
import { RaffleEntity } from './raffle.entity';
import {
    BaseEntity,
    Column,
    CreateDateColumn,
    Entity,
    JoinColumn,
    ManyToOne,
    PrimaryGeneratedColumn,
    RelationId,
} from 'typeorm';

@Entity('raffle_participation')
export class RaffleParticipationEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(
        type => UserEntity,
        u => u.raffleParticipations
    )
    user: UserEntity;

    @ManyToOne(
        type => RaffleEntity,
        r => r.participations
    )
    @JoinColumn({ name: 'raffleId' })
    raffle: RaffleEntity;

    @Column({ default: 0 })
    tickets: number;

    @CreateDateColumn()
    createdAt: Date;
}
