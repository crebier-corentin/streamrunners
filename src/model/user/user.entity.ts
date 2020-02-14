import { ChatRank } from '../../shared/types';
import { StreamQueueEntity } from '../stream-queue/stream-queue.entity';
import { Exclude, Expose } from 'class-transformer';
import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

@Exclude()
@Entity('user')
export class UserEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    twitchId: string;

    @Column()
    username: string;

    @Expose()
    @Column()
    displayName: string;

    @Column()
    avatar: string;

    @Column({ default: 0 })
    points: number;

    @Column({ default: false })
    moderator: boolean;

    @Column('datetime', { default: () => 'CURRENT_TIMESTAMP' })
    lastUpdate: Date;

    @Column('datetime', { default: () => 'CURRENT_TIMESTAMP' })
    lastOnWatchPage: Date;

    @Expose()
    @Column({ default: ChatRank.Member })
    chatRank: ChatRank;

    @OneToMany(
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        type => StreamQueueEntity,
        StreamQueue => StreamQueue.user
    )
    streamsQueued: StreamQueueEntity[];

    @Exclude()
    @CreateDateColumn()
    createdAt: Date;

    @Exclude()
    @UpdateDateColumn()
    updatedAt: Date;

    changePoints(amount: number) {
        if (this.points != undefined) {
            this.points = Math.round(this.points + amount);
        } else {
            this.points = Math.round(amount);
        }
    }
}
