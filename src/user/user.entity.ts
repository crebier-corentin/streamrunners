/* eslint-disable @typescript-eslint/no-unused-vars */
import { ChatMessageEntity } from '../chat/chat-message.entity';
import { CouponEntity } from '../coupon/coupon.entity';
import { RaffleParticipationEntity } from '../raffle/raffle-participation.entity';
import { RaffleEntity } from '../raffle/raffle.entity';
import { ChatRank } from '../shared/types';
import { StreamQueueEntity } from '../stream-queue/stream-queue.entity';
import { Exclude, Expose } from 'class-transformer';
import {
    Column,
    CreateDateColumn,
    Entity,
    JoinTable,
    ManyToMany,
    OneToMany,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from 'typeorm';

@Exclude()
@Entity('user')
export class UserEntity {
    @PrimaryGeneratedColumn()
    public id: number;

    @Column()
    public twitchId: string;

    @Column()
    public username: string;

    @Expose()
    @Column()
    public displayName: string;

    @Column()
    public avatar: string;

    @Column({ default: 0 })
    public points: number;

    @Column({ default: false })
    public moderator: boolean;

    @Column('datetime', { default: () => 'CURRENT_TIMESTAMP' })
    public lastUpdate: Date;

    @Column('datetime', { default: () => 'CURRENT_TIMESTAMP' })
    public lastOnWatchPage: Date;

    @Expose()
    @Column({ default: ChatRank.Member })
    public chatRank: ChatRank;

    @OneToMany(
        type => StreamQueueEntity,
        StreamQueue => StreamQueue.user
    )
    public streamsQueued: StreamQueueEntity[];

    @OneToMany(
        type => ChatMessageEntity,
        message => message.author
    )
    public chatMessages: ChatMessageEntity[];

    @ManyToMany(
        type => CouponEntity,
        coupon => coupon.users
    )
    @JoinTable()
    public coupons: CouponEntity[];

    @OneToMany(
        type => RaffleEntity,
        r => r.winner,
        { eager: true }
    )
    public rafflesWon: RaffleEntity[];

    @OneToMany(
        type => RaffleParticipationEntity,
        r => r.user
    )
    public raffleParticipations: RaffleParticipationEntity[];

    @Exclude()
    @CreateDateColumn()
    public createdAt: Date;

    @Exclude()
    @UpdateDateColumn()
    public updatedAt: Date;

    public changePoints(amount: number): void {
        if (this.points != undefined) {
            this.points = Math.round(this.points + amount);
        } else {
            this.points = Math.round(amount);
        }
    }
}
