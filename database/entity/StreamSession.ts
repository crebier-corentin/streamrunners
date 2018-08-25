import {
    BaseEntity,
    Column,
    CreateDateColumn,
    Entity,
    getConnection,
    ManyToOne,
    PrimaryGeneratedColumn,
    Repository
} from "typeorm";
import {User} from "./User";
import {StreamQueue} from "./StreamQueue";
import moment = require("moment");
import {getDBConnection} from "../connection";

@Entity()
export class StreamSession extends BaseEntity {

    @PrimaryGeneratedColumn()
    id: number;

    @Column({default: 100})
    amount: number;

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

    @Column({default: false})
    ended: boolean;

    @CreateDateColumn()
    createdAt: Date;

    @ManyToOne(type => User, user => user.streamSession, {onDelete: "CASCADE"})
    user: User;

    static async newStreamSession(user: User, time: number = 60, amount: number = 100): Promise<StreamSession> {

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

export async function updateStreamSession() {
    let newDate = moment();

    let currentStream = await StreamQueue.currentStream();

    //If no current stream
    if(currentStream == undefined) {
        return;
    }

    let isOnline = await StreamQueue.isCurrentOnline(currentStream.user.username);

    let repository: Repository<StreamSession> = getDBConnection().getRepository(StreamSession);

    let streamSession = await repository.createQueryBuilder("stream")
        .leftJoinAndSelect("stream.user", "user")
        .where("user.id = :user", {user: currentStream.user.id})
        .where("stream.ended = false")
        .orderBy("stream.createdAt", "DESC")
        .getOne();

    //If first time
    if (streamSession != undefined) {

        //If the stream is offline
        if (!isOnline) {

            streamSession.ended = true;
            repository.save(streamSession);
            return;

        }

        //Compare if less than 5 seconds since lastTime update
        if (moment(streamSession.lastTime()).add(5, "seconds") >= newDate) {
            //Its been less than 5 seconds since lastTime update
            streamSession.last = newDate.toDate();
            streamSession.save();
            return;

        }
        //End previous session
        else {
            streamSession.ended = true;
            repository.save(streamSession);
        }

    }

    if (isOnline) {

        //Its been more than 5 seconds since lastTime update, startTime new streamSession
        //or
        //First streamSession
        let newStreamSession = new StreamSession();

        newStreamSession.user = currentStream.user;
        repository.save(newStreamSession);

    }

}
