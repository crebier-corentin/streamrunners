/* eslint-disable @typescript-eslint/no-unused-vars */
import { formatDuration } from '../shared/shared-utils';
import { UserEntity } from '../user/user.entity';
import { RaffleParticipationEntity } from './raffle-participation.entity';
import * as moment from 'moment';
import {
    Column,
    CreateDateColumn,
    Entity,
    JoinColumn,
    JoinTable,
    ManyToMany,
    ManyToOne,
    OneToMany,
    PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('raffle')
export class RaffleEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    title: string;

    @Column({ default: '' })
    description: string;

    @Column()
    icon: string;

    @Column()
    price: number;

    @Column({ default: -1 })
    maxTickets: number;

    @Column('datetime')
    endingDate: Date;

    @Column({ nullable: true })
    code: string | null;

    @Column({ default: 0 })
    value: number;

    @ManyToOne(
        type => UserEntity,
        u => u.rafflesWon,
        { nullable: true }
    )
    @JoinColumn({ name: 'winnerId' })
    winner: UserEntity | null;

    @OneToMany(
        type => RaffleParticipationEntity,
        r => r.raffle
    )
    participations: RaffleParticipationEntity[];

    @CreateDateColumn()
    createdAt: Date;

    isActive(): boolean {
        return this.winner == null && this.endingDate.getTime() > new Date().getTime();
    }

    remainingTime(): string {
        const timeLeft = moment.duration(moment(this.endingDate).diff(moment()));

        return formatDuration(timeLeft);
    }

    formattedEnded(): string {
        return moment(this.endingDate)
            .locale('fr')
            .format('LL');
    }
}
