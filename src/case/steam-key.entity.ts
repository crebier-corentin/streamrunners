/* eslint-disable @typescript-eslint/no-unused-vars */
import { Column, CreateDateColumn, Entity, OneToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { CaseEntity } from './case.entity';

@Entity('steam_key')
export class SteamKeyEntity {
    @PrimaryGeneratedColumn()
    public id: number;

    @Column()
    public name: string;

    @Column({ unique: true })
    public code: string;

    @Column({ default: 'random' })
    public category: string;

    @OneToOne(
        type => CaseEntity,
        c => c.key
    )
    public case: CaseEntity | null;

    @CreateDateColumn()
    public createdAt: Date;

    @UpdateDateColumn()
    public updatedAt: Date;
}
