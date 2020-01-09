import {BaseEntity, Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn} from "typeorm";
import {User} from "./User";
import * as moment from "moment";

@Entity()
export class ChatMessage extends BaseEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(type => User)
    author: User;

    @Column()
    message: string;

    @CreateDateColumn()
    createdAt: Date;

    static async GetLastMessages() {
        const rawMessages = await ChatMessage.find({relations: ["author"], take: 50, order: {createdAt: "DESC"}});

        return rawMessages.map(m => ({
            author: {
                display_name: m.author.display_name
            },
            message: m.message,
            createdAt: moment(m.createdAt).locale("fr").fromNow(),
        }));

    }
}
