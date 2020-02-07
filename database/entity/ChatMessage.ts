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
import {formatDatetimeSQL} from "../../other/utils";
import {SerializedChatMessage} from "../../shared/Types";

@Entity()
export class ChatMessage extends BaseEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(type => User, user => user.chatMessages)
    author: User;

    @Column()
    message: string;

    @ManyToOne(type => User, {nullable: true})
    deletedBy: User | null;

    @CreateDateColumn()
    createdAt: Date;

    serialize(): SerializedChatMessage {
        const deleted = this.deletedBy != null;

        return {
            id: this.id,
            author: this.author.serialize(),
            message: deleted ? `Message supprimé par ${this.deletedBy.display_name}` : this.message,
            deleted,
            createdAt: moment(this.createdAt).locale("fr").fromNow()
        };
    }

    static async getLastMessages(): Promise<SerializedChatMessage[]> {
        const rawMessages = await ChatMessage.createQueryBuilder("chat")
            .leftJoinAndSelect("chat.author", "author")
            .leftJoinAndSelect("chat.deletedBy", "deletedBy")
            .take(50)
            .orderBy("chat.createdAt", "DESC")
            .getMany();

        return rawMessages.map(m => m.serialize());

    }

    static async getActiveUsers() {
        const users = await User.createQueryBuilder("user")
            .leftJoinAndSelect("user.chatMessages", "message")
            .where("message.createdAt >= :datetime", {datetime: formatDatetimeSQL(moment().subtract(5, "minutes"))})
            .getMany();

        return users.map(u => u.display_name);

    }
}
