/* eslint-disable @typescript-eslint/no-unused-vars */
import { Exclude, Expose, Transform, Type } from 'class-transformer';
import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { UserEntity } from '../user/user.entity';
import moment = require('moment');
import { SubscriptionLevel, SubscriptionStatus } from './subscription.interfaces';

@Entity('subscription')
@Expose()
export class SubscriptionEntity {
    @PrimaryGeneratedColumn()
    public id: number;

    @ManyToOne(
        type => UserEntity,
        user => user.chatMessages
    )
    public user: UserEntity;

    @Column({
        type: 'enum',
        enum: SubscriptionStatus,
    })
    public status: SubscriptionStatus;

    @Column({
        type: 'enum',
        enum: SubscriptionLevel,
    })
    public level: SubscriptionLevel;

    @Column('datetime', { nullable: true })
    public expires: Date | null;

    @CreateDateColumn()
    public createdAt: Date;

    @UpdateDateColumn()
    public updatedAt: Date;

    public expired(): boolean {
        return new Date() >= this.expires;
    }
}
