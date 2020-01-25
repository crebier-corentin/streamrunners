import {
    BaseEntity,
    Column,
    CreateDateColumn,
    Entity,
    JoinColumn,
    ManyToOne,
    PrimaryGeneratedColumn,
    RelationId
} from "typeorm";
import {User} from "./User";
import {Raffle} from "./Raffle";

@Entity()
export class RaffleParticipation extends BaseEntity {

    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(type => User, u => u.raffleParticipations)
    user: User;

    @ManyToOne(type => Raffle, r => r.participations)
    @JoinColumn({name: "raffleId"})
    raffle: Raffle;

    @Column({default: 0})
    tickets: number;

    @CreateDateColumn()
    createdAt: Date;

    static findForUserAndRaffle(user: User | number, raffle: Raffle | number): Promise<RaffleParticipation | undefined> {

        const userId = user instanceof User ? user.id : user;
        const raffleId = raffle instanceof Raffle ? raffle.id : raffle;

        return RaffleParticipation.createQueryBuilder("rp")
            .leftJoinAndSelect("rp.user", "user")
            .leftJoinAndSelect("rp.raffle", "raffle")
            .where("user.id = :userId", {userId})
            .andWhere("raffle.id = :raffleId", {raffleId})
            .getOne();
    }

    static async findOrCreate(user: User | number, raffle: Raffle | number): Promise<RaffleParticipation> {
        let rp = await RaffleParticipation.findForUserAndRaffle(user, raffle);

        //Create new RaffleParticipation
        if (rp == undefined) {
            rp = new RaffleParticipation();

            //Relations
            rp.user = user instanceof User ? user : await User.findOne(user);
            rp.raffle = raffle instanceof Raffle ? raffle : await Raffle.findOne(raffle);

            rp = await rp.save();

        }

        return rp;
    }
}
