import {Entity, PrimaryGeneratedColumn, Column, BaseEntity, ManyToOne} from "typeorm";
import {User} from "./User";

@Entity()
export class WatchSession extends BaseEntity {

    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(type => User, user => user.twitchId)
    user: User;

    @Column("datetime", {default: () => 'CURRENT_TIMESTAMP'})
    start: Date;

    @Column("datetime", {default: () => 'CURRENT_TIMESTAMP'})
    last: Date;

    points() : number {
        return ((this.last.getTime() - this.start.getTime()) / 1000) / 10;
    }


}
