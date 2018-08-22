import {BaseEntity, Column, Entity, getConnection, ManyToOne, PrimaryGeneratedColumn} from "typeorm";
import {User} from "./User";
import {StreamSession} from "./StreamSession";

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

        let streamSession: StreamSession[];
        //WatchSession where existing StreamSession
        if (process.env.NODE_ENV === "test") {
            streamSession = await getConnection("test").getRepository(StreamSession).createQueryBuilder("stream")
                //.where("stream.last >= :start", {start: this.startTime().toISOString()})
                //.andWhere("stream.start <= :last", {last: this.lastTime().toISOString()})
                .getMany();
        }
        else {
            streamSession = await StreamSession.createQueryBuilder("stream")
                //.where("stream.last >= :start", {start: this.startTime().toISOString()})
                //.andWhere("stream.start <= :last", {last: this.lastTime().toISOString()})
                .getMany();
        }

        let total: number = 0;
        streamSession.forEach((session) => {
            total += ((dateRangeOverlap(this.startTime(), this.lastTime(), session.startTime(), session.lastTime()) / 1000) / 10);
        });

        return total;
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
