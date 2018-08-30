import {BaseEntity, Column, Entity, ManyToOne, PrimaryGeneratedColumn} from "typeorm";
import {User} from "./User";
import {StreamSession} from "./StreamSession";
import {getDBConnection} from "../connection";
import moment = require("moment");

@Entity()
export class WatchSession extends BaseEntity {

    @PrimaryGeneratedColumn()
    id: number;

    @Column("datetime", {default: () => 'CURRENT_TIMESTAMP'})
    start: Date | number;

    @Column("datetime", {default: () => 'CURRENT_TIMESTAMP'})
    last: Date | number;

    @ManyToOne(type => User, user => user.watchSession, {onDelete: "CASCADE"})
    user: User;

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

    async points(): Promise<number> {
        let relation = await getDBConnection().getRepository(WatchSession).findOne(this.id, {relations: ["user"]});

        let streamSession: StreamSession[];

        let repository = getDBConnection().getRepository(StreamSession);

        //WatchSession where existing StreamSession
        streamSession = await repository.createQueryBuilder("stream")
            .where("stream.last > :start", {start: moment(this.startTime()).utc().format("YYYY-MM-DD HH:mm:ss")})
            .andWhere("stream.start < :last", {last: moment(this.lastTime()).utc().format("YYYY-MM-DD HH:mm:ss")})
            .andWhere("stream.userId != :id", {id: relation.user.id})
            .getMany();


        let total: number = 0;
        streamSession.forEach((session) => {
            total += ((dateRangeOverlap(this.startTime(), this.lastTime(), session.startTime(), session.lastTime()) / 1000));
        });

        return total;
    }

    static async viewers(): Promise<number> {
        let repository = getDBConnection().getRepository(WatchSession);

        return (await repository.createQueryBuilder("session")
            .where("session.last > :current", {current: moment().subtract(30, "seconds").utc().format("YYYY-MM-DD HH:mm:ss")})
            .getCount());
    }


}


//Get milliseconds where streamSession and WatchSession overlap
export function dateRangeOverlap(start1: Date, last1: Date, start2: Date, last2: Date): number {

    //If 1 overlap enteirly 2
    if (start1 <= start2 && last1 >= last2) {
        return last2.getTime() - start2.getTime();
    }

    //If 2 overlap enteirly 1
    if (start2 <= start1 && last2 >= last1) {
        return last1.getTime() - start1.getTime();
    }

    //If 2 partial on the right
    if (last2 >= last1 && start2 <= last1) {
        return last1.getTime() - start2.getTime();
    }

    //If 2 partial on the left
    if (last2 <= last1 && last2 >= start1) {
        return last2.getTime() - start1.getTime();
    }

    return 0;

}
