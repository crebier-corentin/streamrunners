/* eslint-disable @typescript-eslint/no-unused-vars */
import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { CaseTypeEntity } from './case-type.entity';
import { SteamKeyCategoryEntity } from './steam-key/steam-key-category.entity';

/**
 * Entity representing a prize for a case type.
 *
 * @category Entity
 *
 */
@Entity('case_content')
export class CaseContentEntity {
    @PrimaryGeneratedColumn()
    public id: number;

    /**
     * Name of the prize, will be display to the user.
     */
    @Column()
    public name: string;

    /**
     * Url (can be relative) to the prize's image.
     */
    @Column({ nullable: true })
    public image: string;

    /**
     * Chance of obtaining this prize in per-mille.\
     * The total of chances of a [[CaseTypeEntity]] should be 1000.
     */
    @Column()
    public chance: number;

    /**
     * Points won.\
     * Will be ignored if [[keyCategory]] is not null.
     */
    @Column({ default: 0 })
    public amountPoints: number;

    /**
     * Meteores won.\
     * Will be ignored if [[keyCategory]] is not null.
     */
    @Column({ default: 0 })
    public amountMeteores: number;

    /**
     * Category of the key to win.\
     * The key will be selected randomly among the available ones.
     */
    @ManyToOne(type => SteamKeyCategoryEntity, { nullable: true })
    public keyCategory: SteamKeyCategoryEntity | null;

    /**
     * Case type the prize belongs to.
     */
    @ManyToOne(
        type => CaseTypeEntity,
        c => c.contents,
        { nullable: false }
    )
    public caseType: CaseTypeEntity;

    @CreateDateColumn()
    public createdAt: Date;

    @UpdateDateColumn()
    public updatedAt: Date;

    /**
     * @returns An hexadecimal color code based on the rarity of obtaining this prize.
     */
    public get color(): string {
        //Golden 0% - 1.99%
        if (this.chance > 0 && this.chance <= 1.99 * 10) {
            return '#ffd700';
        }

        //Red 2% - 3%
        if (this.chance > 1.99 * 10 && this.chance <= 3 * 10) {
            return '#cf0a1d';
        }

        //Purple 3% - 15%
        if (this.chance > 3 * 10 && this.chance <= 15 * 10) {
            return '#2e006c';
        }

        //Blue 15% - 25%
        if (this.chance > 15 * 10 && this.chance <= 25 * 10) {
            return '#33cc33';
        }

        //Gray
        return '#0066ff';
    }
}
