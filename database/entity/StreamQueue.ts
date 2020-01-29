import {BaseEntity, Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, Repository} from "typeorm";
import {User} from "./User";
import axios from "axios";
import {getDBConnection} from "../connection";
import CacheService from "../../other/CacheService";

@Entity()
export class StreamQueue extends BaseEntity {

    @PrimaryGeneratedColumn()
    id: number;

    //Price in pointsFunc
    @Column({default: 100})
    amount: number;

    //Time in seconds
    @Column({default: 60})
    time: number;

    @Column({default: 0})
    current: number;

    @Column("datetime", {nullable: true, default: null})
    start: Date;

    @ManyToOne(type => User, user => user.streamQueue, {nullable: false})
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

    private static cache = new CacheService(120);

    static async isCurrentOnline(twitchId?: string): Promise<boolean> {

        let channel = twitchId == undefined ? (await StreamQueue.currentStream()).user.twitchId : twitchId;

        return await this.cache.get(channel, async () => {
            const request = await axios.get(`https://api.twitch.tv/helix/streams?user_id=${channel}`, {headers: {"Client-ID": process.env.TWITCH_CLIENT_ID}});
            return request.data.data.length > 0;
        });
    }

    static async currentAndNextStreams(): Promise<Array<StreamQueue>> {

        let repository: Repository<StreamQueue> = getDBConnection().getRepository(StreamQueue);

        return await repository.createQueryBuilder("queue")
            .select(["queue.time", "queue.current", "queue.id"])
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

    const currentStream = await StreamQueue.currentStream();

    //If queue is empty do nothing
    if (currentStream == undefined) {
        return;
    }

    //Start if null
    if (currentStream.start == null) {
        currentStream.start = new Date();
    }
    //Update current
    else {
        const startTime = Math.round(currentStream.start.getTime() / 1000);
        currentStream.current = Math.round(new Date().getTime() / 1000) - startTime;
    }

    await currentStream.save();

}
