import {
    BaseEntity,
    Column,
    Entity,
    JoinColumn,
    ManyToMany,
    ManyToOne, ObjectType,
    OneToMany,
    PrimaryGeneratedColumn, Repository
} from "typeorm";
import {User} from "./User";
import {CaseContent} from "./CaseContent";
import {CaseOwned} from "./CaseOwned";
import {getDBConnection} from "../connection";

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

interface CaseInterface {
    id?: number;
    name: string;
    content: CaseContentInterface[];
}

interface CaseContentInterface {
    id?: number;
    name: string;
    amount: number;
    chance: number;
    special: string;
    case?: CaseInterface;
}

export async function syncCases(cases: Array<CaseInterface>) {

    const caseRepo = getDBConnection().getRepository(Case);
    const caseContentRepo = getDBConnection().getRepository(CaseContent);

    for (let c of cases) {

        //Find or create
        const tmp = await caseRepo.findOne({where: {name: c.name}});
        let caseModel = (tmp == undefined ? new Case() : tmp);

        //Update and save
        caseModel.name = c.name;
        caseRepo.save(caseModel);

        //Reload caseModel
        caseModel = await caseRepo.findOne({where: {name: caseModel.name}});

        //Case content
        for (let content of c.content) {

            //Find or create
            const tmp2 = await caseContentRepo.createQueryBuilder("content")
                .leftJoinAndSelect("case", "case")
                .where("content.name = :name", {name: content.name})
                .andWhere("case.id = :id", {id: caseModel.id})
                .getOne();
            let caseContentModel = (tmp2 == undefined ? new CaseContent() : tmp2);

            //Update and save
            caseContentModel.name = content.name;
            caseContentModel.amount = content.amount;
            caseContentModel.chance = content.chance;
            caseContentModel.special = content.special;
            caseContentModel.case = caseModel;

            caseContentRepo.save(caseContentModel);

        }


    }

}
