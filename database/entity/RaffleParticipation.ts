import {BaseEntity, Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn} from "typeorm";
import {User} from "./User";
import {Raffle} from "./Raffle";

@Entity()
export class RaffleParticipation extends BaseEntity {

    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(type => User, u => u.raffleParticipations)
    user: User;

    @ManyToOne(type => Raffle, r => r.participations)
    raffle: Raffle;

    @Column({default: 0})
    tickets: number;

    @CreateDateColumn()
    createdAt: Date;

    static findForUserAndRaffle(user: User, raffle: Raffle): Promise<RaffleParticipation | undefined> {
        return RaffleParticipation.createQueryBuilder("rp")
            .leftJoinAndSelect("rp.user", "user")
            .leftJoinAndSelect("rp.raffle", "raffle")
            .where("user.id = :userId", {userId: user.id})
            .andWhere("raffle.id = :raffleId", {raffleId: raffle.id})
            .getOne();
    }

    static async findOrCreate(user: User, raffle: Raffle): Promise<RaffleParticipation> {
        let rp = await RaffleParticipation.findForUserAndRaffle(user, raffle);

        //Create new RaffleParticipation
        if (rp == undefined) {
            rp = new RaffleParticipation();
            rp.user = user;
            rp.raffle = raffle;

            rp = await rp.save();
        }

        return rp;
    }
}
