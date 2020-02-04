import {BaseEntity, Column, Entity, JoinColumn, ManyToMany, OneToMany, PrimaryGeneratedColumn} from "typeorm";
import {User} from "./User";

@Entity()
export class Coupon extends BaseEntity {

    @PrimaryGeneratedColumn()
    id: number;

    @Column({unique: true})
    name: string;

    @Column()
    amount: number;

    @Column()
    max: number;

    @Column("datetime")
    expires: Date;

    @ManyToMany(type => User, user => user.coupons, {cascade: true})
    users: User[];

    isValid(): boolean {
        //Is not expired and used less than max
        return this.expires > new Date() && this.users.length < this.max;

    }


}
