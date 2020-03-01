/* eslint-disable @typescript-eslint/no-unused-vars */
import { Exclude, Expose, Type } from 'class-transformer';
import * as moment from 'moment';
import {
    Column,
    CreateDateColumn,
    Entity,
    JoinColumn,
    ManyToOne,
    OneToMany,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from 'typeorm';
import { formatDuration } from '../shared/shared-utils';
import { UserEntity } from '../user/user.entity';
import { RaffleParticipationEntity } from './raffle-participation.entity';

@Expose()
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

    @Exclude()
    @Column({ nullable: true })
    public code: string | null;

    @Exclude()
    @Column({ default: 0 })
    public value: number;

    @Type(type => UserEntity)
    @ManyToOne(
        type => UserEntity,
        u => u.rafflesWon,
        { nullable: true }
    )
    @JoinColumn({ name: 'winnerId' })
    public winner: UserEntity | null;

    @Exclude()
    @OneToMany(
        type => RaffleParticipationEntity,
        r => r.raffle
    )
    public participations: RaffleParticipationEntity[];

    @Exclude()
    @CreateDateColumn()
    public createdAt: Date;

    @Exclude()
    @UpdateDateColumn()
    public updatedAt: Date;

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

@Expose()
export class RaffleEntityExtra extends RaffleEntity {
    public totalTickets: number;

    public userTickets: number;
}
