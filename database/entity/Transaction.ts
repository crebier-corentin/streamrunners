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

export interface ProductInterface {
    name: string;
    display_name: string;
    amount: string;
    description: string;
    image?: string;

    apply: (user: User) => Promise<void>
}

export const products: ProductInterface[] = [{
    name: "double_points",
    display_name: "Potion double points",
    description: "Gagner le double de points pendant une semaine !",
    amount: "0.99",

    apply: async (user: User) => {
        await user.addPower("double_points");
    }
}];

export function getProduct(name: string): ProductInterface | false {

    for (const product of products) {
        if (product.name === name) {
            return product;
        }
    }

    return false;

}

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
    braintreeId: string;

    @CreateDateColumn()
    createdAt: Date;

    @ManyToOne(type => User, user => user.transactions, {cascade: true})
    @JoinColumn({name: "userId"})
    user: User;

}

