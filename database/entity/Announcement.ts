import {BaseEntity, Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn} from "typeorm";
import {User} from "./User";

@Entity()
export class Announcement extends BaseEntity {

    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    text: string;

    @Column()
    color: string;

    @Column()
    url: string;

    @Column({default: false})
    active: boolean;

    @ManyToOne(type => User)
    createdBy: User;

    @CreateDateColumn()
    createdAt: Date;

    static LastAnnouncement(): Promise<Announcement | undefined> {
        return Announcement.findOne({where: {active: true}});
    }
}
