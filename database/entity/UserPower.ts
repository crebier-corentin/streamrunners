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

import {User} from "./User";
import moment = require("moment");
import {getDBConnection} from "../connection";

export interface Power {
    name: string;
    description: string;
    time: number;
    image?: string;
}

export const powers: Power[] = [
    {
        name: "double_points",
        description: "Gagne le double de points !",
        time: 60 * 60 * 24 * 7
    },
];

export function getPower(name: string): Power | false {

    for (const power of powers) {
        if (power.name === name) {
            return power;
        }
    }

    return false;

}


@Entity()
export class UserPower extends BaseEntity {

    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(type => User, user => user.powers, {cascade: true})
    @JoinColumn({name: "userId"})
    user: User;

    @Column()
    powerName: string;

    @Column({default: false})
    used: boolean;

    @Column("datetime", {nullable: true, default: null})
    expires: Date | number;

    expiresTime(): Date {
        if (this.expires instanceof Date) {
            return this.expires;
        }
        else {
            return new Date(this.expires);
        }
    }

    hasExpired(): boolean {
        //If not used
        if (this.used || this.expires == null) {
            return false;
        }

        //If expired
        return new Date() > this.expiresTime();


    }

    power(): Power {
        return <Power>getPower(this.powerName);
    }

    async use(): Promise<void> {

        if (this.hasExpired() || this.used) {
            throw "Power has expired";
        }

        this.used = true;
        this.expires = moment().add(this.power().time, "seconds").toDate();

        await getDBConnection().getRepository(UserPower).save(this);
    }
}