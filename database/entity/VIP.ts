import {BaseEntity, Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, Repository} from "typeorm";
import {User} from "./User";
import {StreamQueue} from "./StreamQueue";
import {getDBConnection} from "../connection";
const moment = require("moment");

@Entity()
export class VIP extends BaseEntity {

    @PrimaryGeneratedColumn()
    id: number;

    @Column("datetime", {default: () => 'CURRENT_TIMESTAMP'})
    start: Date | number;

    @Column("datetime", {default: () => 'CURRENT_TIMESTAMP'})
    last: Date | number;

    startTime(): Date {
        if (this.start instanceof Date) {
            return this.start;
        }
        else {
            return new Date(this.start);
        }
    }

    lastTime(): Date {
        if (this.last instanceof Date) {
            return this.last;
        }
        else {
            return new Date(this.last);
        }
    }

    @ManyToOne(type => User, {onDelete: "CASCADE"})
    user: User;


}

