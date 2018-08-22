import {BaseEntity, Column, Entity, OneToMany, PrimaryGeneratedColumn} from "typeorm";
import {WatchSession} from "./WatchSession";
import {StreamSession} from "./StreamSession";


@Entity()
export class User extends BaseEntity {

    @PrimaryGeneratedColumn()
    id: number;
    @Column()
    twitchId: string;
    @Column()
    username: string;
    @Column()
    email: string;
    @Column()
    avatar: string;

    @OneToMany(type => WatchSession, WatchSession => WatchSession.user, {onDelete: "CASCADE", eager: true})
    watchSession: WatchSession[];

    @OneToMany(type => StreamSession, StreamSession => StreamSession.user, {onDelete: "CASCADE"})
    streamSession: StreamSession[];

    getLastWatchSession(): WatchSession {
        const sorted = [...this.watchSession].sort((a, b) => {
            return (a.lastTime() < b.lastTime() ? 1 : -1);
        });

        return sorted[0];
    }

   async points(): Promise<number> {
        if (this.watchSession != undefined) {

            let total: number = 0;

            for(let watchSession of this.watchSession) {
                total += (await watchSession.points());
            }

            return Math.round(total);
        }
        else {
            return 0;
        }
    }


}
