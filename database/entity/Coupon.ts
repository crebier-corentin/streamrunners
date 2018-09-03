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
    expires: Date | number;

    expiresTime(): Date {
        if (this.expires instanceof Date) {
            return this.expires;
        }
        else {
            return new Date(this.expires);
        }
    }

    @ManyToMany(type => User, {cascade: true, eager: true})
    users: User[];

    isValid(): boolean {
        //Is not expired and used less than max
        return this.expiresTime() > new Date() && this.users.length < this.max;

    }


}
