/* eslint-disable @typescript-eslint/no-unused-vars */
import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { UserEntity } from '../user/user.entity';

@Entity('announcement')
export class AnnouncementEntity {
    @PrimaryGeneratedColumn()
    public id: number;

    @Column()
    public text: string;

    @Column()
    public color: string;

    @Column()
    public url: string;

    @Column({ default: false })
    public active: boolean;

    @ManyToOne(type => UserEntity)
    public createdBy: UserEntity;

    @CreateDateColumn()
    public createdAt: Date;
}
