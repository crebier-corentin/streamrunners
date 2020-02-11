import {
    Column,
    CreateDateColumn,
    Entity,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from 'typeorm';
import { ChatRank } from '../../shared/types';
import { Exclude } from 'class-transformer';

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

    @Exclude()
    @CreateDateColumn()
    createdAt: Date;

    @Exclude()
    @UpdateDateColumn()
    updatedAt: Date;
}
