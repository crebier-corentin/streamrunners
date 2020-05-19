import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import CacheService from '../common/utils/cache-service';
import { EntityService } from '../common/utils/entity-service';
import { escapeHtml } from '../common/utils/utils';
import { UserEntity } from '../user/user.entity';
import { UserService } from '../user/user.service';
import { ChatMentionEntity } from './chat-mention.entity';
import { ChatMessageEntity } from './chat-message.entity';

@Injectable()
export class ChatService extends EntityService<ChatMessageEntity> {
    private cache = new CacheService(2);

    public constructor(@InjectRepository(ChatMessageEntity) repo, private readonly userService: UserService) {
        super(repo);
    }

    private mentionRegex = /@([a-zA-Z0-9][\w]+)/g;
    private urlRegex = /(https?:\/\/(?:www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b(?:[-a-zA-Z0-9()!@:%_+.~#?&\/\/=]*))/gm;

    private async parseMentions(message: string): Promise<ChatMentionEntity[]> {
        //Reset lastIndex to match from the start
        this.mentionRegex.lastIndex = 0;

        const mentions: ChatMentionEntity[] = [];

        let match: RegExpExecArray | null;
        do {
            match = this.mentionRegex.exec(message);
            if (match) {
                const user = await this.userService.byUsername(match[1]);
                if (user != undefined) {
                    const mention = new ChatMentionEntity();
                    mention.user = user;
                    mention.start = match.index;
                    mention.end = match.index + match[0].length;

                    mentions.push(mention);
                }
            }
        } while (match != null);

        return mentions;
    }

    public async addMessage(message: string, user: UserEntity): Promise<ChatMessageEntity> {
        let escapedMessage = escapeHtml(message);

        //Convert urls to links for admins
        if (user.moderator || user.admin) {
            escapedMessage = escapedMessage.replace(this.urlRegex, '<a href="$1">$1</a>');
        }

        const chatMessage = new ChatMessageEntity();
        chatMessage.author = user;
        chatMessage.message = escapedMessage;
        chatMessage.mentions = await this.parseMentions(escapedMessage);
        const tmp = this.repo.save(chatMessage);

        this.cache.del('messages');

        return tmp;
    }

    public async softDeleteChat(messageId: number, deletedBy: UserEntity): Promise<ChatMessageEntity> {
        const message = await this.byIdOrFail(messageId);
        message.deletedBy = deletedBy;
        const tmp = this.repo.save(message);

        this.cache.del('messages');

        return tmp;
    }

    public getLastMessages(): Promise<ChatMessageEntity[]> {
        return this.cache.get('messages', () =>
            this.repo
                .createQueryBuilder('chat')
                .leftJoinAndSelect('chat.author', 'author')
                .leftJoinAndSelect('chat.mentions', 'mention')
                .leftJoinAndSelect('chat.deletedBy', 'deletedBy')
                .leftJoinAndSelect('author.currentSubscription', 'sub')
                .take(50)
                .orderBy('chat.createdAt', 'DESC')
                .getMany()
        );
    }
}
