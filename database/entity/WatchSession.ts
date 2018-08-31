import {BaseEntity, Column, Entity, ManyToOne, PrimaryGeneratedColumn} from "typeorm";
import {User} from "./User";
import {StreamSession} from "./StreamSession";
import {getDBConnection} from "../connection";
import moment = require("moment");

interface DateRange {
    start: Date;
    last: Date;
}


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

    static async viewers(): Promise<number> {
        let repository = getDBConnection().getRepository(WatchSession);

        return (await repository.createQueryBuilder("session")
            .where("session.last > :current", {current: moment().subtract(30, "seconds").utc().format("YYYY-MM-DD HH:mm:ss")})
            .getCount());
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


        //Range where dates overlap
        let ranges: DateRange[] = [];
        streamSession.forEach((session) => {
            let items = dateRangeOverlapRange(this.startTime(), this.lastTime(), session.startTime(), session.lastTime());
            if (items != null) {
                ranges.push(items);
            }
        });

        let total = 0;

        //Ranges
        for (const range of ranges) {
            total += await this.VIPPoints(range.start, range.last);
        }

        return total;
    }

    //Return the number of points with vip and without
    private async VIPPoints(start: Date, last: Date): Promise<number> {

        let relation = await getDBConnection().getRepository(WatchSession).findOne(this.id, {relations: ["user"]});
        //Get user VIP
        let vips = await relation.user.vip;

        let total = 0;

        if (vips.length > 0) {

            vips.forEach((vip) => {
                let vipMS = dateRangeOverlapMS(start, last, vip.startTime(), vip.lastTime());

                if (vipMS > 0) {
                    //Vip
                    total += vipMS / 1000 * 2;

                    //Other
                    total += (last.getTime() - start.getTime() - vipMS) / 1000;

                }
                else {
                    total += (last.getTime() - start.getTime() - vipMS) / 1000;
                }

            });
        }
        else {
            total += (last.getTime() - start.getTime()) / 1000;
        }

        return Math.round(total);


    }


}


//Get milliseconds where streamSession and WatchSession overlap
export function dateRangeOverlapMS(start1: Date, last1: Date, start2: Date, last2: Date): number {

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

//Get range where date overlap
export function dateRangeOverlapRange(start1: Date, last1: Date, start2: Date, last2: Date): DateRange {

    //If 1 overlap enteirly 2
    if (start1 <= start2 && last1 >= last2) {
        return {last: last2, start: start2};
    }

    //If 2 overlap enteirly 1
    if (start2 <= start1 && last2 >= last1) {
        return {last: last1, start: start1};
    }

    //If 2 partial on the right
    if (last2 >= last1 && start2 <= last1) {
        return {last: last1, start: start2};
    }

    //If 2 partial on the left
    if (last2 <= last1 && last2 >= start1) {
        return {last: last2, start: start1};
    }

    return null;

}

