/* eslint-disable @typescript-eslint/no-unused-vars */
import { Exclude, Expose, Transform, Type } from 'class-transformer';
import {
    Column,
    CreateDateColumn,
    Entity,
    ManyToOne,
    OneToMany,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from 'typeorm';
import { UserEntity } from '../user/user.entity';
import { ChatMentionEntity } from './chat-mention.entity';
import moment = require('moment');

@Entity('chat_message')
@Expose()
export class ChatMessageEntity {
    @PrimaryGeneratedColumn()
    public id: number;

    @Type(type => UserEntity)
    @ManyToOne(
        type => UserEntity,
        user => user.chatMessages
    )
    public author: UserEntity;

    @Transform((value, obj: ChatMessageEntity) =>
        obj.deleted ? `Message supprimé par ${obj.deletedBy.displayName}` : value
    ) //Deleted by message
    @Column('text')
    public message: string;

    @Type(type => ChatMentionEntity)
    @OneToMany(
        type => ChatMentionEntity,
        m => m.message,
        { cascade: true }
    )
    public mentions: ChatMentionEntity[];

    @Exclude()
    @ManyToOne(type => UserEntity, { nullable: true })
    public deletedBy: UserEntity | null;

    @Transform(value =>
        moment(value)
            .locale('fr')
            .fromNow()
    )
    @CreateDateColumn()
    public createdAt: Date;

    @Exclude()
    @UpdateDateColumn()
    public updatedAt: Date;

    @Expose()
    public get deleted(): boolean {
        return this.deletedBy != null;
    }
}
