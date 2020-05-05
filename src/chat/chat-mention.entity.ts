/* eslint-disable @typescript-eslint/no-unused-vars */
import { Expose } from 'class-transformer';
import {
    Column,
    CreateDateColumn,
    Entity,
    ManyToOne,
    PrimaryGeneratedColumn,
    RelationId,
    UpdateDateColumn,
} from 'typeorm';
import { UserEntity } from '../user/user.entity';
import { ChatMessageEntity } from './chat-message.entity';

@Entity('chat_mention')
export class ChatMentionEntity {
    @PrimaryGeneratedColumn()
    public id: number;

    @ManyToOne(type => ChatMessageEntity, { nullable: false })
    public message: ChatMessageEntity;

    @ManyToOne(type => UserEntity, { nullable: false })
    public user: UserEntity;

    @Expose()
    @RelationId((m: ChatMentionEntity) => m.user)
    public userId: number;

    @Expose()
    @Column({ unsigned: true })
    public start: number;

    @Expose()
    @Column({ unsigned: true })
    public end: number;

    @CreateDateColumn()
    public createdAt: Date;

    @UpdateDateColumn()
    public updatedAt: Date;
}
