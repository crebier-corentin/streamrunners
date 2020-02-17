import { UserEntity } from '../user/user.entity';
import { EntityService } from '../utils/entity-service';
import { ChatMessageEntity } from './chat-message.entity';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class ChatService extends EntityService<ChatMessageEntity> {
    constructor(@InjectRepository(ChatMessageEntity) repo) {
        super(repo);
    }

    addMessage(message: string, user: UserEntity) {
        const chatMessage = new ChatMessageEntity();
        chatMessage.author = user;
        chatMessage.message = message;
        return this.repo.save(chatMessage);
    }

    async softDelete(messageId: number, deletedBy: UserEntity) {
        const message = await this.byIdOrFail(messageId);
        message.deletedBy = deletedBy;
        return await this.repo.save(message);
    }

    getLastMessages(): Promise<ChatMessageEntity[]> {
        return this.repo
            .createQueryBuilder('chat')
            .leftJoinAndSelect('chat.author', 'author')
            .leftJoinAndSelect('chat.deletedBy', 'deletedBy')
            .take(50)
            .orderBy('chat.createdAt', 'DESC')
            .getMany();
    }
}
