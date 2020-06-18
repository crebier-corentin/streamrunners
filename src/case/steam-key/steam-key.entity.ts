/* eslint-disable @typescript-eslint/no-unused-vars */
import {
    Column,
    CreateDateColumn,
    Entity,
    JoinColumn,
    ManyToOne,
    OneToOne,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from 'typeorm';
import { UserEntity } from '../../user/user.entity';
import { CaseEntity } from '../case.entity';
import { SteamKeyCategoryEntity } from './steam-key-category.entity';

/**
 * Entity representing a steam key that can be won in cases or bought from the shop.
 *
 * @category Entity
 *
 */
@Entity('steam_key')
export class SteamKeyEntity {
    @PrimaryGeneratedColumn()
    public id: number;

    /**
     * Name of the game associated to the key.\
     * Will be shown to the user.
     */
    @Column()
    public name: string;

    /**
     * Code used to redeem the game.
     */
    @Column({ unique: true })
    public code: string;

    /**
     * The key's category.
     */
    @ManyToOne(
        type => SteamKeyCategoryEntity,
        category => category.keys
    )
    public category: SteamKeyCategoryEntity;

    /**
     * Case containing this key.\
     * If [[case]] and [[user]] are null, the key is available.
     */
    @OneToOne(
        type => CaseEntity,
        c => c.key
    )
    public case: CaseEntity | null;

    /**
     * User who bought the key from the shop.\
     * If [[case]] and [[user]] are null, the key is available.
     */
    @ManyToOne(
        type => UserEntity,
        user => user.keys
    )
    @JoinColumn({ name: 'userId' })
    public user: UserEntity | null;

    @CreateDateColumn()
    public createdAt: Date;

    @UpdateDateColumn()
    public updatedAt: Date;
}
