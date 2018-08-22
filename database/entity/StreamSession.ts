import {BaseEntity, Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn} from "typeorm";
import {WatchSession} from "./WatchSession";
import {User} from "./User";

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

    @ManyToOne(type => User, user => user.streamSession, {onDelete: "CASCADE"})
    user: User;





}
