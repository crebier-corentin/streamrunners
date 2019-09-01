import {
    BaseEntity,
    Column, CreateDateColumn,
    Entity,
    JoinColumn,
    ManyToMany,
    ManyToOne,
    OneToMany, OneToOne,
    PrimaryGeneratedColumn
} from "typeorm";
import {User} from "./User";
import {CaseContent} from "./CaseContent";
import {Case} from "./Case";
import {randomString} from "../connection";
import {SteamKey} from "./SteamKey";

@Entity()
export class CaseOwned extends BaseEntity {

    @PrimaryGeneratedColumn()
    id: number;

    @Column({unique: true})
    uuid: string;

    @ManyToOne(type => User, user => user.cases, {nullable: true})
    user: User;

    @ManyToOne(type => Case, Case => Case.caseOwned, {cascade: true, eager: true})
    case: Case;

    @ManyToOne(type => CaseContent, CaseContent => CaseContent.caseOwned, {cascade: true, eager: true, nullable: true})
    content: CaseContent;

    @OneToMany(type => SteamKey, steamKey => steamKey.caseOwned, {nullable: true, eager: true, cascade: true})
    relationSteamKey: SteamKey[];

    get steamKey() {
        return this.relationSteamKey[0];
    }

    set steamKey(newValue) {
        this.relationSteamKey[0] = newValue;
    }

    @CreateDateColumn()
    createdAt: Date;

    isOpened() : boolean {
        return this.content != null;
    }


}
