import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import CacheService from '../common/utils/cache-service';
import { EntityService } from '../common/utils/entity-service';
import { UserEntity } from '../user/user.entity';
import { ChatMessageEntity } from './chat-message.entity';

@Injectable()
export class ChatService extends EntityService<ChatMessageEntity> {
    private cache = new CacheService(120); //2 Minute cache

    public constructor(@InjectRepository(ChatMessageEntity) repo) {
        super(repo);
    }

    public addMessage(message: string, user: UserEntity): Promise<ChatMessageEntity> {
        this.cache.del('messages');

        const chatMessage = new ChatMessageEntity();
        chatMessage.author = user;
        chatMessage.message = message;
        return this.repo.save(chatMessage);
    }

    public async softDelete(messageId: number, deletedBy: UserEntity): Promise<ChatMessageEntity> {
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
                .leftJoinAndSelect('chat.deletedBy', 'deletedBy')
                .take(50)
                .orderBy('chat.createdAt', 'DESC')
                .getMany()
        );
    }
}
