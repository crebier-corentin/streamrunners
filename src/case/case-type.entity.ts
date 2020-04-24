/* eslint-disable @typescript-eslint/no-unused-vars */
import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { CaseContentEntity } from './case-content.entity';

@Entity('case_type')
export class CaseTypeEntity {
    @PrimaryGeneratedColumn()
    public id: number;

    @Column({ unique: true })
    public name: string;

    @Column({ nullable: true })
    public openImage: string;

    @Column({ nullable: true })
    public closeImage: string;

    @OneToMany(
        type => CaseContentEntity,
        c => c.caseType
    )
    public contents: CaseContentEntity[];

    @Column({ default: false })
    public buyable: boolean;

    @Column({ default: 0, unsigned: true, width: 10 })
    public price: number;

    @CreateDateColumn()
    public createdAt: Date;

    @UpdateDateColumn()
    public updatedAt: Date;
}
