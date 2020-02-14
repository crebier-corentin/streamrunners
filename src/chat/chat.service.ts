import { Injectable } from '@nestjs/common';
import { ModelService } from '../utils/ModelService';
import { ChatMessageEntity } from './chat-message.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from '../user/user.entity';

@Injectable()
export class ChatService extends ModelService<ChatMessageEntity> {
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
