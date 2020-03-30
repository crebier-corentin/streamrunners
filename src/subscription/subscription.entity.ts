/* eslint-disable @typescript-eslint/no-unused-vars */
import { Expose } from 'class-transformer';
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
import moment = require('moment');

@Entity('subscription')
@Expose()
export class SubscriptionEntity {
    @PrimaryGeneratedColumn()
    public id: number;

    @Column({ unique: true })
    public paypalId: string;

    @Column('json')
    public details: PaypalSubscriptionDetails | null;

    @Column({ default: '1970-01-01 00:00:00' })
    public lastDetailsUpdate: Date;

    @ManyToOne(
        type => UserEntity,
        user => user.chatMessages
    )
    public user: UserEntity;

    @Column({
        type: 'enum',
        enum: SubscriptionLevel,
    })
    public level: SubscriptionLevel;

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

    //Loaded from subscriber
    public isActive = false;

    public get expirationDate(): moment.Moment | null {
        const lastPayDateStr = this.details?.billing_info?.last_payment?.time;
        if (lastPayDateStr) {
            return moment(lastPayDateStr).add(1, 'month');
        }

        return null;
    }

    public isExpired(): boolean {
        const expirationDate = this.expirationDate;

        if (expirationDate == null) return true;
        return moment() >= expirationDate;
    }
}
