import { UserEntity } from '../user/user.entity';
import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

@Entity('stream_queue')
export class StreamQueueEntity {
    @PrimaryGeneratedColumn()
    id: number;

    //Price in points
    @Column({ default: 100 })
    amount: number;

    //Time in seconds
    @Column({ default: 60 })
    time: number;

    @Column({ default: 0 })
    current: number;

    @Column('datetime', { nullable: true, default: null })
    start: Date;

    @ManyToOne(
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        type => UserEntity,
        user => user.streamsQueued,
        { nullable: false }
    )
    user: UserEntity;

    @CreateDateColumn()
    createdAt: Date;

    //If session has ended
    ended(): boolean {
        return this.current >= this.time;
    }
}
