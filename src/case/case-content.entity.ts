/* eslint-disable @typescript-eslint/no-unused-vars */
import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { CaseTypeEntity } from './case-type.entity';

@Entity('case_content')
export class CaseContentEntity {
    @PrimaryGeneratedColumn()
    public id: number;

    @Column({ unique: true })
    public name: string;

    @Column({ nullable: true })
    public image: string;

    @Column()
    public chance: number; //In per-mille 0-1000

    @Column({ nullable: true })
    public amount: number;

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
            return '#0f056b';
        }

        //Gray
        return '#808080';
    }
}
