import { ChatRank } from '../shared/types';
import { StreamQueueEntity } from '../watch/stream-queue.entity';
import { Exclude } from 'class-transformer';
import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

@Entity('user')
export class UserEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    twitchId: string;

    @Column()
    username: string;

    @Column()
    displayName: string;

    @Column()
    avatar: string;

    @Column({ default: 0 })
    points: number;

    @Column({ default: false })
    moderator: boolean;

    @Exclude()
    @Column('datetime', { default: () => 'CURRENT_TIMESTAMP' })
    lastUpdate: Date;

    @Exclude()
    @Column('datetime', { default: () => 'CURRENT_TIMESTAMP' })
    lastOnWatchPage: Date;

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
}
