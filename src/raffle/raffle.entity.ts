/* eslint-disable @typescript-eslint/no-unused-vars */
import { formatDuration } from '../shared/shared-utils';
import { UserEntity } from '../user/user.entity';
import { RaffleParticipationEntity } from './raffle-participation.entity';
import * as moment from 'moment';
import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

@Entity('raffle')
export class RaffleEntity {
    @PrimaryGeneratedColumn()
    public id: number;

    @Column()
    public title: string;

    @Column({ default: '' })
    public description: string;

    @Column()
    public icon: string;

    @Column()
    public price: number;

    @Column({ default: -1 })
    public maxTickets: number;

    @Column('datetime')
    public endingDate: Date;

    @Column({ nullable: true })
    public code: string | null;

    @Column({ default: 0 })
    public value: number;

    @ManyToOne(
        type => UserEntity,
        u => u.rafflesWon,
        { nullable: true }
    )
    @JoinColumn({ name: 'winnerId' })
    public winner: UserEntity | null;

    @OneToMany(
        type => RaffleParticipationEntity,
        r => r.raffle
    )
    public participations: RaffleParticipationEntity[];

    @CreateDateColumn()
    public createdAt: Date;

    public isActive(): boolean {
        return this.winner == null && this.endingDate.getTime() > new Date().getTime();
    }

    public remainingTime(): string {
        const timeLeft = moment.duration(moment(this.endingDate).diff(moment()));

        return formatDuration(timeLeft);
    }

    public formattedEnded(): string {
        return moment(this.endingDate)
            .locale('fr')
            .format('LL');
    }
}
