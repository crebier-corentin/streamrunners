import { Column, CreateDateColumn, Entity, Index, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { UserEntity } from '../user/user.entity';

/**
 * Entity representing a place in the stream queue.
 *
 * @category Entity
 *
 */
@Entity('stream_queue')
export class StreamQueueEntity {
    @PrimaryGeneratedColumn()
    public id: number;

    /**
     * Price of the place in [[UserEntity.points]].
     */
    @Column({ default: 100 })
    public amount: number;

    /**
     * How long the stream will be shown in seconds.
     */
    @Column({ default: 60 })
    public time: number;

    /**
     * How long the stream has been shown in seconds.\
     * Updated by [[StreamQueueService.updateQueue]].
     */
    @Column({ default: 0 })
    public current: number;

    /**
     * Datetime when the stream started to be shown.\
     * null if still waiting in the queue.
     */
    @Column('datetime', { nullable: true, default: null })
    public start: Date | null;

    /**
     * Owner of the stream.
     */
    @ManyToOne(
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        type => UserEntity,
        user => user.streamsQueued,
        { nullable: false }
    )
    public user: UserEntity;

    @Index()
    @CreateDateColumn()
    public createdAt: Date;

    @UpdateDateColumn()
    public updatedAt: Date;

    /**
     * If the stream has been shown for long enough.
     */
    public ended(): boolean {
        return this.current >= this.time;
    }
}
