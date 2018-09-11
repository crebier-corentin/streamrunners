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
import {getDBConnection} from "../connection";

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

    getRareColor(): string {
        const value = this.chance;

        //If special
        if (value == null) {
            switch (this.special) {
                case "logo_banniere":
                case "steam":
                    return "#ffd700";
                case "badge_beta":
                    return "#cf0a1d";


            }
        }

        //Dorée
        if (value > 0 && value <= 1.99 * 100) {
            return "#ffd700";
        }

        //Rouge
        if (value > 1.99 * 100 && value <= 3 * 100) {
            return "#cf0a1d";
        }

        //Violet
        if (value > 3 * 100 && value <= 15 * 100) {
            return "#2e006c";
        }

        //Bleu
        if (value > 15 * 100 && value <= 23 * 100) {
            return "#0f056b";
        }

        //Gris
        return "#808080";


    }

    async applyContent(user: User) {
        const userRepository = getDBConnection().getRepository(User);


        if (this.special != null) {

            switch (this.special) {
                case "badge_beta":
                    user.betaBage = true;
                    break;
            }

        }
        else {

            //Points
            await user.changePoints(this.amount);
        }

        await userRepository.save(user);
    }


}
