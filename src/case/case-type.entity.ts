/* eslint-disable @typescript-eslint/no-unused-vars */
import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { CaseContentEntity } from './case-content.entity';

/**
 * Entity representing a case type.\
 * Stores global info like the name, images, prizes, if the case is buyable and the price...
 *
 * @category Entity
 */
@Entity('case_type')
export class CaseTypeEntity {
    @PrimaryGeneratedColumn()
    public id: number;

    /**
     * Name of the case.\
     * Will be displayed to the user.
     */
    @Column({ unique: true })
    public name: string;

    /**
     * Url (can be relative) to the image shown when the case is opened.
     */
    @Column({ nullable: true })
    public openImage: string;

    /**
     * Url (can be relative) to the image shown when the case is closed.
     */
    @Column({ nullable: true })
    public closeImage: string;

    /**
     * Possible prizes to win.
     */
    @OneToMany(
        type => CaseContentEntity,
        c => c.caseType
    )
    public contents: CaseContentEntity[];

    /**
     * If the case is buyable in the shop.
     */
    @Column({ default: false })
    public buyable: boolean;

    /**
     * Price in points for the shop.\
     * Useless if [[buyable]] is false.
     */
    @Column({ default: 0, unsigned: true, width: 10 })
    public price: number;

    @CreateDateColumn()
    public createdAt: Date;

    @UpdateDateColumn()
    public updatedAt: Date;
}
