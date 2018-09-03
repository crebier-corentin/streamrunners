import {
    BaseEntity,
    Column,
    Entity,
    JoinColumn,
    JoinTable,
    ManyToMany,
    OneToMany,
    PrimaryGeneratedColumn
} from "typeorm";
import {StreamQueue} from "./StreamQueue";
import {VIP} from "./VIP";
import {getDBConnection} from "../connection";
import moment = require("moment");
import {Coupon} from "./Coupon";

const uuidv4 = require('uuid/v4');


@Entity()
export class User extends BaseEntity {

    @PrimaryGeneratedColumn()
    id: number;
    @Column()
    twitchId: string;
    @Column()
    username: string;
    @Column()
    display_name: string;
    @Column()
    email: string;
    @Column()
    avatar: string;

    @Column({default: 0})
    points: number;

    @Column({default: false})
    moderator: boolean;

    async changePoints(amount: number) {
        let repository = getDBConnection().getRepository(User);

        if (this.points != undefined) {
            this.points = Math.round(this.points + amount);
            await repository.save(this);
        }
        else {
            this.points = Math.round(amount);
            await repository.save(this);
        }
    }

    @Column("datetime", {default: () => 'CURRENT_TIMESTAMP'})
    lastUpdate: Date | number;

    lastUpdateTime(): Date {
        if (this.lastUpdate instanceof Date) {
            return this.lastUpdate;
        }
        else {
            return new Date(this.lastUpdate);
        }
    }

    @OneToMany(type => StreamQueue, StreamQueue => StreamQueue.user, {onDelete: "CASCADE", eager: true})
    streamQueue: StreamQueue[];

    @OneToMany(type => VIP, VIP => VIP.user, {onDelete: "CASCADE", eager: true})
    vip: VIP[];

    @ManyToMany(type => Coupon, coupon => coupon.users)
    @JoinTable()
    coupons: Coupon[];


    /*    //Parrain
        @Column({unique: true, default: uuidv4()})
        parrainage_id: string;

        @OneToMany(type => User, User => User.parrain)
        @JoinColumn({referencedColumnName: "parrainage_id"})
        parraine: User[];

        @ManyToOne(type => User, User => User.parraine)
        parrain: User;*/

    static async viewers(): Promise<number> {
        let repository = getDBConnection().getRepository(User);

        return (await repository.createQueryBuilder("user")
            .where("user.lastUpdate > :current", {current: moment().subtract(30, "seconds").utc().format("YYYY-MM-DD HH:mm:ss")})
            .getCount());
    }

    hasUsedCoupon(code: string): boolean {
        for (const coupon of this.coupons) {
            if (code === coupon.name) {
                return false;
            }
        }
        return true;
    }


}


declare global {
    namespace Express {
        interface Request {
            user?: User;
        }
    }

    namespace e {
        interface Request {
            user?: User;
        }
    }
}