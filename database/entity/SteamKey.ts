import {
    BaseEntity,
    Column,
    Entity,
    JoinColumn,
    ManyToMany,
    ManyToOne,
    OneToMany,
    OneToOne,
    PrimaryGeneratedColumn
} from "typeorm";
import {User} from "./User";
import {CaseOwned} from "./CaseOwned";
import {getDBConnection} from "../connection";
import {CaseContent} from "./CaseContent";

@Entity()
export class SteamKey extends BaseEntity {

    @PrimaryGeneratedColumn()
    id: number;

    @Column({unique: true})
    key: string;

    @Column()
    game: string;

    @ManyToOne(type => CaseOwned, caseOwned => caseOwned.relationSteamKey, {nullable: true})
    @JoinColumn({name: "caseOwnedId"})
    caseOwned: CaseOwned;

    //Check if all keys has been taken
    static async isAvailable(): Promise<boolean> {

        let keys = await getDBConnection().getRepository(SteamKey).createQueryBuilder("key")
            .where("caseOwnedId IS NULL")
            .getMany();

        return keys.length > 0;
    }

    static async random(): Promise<SteamKey> {
        function shuffle(a) {
            for (let i = a.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [a[i], a[j]] = [a[j], a[i]];
            }
            return a;
        }


        let keys = await getDBConnection().getRepository(SteamKey).createQueryBuilder("key")
            .where("caseOwnedId IS NULL")
            .getMany();


        return shuffle(keys)[0];
    }

}
