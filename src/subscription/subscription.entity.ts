/* eslint-disable @typescript-eslint/no-unused-vars */
import { Expose } from 'class-transformer';
import moment = require('moment');
import {
    Column,
    CreateDateColumn,
    Entity,
    JoinColumn,
    ManyToOne,
    OneToOne,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from 'typeorm';
import { UserEntity } from '../user/user.entity';
import { PaypalSubscriptionDetails } from './paypal.interfaces';
import { SubscriptionLevel } from './subscription.interfaces';

/**
 * Entity representing a paypal subscription.
 *
 * @category Entity
 */
@Entity('subscription')
@Expose()
export class SubscriptionEntity {
    @PrimaryGeneratedColumn()
    public id: number;

    /**
     * Subscription id from paypal.
     */
    @Column({ unique: true })
    public paypalId: string;

    /**
     * Details of the subscription from paypal.\
     * Updated at lest every hour by [[SubscriptionSubscriber]].
     */
    @Column('json')
    public details: PaypalSubscriptionDetails | null;

    /**
     * Last time [[details]] was updated.
     */
    @Column({ default: '1970-01-01 00:00:00' })
    public lastDetailsUpdate: Date;

    /**
     * Owner of the subscription (even if subscription is inactive).
     */
    @ManyToOne(
        type => UserEntity,
        user => user.chatMessages
    )
    public user: UserEntity;

    /**
     * Subscription level, affects privileges.
     */
    @Column({
        type: 'enum',
        enum: SubscriptionLevel,
    })
    public level: SubscriptionLevel;

    /**
     * Owner if the current subscription is the active subscription.
     */
    @JoinColumn()
    @OneToOne(
        type => UserEntity,
        user => user.currentSubscription,
        { nullable: true, cascade: true }
    )
    public currentUser: UserEntity | null;

    @CreateDateColumn()
    public createdAt: Date;

    @UpdateDateColumn()
    public updatedAt: Date;

    /**
     * Is the subscription active (paypal status is ACTIVE or CANCELLED and not expired).
     * Loaded by [[SubscriptionSubscriber]].
     */
    public isActive = false;

    /**
     * When the subscription will expire if not ACTIVE
     */
    public get expirationDate(): moment.Moment | null {
        const lastPayDateStr = this.details?.billing_info?.last_payment?.time;
        if (lastPayDateStr) {
            return moment(lastPayDateStr).add(1, 'month');
        }

        return null;
    }

    /**
     * Use [[isActive]] instead. This function does not check for status.
     *
     * @returns if the subscription is expired based on [[expirationDate]].
     */
    public isExpired(): boolean {
        const expirationDate = this.expirationDate;

        if (expirationDate == null) return true;
        return moment() >= expirationDate;
    }
}
