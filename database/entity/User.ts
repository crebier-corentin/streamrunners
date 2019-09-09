import {
    BaseEntity,
    Column,
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
import {Transaction} from "./Transaction";
import {Product} from "./Product";
import {Client} from "discord.js";

const moment = require("moment");
const uuidv4 = require('uuid/v4');

const cache = new CacheService(120);


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

    @OneToMany(type => StreamQueue, StreamQueue => StreamQueue.user, {eager: true})
    streamQueue: StreamQueue[];

    /* @OneToMany(type => VIP, VIP => VIP.user, {eager: true})
     vip: VIP[];*/

    @OneToMany(type => CaseOwned, CaseOwned => CaseOwned.user, {eager: true})
    cases: CaseOwned[];

    @ManyToMany(type => Coupon, coupon => coupon.users)
    @JoinTable()
    coupons: Coupon[];

    //Powers
    @OneToMany(type => UserPower, power => power.user, {eager: true})
    powers: UserPower[];

    //Add a power
    async addPower(name: string): Promise<void> {

        //Check if power exist
        if (getPower(name) !== false) {

            //Save Power
            let uPower = getDBConnection().getRepository(UserPower).create();
            uPower.powerName = name;
            uPower.id = 0;

            await getDBConnection().getRepository(UserPower).save(uPower).catch(e => console.log(e));

            this.powers.push(uPower);
            await getDBConnection().getRepository(User).save(this).catch(e => console.log(e));


            // this.powers.push(uPower);
            //await getDBConnection().getRepository(User).save(this).catch(e => console.log(e));
        }
        else {
            throw "Power do not exist";
        }

    }

    //Return current power or false
    currentPower(): UserPower | false {

        for (const power of this.powers) {
            if (power.used && !power.hasExpired()) {
                return power;
            }
        }

        return false;
    }

    @OneToMany(type => Transaction, transaction => transaction.user, {eager: true})
    transactions: Transaction[];

    @Column({default: false})
    betaBage: boolean;


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

    static async mostPoints(): Promise<any> {

        const userRepository = getDBConnection().getRepository(User);

        return await cache.get("mostPoints", async () => {

            return await userRepository.createQueryBuilder("user")
                .select(["user.username", "user.display_name", "user.points"])
                .orderBy("user.points", "DESC")
                .limit(10)
                .getMany();


        });

    }

    static async mostPlace(): Promise<any> {
        const userRepository = getDBConnection().getRepository(User);

        return await cache.get("mostPlace", async () => {

            const users = await userRepository.createQueryBuilder("user")
                .leftJoin("user.streamQueue", "queue")
                .select(["user.username", "user.display_name", "queue.time"])
                .getMany();

            return users.map((value: User) => {

                value['time'] = 0;

                for (const queue of value.streamQueue) {
                    value['time'] += queue.time;
                }

                delete value.streamQueue;

                return value;

            }).sort((a, b) => {
                return b['time'] - a['time'];
            })
                .splice(0, 10);


        });
    }

}


declare global {
    namespace Express {
        interface Request {
            user?: User;
            discord?: Client;
        }
    }

    namespace e {
        interface Request {
            user?: User;
            discord?: Client;
        }
    }
}