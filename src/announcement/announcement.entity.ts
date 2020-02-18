/* eslint-disable @typescript-eslint/no-unused-vars */
import { UserEntity } from '../user/user.entity';
import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

@Entity('announcement')
export class AnnouncementEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    text: string;

    @Column()
    color: string;

    @Column()
    url: string;

    @Column({ default: false })
    active: boolean;

    @ManyToOne(type => UserEntity)
    createdBy: UserEntity;

    @CreateDateColumn()
    createdAt: Date;
}
