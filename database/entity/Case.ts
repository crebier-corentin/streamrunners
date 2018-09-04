import {
    BaseEntity,
    Column,
    Entity,
    JoinColumn,
    ManyToMany,
    ManyToOne,
    OneToMany,
    PrimaryGeneratedColumn
} from "typeorm";
import {User} from "./User";
import {CaseContent} from "./CaseContent";
import {CaseOwned} from "./CaseOwned";

@Entity()
export class Case extends BaseEntity {

    @PrimaryGeneratedColumn()
    id: number;

    @Column({unique: true})
    name: string;

    @OneToMany(type => CaseContent, CaseContent => CaseContent.case, {eager: true})
    content: CaseContent[];

    @OneToMany(type => CaseOwned, CaseOwned => CaseOwned.case)
    caseOwned: CaseOwned[];


}
