/* eslint-disable @typescript-eslint/no-unused-vars */
import { Exclude, Expose } from 'class-transformer';
import {
    Column,
    CreateDateColumn,
    Entity,
    JoinColumn,
    JoinTable,
    ManyToMany,
    ManyToOne,
    OneToMany,
    OneToOne,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from 'typeorm';
import { CaseEntity } from '../case/case.entity';
import { ChatMessageEntity } from '../chat/chat-message.entity';
import { CouponEntity } from '../coupon/coupon.entity';
import { RaffleParticipationEntity } from '../raffle/raffle-participation.entity';
import { RaffleEntity } from '../raffle/raffle.entity';
import { ChatRank } from '../shared/types';
import { StreamQueueEntity } from '../stream-queue/stream-queue.entity';
import { SubscriptionEntity } from '../subscription/subscription.entity';
import { SubscriptionLevel } from '../subscription/subscription.interfaces';

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

    @Expose()
    @Column()
    public avatar: string;

    @Column({ type: 'text' })
    public twitchDescription: string;

    @Column({ default: 0 })
    public points: number;

    @Column({ default: false })
    public admin: boolean;

    @Column({ default: false })
    public moderator: boolean;

    @Column('datetime', { default: () => 'CURRENT_TIMESTAMP' })
    public lastOnWatchPage: Date;

    @Expose()
    public get chatRank(): ChatRank {
        if (this.admin) return ChatRank.Admin;
        if (this.moderator) return ChatRank.Moderator;
        if (this.partner) return ChatRank.Partner;

        switch (this.subscriptionLevel) {
            case SubscriptionLevel.None:
                return ChatRank.Member;
            case SubscriptionLevel.VIP:
                return ChatRank.VIP;
            case SubscriptionLevel.Diamond:
                return ChatRank.Diamond;
        }
    }

    @Column({ default: false })
    public partner: boolean;

    //Ban
    @Column({ default: false })
    public banned: boolean;

    @ManyToOne(type => UserEntity, { nullable: true })
    @JoinColumn({ name: 'bannedById' })
    public bannedBy: UserEntity | null;

    @Column({ type: 'datetime', nullable: true, default: null })
    public banDate: Date | null;

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

    @OneToMany(
        type => SubscriptionEntity,
        s => s.user
    )
    public subscriptions: SubscriptionEntity[];

    @OneToOne(
        type => SubscriptionEntity,
        sub => sub.currentUser,
        { nullable: true }
    )
    public currentSubscription: SubscriptionEntity | null;

    @OneToMany(
        type => CaseEntity,
        c => c.user
    )
    public cases: CaseEntity[];

    @OneToMany(
        type => UserEntity,
        u => u.affiliatedTo
    )
    public affiliates: UserEntity[];

    @ManyToOne(
        type => UserEntity,
        u => u.affiliates
    )
    public affiliatedTo: UserEntity;

    @Column({ default: false })
    public gotAffiliateCase: boolean;

    @Exclude()
    @CreateDateColumn()
    public createdAt: Date;

    @Exclude()
    @UpdateDateColumn()
    public updatedAt: Date;

    //Loaded from subscriber
    public subscriptionLevel: SubscriptionLevel;

    public changePoints(amount: number): void {
        if (this.points != undefined) {
            this.points = Math.round(this.points + amount);
        } else {
            this.points = Math.round(amount);
        }
    }

    public canAfford(cost: number): boolean {
        return this.points >= cost;
    }
}
