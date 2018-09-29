import {
    BaseEntity,
    Column, CreateDateColumn,
    Entity,
    JoinColumn,
    JoinTable,
    ManyToMany, ManyToOne,
    OneToMany,
    PrimaryGeneratedColumn
} from "typeorm";
import {StreamQueue} from "./StreamQueue";
import {VIP} from "./VIP";
import {getDBConnection} from "../connection";
import {Coupon} from "./Coupon";
import {CaseOwned} from "./CaseOwned";
import {getPower, Power, powers, UserPower} from "./UserPower";
import CacheService from "../../other/CacheService";
import {User} from "./User";

@Entity()
export class Transaction extends BaseEntity {

    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    status: string;

    @Column()
    amount: string;

    @Column()
    paymentInstrumentType: string;

    @Column()
    paypalId: string;

    @CreateDateColumn()
    createdAt: Date;

    @ManyToOne(type => User, user => user.transactions, {cascade: true})
    @JoinColumn({name: "userId"})
    user: User;

}

