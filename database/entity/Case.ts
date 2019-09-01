import {BaseEntity, Column, Entity, OneToMany, PrimaryGeneratedColumn} from "typeorm";
import {CaseContent} from "./CaseContent";
import {CaseOwned} from "./CaseOwned";
import {getDBConnection} from "../connection";
import {SteamKey} from "./SteamKey";

@Entity()
export class Case extends BaseEntity {

    @PrimaryGeneratedColumn()
    id: number;

    @Column({unique: true})
    name: string;

    @Column({nullable: true})
    openImage: string;

    @Column({nullable: true})
    closeImage: string;

    @OneToMany(type => CaseContent, CaseContent => CaseContent.case, {eager: true})
    content: CaseContent[];

    @OneToMany(type => CaseOwned, CaseOwned => CaseOwned.case)
    caseOwned: CaseOwned[];

    async getRandomContent(): Promise<CaseContent> {

        //Check if relation is loaded
        let content;
        content = (this.content == undefined ? (await getDBConnection().getRepository(Case).findOne(this.id)).content : this.content);

        function realGetRandomContent(): CaseContent {

            let weights = []; //Probabilities
            for (const c of content) {
                weights.push(c.chance);
            }

            let results = content; // values to return


            let num = Math.random() * 10000,
                s = 0,
                lastIndex = weights.length - 1;

            for (let i = 0; i < lastIndex; ++i) {
                s += weights[i];
                if (num < s) {
                    return results[i];
                }
            }

            return results[lastIndex];
        }

        let result: CaseContent;

        //If no more key available
        if (!(await SteamKey.isAvailable())) {
            do {
                result = realGetRandomContent();
            } while (result.special === "steam");
        }
        else {
            result = realGetRandomContent();
        }

        return result;

    }


}

export interface CaseInterface {
    id?: number;
    name: string;
    openImage?: string;
    closeImage?: string;
    content: CaseContentInterface[];
}

export interface CaseContentInterface {
    id?: number;
    name: string;
    image?: string;
    amount: number | null;
    chance: number;
    special: string | null;
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

        caseModel.openImage = (c.openImage == undefined ? null : c.openImage);

        caseModel.closeImage = (c.closeImage == undefined ? null : c.closeImage);
        await caseRepo.save(caseModel);

        //Reload caseModel
        caseModel = await caseRepo.findOne({where: {name: caseModel.name}});

        //Case content
        for (let content of c.content) {

            //Find or create
            const tmp2 = await caseContentRepo.createQueryBuilder("content")
                .leftJoinAndSelect("content.case", "c")
                .where("LOWER(content.name) = LOWER(:name)", {name: content.name})
                .andWhere("c.id = :id", {id: caseModel.id})
                .getOne();
            let caseContentModel = (tmp2 == undefined ? new CaseContent() : tmp2);

            //Update and save
            caseContentModel.name = content.name;
            caseContentModel.amount = content.amount;
            caseContentModel.chance = content.chance;
            caseContentModel.special = content.special;
            caseContentModel.case = caseModel;

            caseContentModel.image = (content.image == undefined ? null : content.image);

            await caseContentRepo.save(caseContentModel);

        }


    }

}
