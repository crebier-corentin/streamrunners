import {BaseEntity, Column, Entity, ManyToOne, PrimaryGeneratedColumn} from "typeorm";
import {User} from "./User";

@Entity()
export class WatchSession extends BaseEntity {

    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(type => User, user => user.watchSession, {onDelete: "CASCADE"})
    user: User;

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

    points(): number {
        return ((this.lastTime().getTime() - this.startTime().getTime()) / 1000) / 10;
    }


}
