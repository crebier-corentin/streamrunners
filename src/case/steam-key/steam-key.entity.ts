/* eslint-disable @typescript-eslint/no-unused-vars */
import {
    Column,
    CreateDateColumn,
    Entity,
    ManyToOne,
    OneToOne,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from 'typeorm';
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
     * null if key available.
     */
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
