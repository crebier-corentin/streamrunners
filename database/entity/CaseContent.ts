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
import {Case} from "./Case";
import {CaseOwned} from "./CaseOwned";

@Entity()
export class CaseContent extends BaseEntity {

    @PrimaryGeneratedColumn()
    id: number;

    @Column({unique: true})
    name: string;

    @Column({nullable: true})
    image: string;

    @Column({nullable: true})
    amount: number;

    @Column()
    chance: number;

    @Column({nullable: true})
    special: string;

    @ManyToOne(type => Case, Case => Case.content)
    case: Case;

    @OneToMany(type => CaseOwned, CaseOwned => CaseOwned.content)
    caseOwned: CaseOwned;



}
