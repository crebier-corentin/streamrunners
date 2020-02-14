/* eslint-disable @typescript-eslint/ban-ts-ignore */
import { Test, TestingModule } from '@nestjs/testing';
import { ChatService } from './chat.service';
import { Repository } from 'typeorm';
import { ChatMessageEntity } from './chat-message.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { UserEntity } from '../user/user.entity';
import { InternalServerErrorException } from '@nestjs/common';

describe('ChatService', () => {
    let service: ChatService;
    let repo: Repository<ChatMessageEntity>;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                ChatService,
                {
                    provide: getRepositoryToken(ChatMessageEntity),
                    useClass: Repository,
                },
            ],
        }).compile();

        service = module.get<ChatService>(ChatService);
        repo = module.get<Repository<ChatMessageEntity>>(getRepositoryToken(ChatMessageEntity));

        // @ts-ignore
        jest.spyOn(repo, 'save').mockImplementation(async entity => entity);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('addMessage', () => {
        it('should insert a new message and return it', async () => {
            const user = new UserEntity();
            user.id = 50;

            const message = await service.addMessage('123', user);
            expect(message.message).toBe('123');
            expect(message.author.id).toBe(50);
        });
    });

    describe('softDelete', () => {
        let chatMessage: ChatMessageEntity;
        let mod: UserEntity;
        let user: UserEntity;

        beforeEach(async () => {
            user = new UserEntity();
            user.id = 50;

            mod = new UserEntity();
            mod.id = 40;
            mod.moderator = true;

            chatMessage = new ChatMessageEntity();
            chatMessage.id = 1;
            chatMessage.message = 'abc';
            chatMessage.author = user;
            chatMessage.deletedBy = null;

            jest.spyOn(repo, 'findOne').mockImplementation(async id => (id === 1 ? chatMessage : undefined));
        });

        it('should soft delete', async () => {
            const message = await service.softDelete(1, mod);
            expect(message.deletedBy.id).toBe(40);
        });

        it("should throw when message doesn't exists", () => {
            return expect(service.softDelete(2, mod)).rejects.toBeInstanceOf(InternalServerErrorException);
        });
    });
});