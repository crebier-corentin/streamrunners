/* eslint-disable @typescript-eslint/no-unused-vars */
import {
    CreateDateColumn,
    Entity,
    JoinColumn,
    ManyToOne,
    OneToOne,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from 'typeorm';
import { UserEntity } from '../user/user.entity';
import { CaseContentEntity } from './case-content.entity';
import { CaseTypeEntity } from './case-type.entity';
import { SteamKeyEntity } from './steam-key.entity';

@Entity('case')
export class CaseEntity {
    @PrimaryGeneratedColumn()
    public id: number;

    @ManyToOne(
        type => UserEntity,
        u => u.cases,
        { nullable: false }
    )
    public user: UserEntity;

    @ManyToOne(type => CaseTypeEntity, { nullable: false, eager: true })
    public type: CaseTypeEntity;

    @ManyToOne(type => CaseContentEntity, { eager: true })
    public content: CaseContentEntity;

    @OneToOne(
        type => SteamKeyEntity,
        key => key.case,
        { nullable: true, eager: true }
    )
    @JoinColumn({ name: 'keyId' })
    public key: SteamKeyEntity | null;

    @CreateDateColumn()
    public createdAt: Date;

    @UpdateDateColumn()
    public updatedAt: Date;

    public isOpened(): boolean {
        return this.content != null;
    }
}
