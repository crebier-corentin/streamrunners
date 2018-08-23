import {BaseEntity, Column, Entity, getConnection, ManyToOne, PrimaryGeneratedColumn, Repository} from "typeorm";
import {User} from "./User";
import moment = require("moment");

@Entity()
export class StreamSession extends BaseEntity {

    @PrimaryGeneratedColumn()
    id: number;

    @Column({default: 100})
    amount: number;

    @Column("datetime")
    start: Date | number;

    @Column("datetime")
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

    @ManyToOne(type => User, user => user.streamSession, {onDelete: "CASCADE"})
    user: User;

    //If session has ended
    ended(): boolean {
        return this.lastTime() < new Date();
    }

    static async newStreamSession(user: User, time: number = 60, amount: number = 100) : Promise<StreamSession> {

        let repository: Repository<StreamSession>;

        if (process.env.NODE_ENV === "test") {
            repository = getConnection("test").getRepository(StreamSession);
        }
        else {
            repository = getConnection().getRepository(StreamSession);
        }

        let newSession = repository.create();

        newSession.user = user;
        newSession.amount = amount;

        //Get all not ended session
        let session = await repository.createQueryBuilder("session")
            .where("session.last > :current", {current: moment().utc().format("YYYY-MM-DD HH:mm:ss")})
            .orderBy("session.last", "DESC")
            .getOne();

        //Start
        if (session != undefined) {
            //Add new session after last session
            newSession.start = session.lastTime();
            newSession.last = moment(session.lastTime()).add(time, "seconds").toDate();

        }
        else {
            //Add new session now
            newSession.start = new Date();
            newSession.last = moment().add(time, "seconds").toDate();
        }

        //Save session
        await repository.save(newSession);

        return newSession;

    }


}
