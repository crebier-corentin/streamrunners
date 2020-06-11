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
import { SteamKeyEntity } from './steam-key/steam-key.entity';

/**
 * Entity representing a case belonging to a user.\
 * Use [[CaseService.giveCase]] to give a new case to a user.
 *
 * @category Entity
 *
 */
@Entity('case')
export class CaseEntity {
    @PrimaryGeneratedColumn()
    public id: number;

    /**
     * Owner of the case.
     */
    @ManyToOne(
        type => UserEntity,
        u => u.cases,
        { nullable: false }
    )
    public user: UserEntity;

    /**
     * Type of case.\
     * Determines it's name, images, possible prizes, etc...
     */
    @ManyToOne(type => CaseTypeEntity, { nullable: false, eager: true })
    public type: CaseTypeEntity;

    /**
     * Prize won in the case.\
     * If the prize is a key, it's set to [[key]].
     *
     * null if the case hasn't been opened yet.
     *
     * Set by [[CaseService.openCase]].
     */
    @ManyToOne(type => CaseContentEntity, { eager: true })
    public content: CaseContentEntity;

    /**
     * Key won if the prize is a key.
     */
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

    /**
     * @returns If the case has been opened or not.
     */
    public isOpened(): boolean {
        return this.content != null;
    }
}
