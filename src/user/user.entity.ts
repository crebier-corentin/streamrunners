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

    /**
     * Obtained from twitch, look at UserService.syncWithTwitch()
     */
    @Column()
    public twitchId: string;

    /**
     * Obtained from twitch, look at UserService.syncWithTwitch()
     */
    @Expose()
    @Column()
    public username: string;

    /**
     * Obtained from twitch, look at UserService.syncWithTwitch()
     */
    @Expose()
    @Column()
    public displayName: string;

    /**
     * An url to the user's avatar
     * Obtained from twitch, look at UserService.syncWithTwitch()
     */
    @Expose()
    @Column()
    public avatar: string;

    /**
     * Obtained from twitch, look at UserService.syncWithTwitch()
     */
    @Column({ type: 'text' })
    public twitchDescription: string;

    /**
     * Steamcoins, can never go below 0
     * Use UserService.changePointsSave() to increment/decrement it
     */
    @Column({ default: 0 })
    public points: number;

    /**
     * Meteores, can never go below 0
     * Use UserService.changePointsSave() to increment/decrement it
     */
    @Column({ default: 0 })
    public meteores: number;

    /**
     * Gives admin privileges, ChatRank.Admin and diamond subscription level
     */
    @Column({ default: false })
    public admin: boolean;

    /**
     * Gives moderator privileges, ChatRank.Moderator and diamond subscription level
     */
    @Column({ default: false })
    public moderator: boolean;

    /**
     * Shows a sparkle background behind username in chat
     */
    @Expose()
    @Column({ default: false })
    public sparkle: boolean;

    /**
     * Last time the user sent a request to /watch/update
     * Useful to see who is currently on the page
     */
    @Column('datetime', { default: () => 'CURRENT_TIMESTAMP' })
    public lastOnWatchPage: Date;

    /**
     * Gives ChatRank.Birthday and diamond subscription level
     */
    @Column({ default: false })
    public birthday: boolean;

    /**
     * User shows up on partner slider on the index page
     * Gives ChatRank.Partner and diamond subscription level
     */
    @Column({ default: false })
    public partner: boolean;

    /*
     * chatRank requires properties 'admin', 'moderator', 'partner', 'birthday' the relation 'currentSubscription' and 'subscriptionLevel' loaded by UserSubscriber
     */
    @Expose()
    public get chatRank(): ChatRank {
        if (this.admin) return ChatRank.Admin;
        if (this.moderator) return ChatRank.Moderator;
        if (this.partner) return ChatRank.Partner;
        if (this.birthday) return ChatRank.Birthday;

        switch (this.subscriptionLevel) {
            case SubscriptionLevel.None:
                return ChatRank.Member;
            case SubscriptionLevel.VIP:
                return ChatRank.VIP;
            case SubscriptionLevel.Diamond:
                return ChatRank.Diamond;
        }
    }

    //Ban
    /**
     * Is the user banned
     * Use AdminService.ban() to ban and UserService.unban() to unban
     */
    @Column({ default: false })
    public banned: boolean;

    /**
     * Who banned the user
     * Will reset to null if unbanned
     */
    @ManyToOne(type => UserEntity, { nullable: true })
    @JoinColumn({ name: 'bannedById' })
    public bannedBy: UserEntity | null;

    /**
     * The date the user was banned
     * Will reset to null if unbanned
     */
    @Column({ type: 'datetime', nullable: true, default: null })
    public banDate: Date | null;

    /**
     * Streams queued
     */
    @OneToMany(
        type => StreamQueueEntity,
        StreamQueue => StreamQueue.user
    )
    public streamsQueued: StreamQueueEntity[];

    /**
     * Chat messages sent
     */
    @OneToMany(
        type => ChatMessageEntity,
        message => message.author
    )
    public chatMessages: ChatMessageEntity[];

    /**
     * Coupon used
     */
    @ManyToMany(
        type => CouponEntity,
        coupon => coupon.users
    )
    @JoinTable()
    public coupons: CouponEntity[];

    /**
     * Raffles won
     */
    @OneToMany(
        type => RaffleEntity,
        r => r.winner,
        { eager: true }
    )
    public rafflesWon: RaffleEntity[];

    /**
     * Raffles participated in (with amount of ticket bought)
     */
    @OneToMany(
        type => RaffleParticipationEntity,
        r => r.user
    )
    public raffleParticipations: RaffleParticipationEntity[];

    /**
     * Subscriptions created
     */
    @OneToMany(
        type => SubscriptionEntity,
        s => s.user
    )
    public subscriptions: SubscriptionEntity[];

    /**
     * Current active subscription
     */
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

    /**
     * Received the affiliate case
     * Used to not give it more than once
     */
    @Column({ default: false })
    public gotAffiliateCase: boolean;

    @Exclude()
    @CreateDateColumn()
    public createdAt: Date;

    @Exclude()
    @UpdateDateColumn()
    public updatedAt: Date;

    /**
     * Loaded by UserSubscriber
     */
    public subscriptionLevel: SubscriptionLevel;

    /**
     * User has more or equal points to cost
     * @param cost
     */
    public canAffordPoints(cost: number): boolean {
        return this.points >= cost;
    }

    /**
     * User has more or equal meteores to cost
     * @param cost
     */
    public canAffordMeteores(cost: number): boolean {
        return this.meteores >= cost;
    }
}
