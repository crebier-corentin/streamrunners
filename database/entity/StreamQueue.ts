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
import axios from "axios";

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
    static async currentStream(): Promise<StreamQueue | boolean | any> {

        let repository: Repository<StreamQueue>;

        if (process.env.NODE_ENV === "test") {
            repository = getConnection("test").getRepository(StreamQueue);
        }
        else {
            repository = getConnection().getRepository(StreamQueue);
        }

        let streamQueue = await repository.createQueryBuilder("queue")
            .leftJoinAndSelect("queue.user", "user")
            .where("queue.current < queue.time")
            .orderBy("queue.createdAt", "ASC")
            .getOne();

        //Check if queue is empty
        if (streamQueue != undefined) {
            return streamQueue;
        }
        else {
            return false;
        }
    }

    static async isCurrentOnline(username?: string): Promise<boolean> {

        let channel = username == undefined ? (await StreamQueue.currentStream()).user.username : username;

        let request = await axios.get(`https://api.twitch.tv/kraken/streams/${channel}`, {headers: {"Client-ID": process.env.TWITCH_CLIENT_ID}});

        return request.data.stream !== null;

    }


}
