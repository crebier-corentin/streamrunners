/* eslint-disable @typescript-eslint/no-unused-vars */
import { UserEntity } from '../user/user.entity';
import { Exclude, Expose, Transform, Type } from 'class-transformer';
import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import moment = require('moment');

@Entity('chat_message')
@Expose()
export class ChatMessageEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Type(type => UserEntity)
    @ManyToOne(
        type => UserEntity,
        user => user.chatMessages
    )
    author: UserEntity;

    @Transform((value, obj: ChatMessageEntity) =>
        obj.deleted ? `Message supprimé par ${obj.deletedBy.displayName}` : value
    ) //Deleted by message
    @Column()
    message: string;

    @Exclude()
    @ManyToOne(type => UserEntity, { nullable: true })
    deletedBy: UserEntity | null;

    @Transform(value =>
        moment(value)
            .locale('fr')
            .fromNow()
    )
    @CreateDateColumn()
    createdAt: Date;

    @Expose()
    get deleted() {
        return this.deletedBy != null;
    }
}
