/* eslint-disable @typescript-eslint/no-unused-vars */
import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { UserEntity } from '../user/user.entity';
import { RaffleEntity } from './raffle.entity';

@Entity('raffle_participation')
export class RaffleParticipationEntity {
    @PrimaryGeneratedColumn()
    public id: number;

    @ManyToOne(
        type => UserEntity,
        u => u.raffleParticipations
    )
    public user: UserEntity;

    @ManyToOne(
        type => RaffleEntity,
        r => r.participations
    )
    @JoinColumn({ name: 'raffleId' })
    public raffle: RaffleEntity;

    @Column({ default: 0 })
    public tickets: number;

    @CreateDateColumn()
    public createdAt: Date;
}
