import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import CacheService from '../common/utils/cache-service';
import { EntityService } from '../common/utils/entity-service';
import { UserEntity } from '../user/user.entity';
import { UserService } from '../user/user.service';
import { ChatMessageEntity } from './chat-message.entity';

@Injectable()
export class ChatService extends EntityService<ChatMessageEntity> {
    private cache = new CacheService(120); //2 Minute cache

    public constructor(@InjectRepository(ChatMessageEntity) repo, private readonly userService: UserService) {
        super(repo);
    }

    private mentionRegex = /(?:^|\s)@([a-zA-Z0-9][\w]+)/g;

    private async parseMentions(message: string): Promise<Pick<UserEntity, 'id'>[]> {
        //Reset lastIndex to match from the start
        this.mentionRegex.lastIndex = 0;

        const usernamesSet = new Set<string>();

        let match: RegExpExecArray | null;
        do {
            match = this.mentionRegex.exec(message);
            if (match) {
                usernamesSet.add(match[1]);
            }
        } while (match != null);

        //Get user ids
        return usernamesSet.size > 0 ? this.userService.getIdsByUsernames(Array.from(usernamesSet)) : [];
    }

    public async addMessage(message: string, user: UserEntity): Promise<ChatMessageEntity> {
        this.cache.del('messages');

        const chatMessage = new ChatMessageEntity();
        chatMessage.author = user;
        chatMessage.message = message;
        chatMessage.mentions = (await this.parseMentions(message)) as UserEntity[];
        return this.repo.save(chatMessage);
    }

    public async softDeleteChat(messageId: number, deletedBy: UserEntity): Promise<ChatMessageEntity> {
        this.cache.del('messages');

        const message = await this.byIdOrFail(messageId);
        message.deletedBy = deletedBy;
        return this.repo.save(message);
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
