import {
    BaseEntity,
    Column,
    CreateDateColumn,
    Entity,
    getConnectionOptions,
    ManyToOne,
    PrimaryGeneratedColumn
} from "typeorm";
import {User} from "./User";
import * as moment from "moment";
import {formatDateSQL} from "../../other/utils";

@Entity()
export class ChatMessage extends BaseEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(type => User, user => user.chatMessages)
    author: User;

    @Column()
    message: string;

    @CreateDateColumn()
    createdAt: Date;

    static async getLastMessages() {
        const rawMessages = await ChatMessage.find({relations: ["author"], take: 50, order: {createdAt: "DESC"}});

        return rawMessages.map(m => ({
            id: m.id,
            author: m.author.serialize(),
            message: m.message,
            createdAt: moment(m.createdAt).locale("fr").fromNow(),
        }));

    }

    static async getActiveUsers() {
        const users = await User.createQueryBuilder("user")
            .leftJoinAndSelect("user.chatMessages", "message")
            .where(`message.createdAt >= ${await formatDateSQL(moment().subtract(5, "minutes"))}`)
            .getMany();

        return users.map(u => u.display_name);

    }
}
