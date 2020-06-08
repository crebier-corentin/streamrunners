import { Expose } from 'class-transformer';
import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { SubscriptionLevel } from './subscription.interfaces';

/**
 *
 * Entity storing advantages for subscriptions.\
 * There can only be one per [[SubscriptionLevel]].
 *
 * @category Entity
 *
 */
@Entity('subscription_level_info')
@Expose()
export class SubscriptionLevelInfoEntity {
    @PrimaryGeneratedColumn()
    public id: number;

    /**
     * Subscription level the advantage applies to.
     */
    @Column({
        type: 'enum',
        enum: SubscriptionLevel,
        unique: true,
    })
    public level: SubscriptionLevel;

    /**
     * How many simultaneous places a user can hold on the queue.
     */
    @Column('int', { unsigned: true, width: 10 })
    public maxPlaces: number;

    @CreateDateColumn()
    public createdAt: Date;

    @UpdateDateColumn()
    public updatedAt: Date;
}
