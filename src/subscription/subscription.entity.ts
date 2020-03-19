/* eslint-disable @typescript-eslint/no-unused-vars */
import { Exclude, Expose, Transform, Type } from 'class-transformer';
import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { UserEntity } from '../user/user.entity';
import moment = require('moment');
import { PaypalSubscriptionDetails } from './paypal.interfaces';
import { SubscriptionLevel } from './subscription.interfaces';

@Entity('subscription')
@Expose()
export class SubscriptionEntity {
    @PrimaryGeneratedColumn()
    public id: number;

    @Column()
    public paypalId: string;

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

    @Column({ default: false })
    public current: boolean;

    @CreateDateColumn()
    public createdAt: Date;

    @UpdateDateColumn()
    public updatedAt: Date;
}

export class SubscriptionEntityAndDetails {
    public entity: SubscriptionEntity;

    public details: PaypalSubscriptionDetails;

    public isActive(): boolean {
        //Active
        if (this.details.status === 'ACTIVE') return true;

        //Other status (Cancelled...)
        return this.isExpired();
    }

    public expiringDate(): moment.Moment | null {
        const lastPayDateStr = this.details?.billing_info?.last_payment?.time;
        if (lastPayDateStr) {
            return moment(lastPayDateStr).add(1, 'month');
        }

        return null;
    }

    public isExpired(): boolean {
        const date = this.expiringDate();
        return date == null || moment() >= this.expiringDate();
    }
}
