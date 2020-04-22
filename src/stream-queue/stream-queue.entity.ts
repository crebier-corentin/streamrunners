import { Column, CreateDateColumn, Entity, Index, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { UserEntity } from '../user/user.entity';

@Entity('stream_queue')
export class StreamQueueEntity {
    @PrimaryGeneratedColumn()
    public id: number;

    //Price in points
    @Column({ default: 100 })
    public amount: number;

    //Time in seconds
    @Index()
    @Column({ default: 60 })
    public time: number;

    @Index()
    @Column({ default: 0 })
    public current: number;

    @Column('datetime', { nullable: true, default: null })
    public start: Date | null;

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

    //If session has ended
    public ended(): boolean {
        return this.current >= this.time;
    }
}
