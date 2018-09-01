import {BaseEntity, Column, Entity, OneToMany, PrimaryGeneratedColumn} from "typeorm";
import {WatchSession} from "./WatchSession";
import {StreamSession} from "./StreamSession";
import {StreamQueue} from "./StreamQueue";
import {ManualPoints} from "./ManualPoints";
import {VIP} from "./VIP";

const uuidv4 = require('uuid/v4');


@Entity()
export class User extends BaseEntity {

    @PrimaryGeneratedColumn()
    id: number;
    @Column()
    twitchId: string;
    @Column()
    username: string;
    @Column()
    display_name: string;
    @Column()
    email: string;
    @Column()
    avatar: string;


    @Column()
    points: number;


    @OneToMany(type => WatchSession, WatchSession => WatchSession.user, {onDelete: "CASCADE", eager: true})
    watchSession: WatchSession[];

    @OneToMany(type => StreamSession, StreamSession => StreamSession.user, {onDelete: "CASCADE"})
    streamSession: StreamSession[];

    @OneToMany(type => StreamQueue, StreamQueue => StreamQueue.user, {onDelete: "CASCADE", eager: true})
    streamQueue: StreamQueue[];

    @OneToMany(type => ManualPoints, ManualPoints => ManualPoints.user, {onDelete: "CASCADE", eager: true})
    manualPoints: ManualPoints[];

    @OneToMany(type => VIP, VIP => VIP.user, {onDelete: "CASCADE", eager: true})
    vip: VIP[];

    /*    //Parrain
        @Column({unique: true, default: uuidv4()})
        parrainage_id: string;

        @OneToMany(type => User, User => User.parrain)
        @JoinColumn({referencedColumnName: "parrainage_id"})
        parraine: User[];

        @ManyToOne(type => User, User => User.parraine)
        parrain: User;*/


    getLastWatchSession(): WatchSession {
        const sorted = [...this.watchSession].sort((a, b) => {
            return (a.lastTime() < b.lastTime() ? 1 : -1);
        });

        return sorted[0];
    }

    async watchSessionPoints(): Promise<number> {
        if (this.watchSession != undefined) {

            let total: number = 0;

            for (let watchSession of this.watchSession) {
                total += (await watchSession.points());
            }

            return Math.round(total);
        }
        else {
            return 0;
        }
    }

    manualTotalPoints(): number {
        if (this.manualPoints != undefined) {

            let total: number = 0;

            for (let manualPoints of this.manualPoints) {
                total += manualPoints.amount;
            }

            return Math.round(total);
        }
        else {
            return 0;
        }
    }

    streamQueueCost(): number {
        if (this.streamQueue != undefined) {

            let total: number = 0;

            for (let streamQueue of this.streamQueue) {
                total += streamQueue.amount;
            }

            return Math.round(total);
        }
        else {
            return 0;
        }
    }

    async pointsFunc(): Promise<number> {

        return Math.round((await this.watchSessionPoints()) - this.streamQueueCost() + this.manualTotalPoints());

    }


}
