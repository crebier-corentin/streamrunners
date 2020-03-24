/* eslint-disable @typescript-eslint/no-unused-vars */
import { Expose } from 'class-transformer';
import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { UserEntity } from '../user/user.entity';
import { PaypalSubscriptionDetails } from './paypal.interfaces';
import { SubscriptionLevel } from './subscription.interfaces';
import moment = require('moment');

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

    //Loaded from subscriber
    public details: PaypalSubscriptionDetails | null;

    public isActive(): boolean {
        //Active
        if (this.details?.status === 'ACTIVE') return true;

        //Other status (Cancelled...)
        return !this.isExpired();
    }

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
