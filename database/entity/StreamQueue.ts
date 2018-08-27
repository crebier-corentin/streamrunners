import {BaseEntity, Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, Repository} from "typeorm";
import {User} from "./User";
import axios from "axios";
import {getDBConnection} from "../connection";

@Entity()
export class StreamQueue extends BaseEntity {

    @PrimaryGeneratedColumn()
    id: number;

    //Price in points
    @Column({default: 100})
    amount: number;

    //Time in seconds
    @Column({default: 60})
    time: number;

    @Column({default: 0})
    current: number;

    @Column("datetime", {nullable: true, default: null})
    start: Date | number;

    startTime(): Date {
        if (this.start instanceof Date) {
            return this.start;
        }
        else {
            return new Date(this.start);
        }
    }

    @ManyToOne(type => User, user => user.streamQueue, {onDelete: "CASCADE"})
    user: User;

    @CreateDateColumn()
    createdAt: Date;

    //If session has ended
    ended(): boolean {
        return this.current >= this.time;
    }

    //Return false if queue is empty
    static async currentStream(): Promise<StreamQueue> {

        let repository: Repository<StreamQueue> = getDBConnection().getRepository(StreamQueue);

        return await repository.createQueryBuilder("queue")
            .leftJoinAndSelect("queue.user", "user")
            .where("queue.current < queue.time")
            .orderBy("queue.createdAt", "ASC")
            .getOne();

    }

    static async isCurrentOnline(username?: string): Promise<boolean> {

        let channel = username == undefined ? (await StreamQueue.currentStream()).user.username : username;

        let request = await axios.get(`https://api.twitch.tv/kraken/streams/${channel}`, {headers: {"Client-ID": process.env.TWITCH_CLIENT_ID}});

        return request.data.stream !== null;

    }

    static async currentAndNextStreams(): Promise<Array<StreamQueue>> {

        let repository: Repository<StreamQueue> = getDBConnection().getRepository(StreamQueue);

        return await repository.createQueryBuilder("queue")
            .select(["queue.time", "queue.current"])
            .leftJoin("queue.user", "user")
            .addSelect(["user.username", "user.avatar", "user.display_name"])
            .where("queue.current < queue.time")
            .orderBy("queue.createdAt", "ASC")
            .getMany();

    }

    static async isEmpty(): Promise<boolean> {

        let stream = await StreamQueue.currentStream();

        return (stream == undefined);

    }


}

export async function updateStreamQueue() {

    let repository: Repository<StreamQueue> = getDBConnection().getRepository(StreamQueue);

    let currentStream = await StreamQueue.currentStream();

    //If queue is empty do nothing
    if (currentStream == undefined) {
        return;
    }

    //Start if null
    if (currentStream.start == null) {
        currentStream.start = new Date();
        repository.save(currentStream);
    }
    //Update current
    else {
        let startTime = Math.round(currentStream.startTime().getTime() / 1000);

        currentStream.current = Math.round(new Date().getTime() / 1000) - startTime;
        repository.save(currentStream);

    }

}
