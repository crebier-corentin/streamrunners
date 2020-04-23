import { Expose } from 'class-transformer';
import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { SubscriptionLevel } from './subscription.interfaces';

@Entity('subscription_level_info')
@Expose()
export class SubscriptionLevelInfoEntity {
    @PrimaryGeneratedColumn()
    public id: number;

    @Column({
        type: 'enum',
        enum: SubscriptionLevel,
        unique: true,
    })
    public level: SubscriptionLevel;

    @Column('int', { unsigned: true })
    public maxPlaces: number;

    @CreateDateColumn()
    public createdAt: Date;

    @UpdateDateColumn()
    public updatedAt: Date;
}
