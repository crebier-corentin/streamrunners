import {Entity, PrimaryGeneratedColumn, Column, BaseEntity, OneToMany} from "typeorm";
import {WatchSession} from "./WatchSession";

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

    @OneToMany(type => WatchSession, WatchSession => WatchSession.user)
    watchSession: WatchSession[];

    points(): number {
        if (this.watchSession != undefined) {
            let total: number = 0;

            this.watchSession.forEach((watchSession) => {
                total += watchSession.points();
            });

            return Math.round(total);
        }
        else {
            return 0;
        }
    }


}
