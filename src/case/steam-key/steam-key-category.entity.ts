/* eslint-disable @typescript-eslint/no-unused-vars */
import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { SteamKeyEntity } from './steam-key.entity';

/**
 * Entity representing a category (usually game name) for keys.\
 *
 * @category Entity
 *
 */
@Entity('steam_key_category')
export class SteamKeyCategoryEntity {
    @PrimaryGeneratedColumn()
    public id: number;

    /**
     * Name of the category.
     *
     * @example random
     * @example game name
     */
    @Column({ unique: true })
    public name: string;

    /**
     * Keys belonging to this category.-
     */
    @OneToMany(
        type => SteamKeyEntity,
        key => key.category
    )
    public keys: SteamKeyEntity[];

    /**
     * If keys of this category can be bought in the shop.
     */
    @Column({ default: false })
    public buyable: boolean;

    /**
     * If [[buyable]], price in points for a single key.
     */
    @Column({ unsigned: true, default: 0 })
    public cost: number;

    @CreateDateColumn()
    public createdAt: Date;

    @UpdateDateColumn()
    public updatedAt: Date;
}
