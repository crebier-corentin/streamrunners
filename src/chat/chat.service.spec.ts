/* eslint-disable @typescript-eslint/ban-ts-ignore */
import { InternalServerErrorException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity } from '../user/user.entity';
import { UserService } from '../user/user.service';
import { ChatMessageEntity } from './chat-message.entity';
import { ChatService } from './chat.service';

describe('ChatService', () => {
    let service: ChatService;
    let repo: Repository<ChatMessageEntity>;
    let userService: UserService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                ChatService,
                {
                    provide: getRepositoryToken(ChatMessageEntity),
                    useClass: Repository,
                },
                ChatService,
                {
                    provide: UserService,
                    useValue: {
                        getIdsByUsernames: jest.fn(),
                    },
                },
            ],
        }).compile();

        service = module.get<ChatService>(ChatService);
        repo = module.get<Repository<ChatMessageEntity>>(getRepositoryToken(ChatMessageEntity));
        userService = module.get<UserService>(UserService);

        // @ts-ignore
        jest.spyOn(repo, 'save').mockImplementation(entity => entity);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('addMessage', () => {
        beforeEach(() => {
            const mockedUsers = {
                user1: 1,
                user2: 2,
            };
            jest.spyOn(userService, 'getIdsByUsernames').mockImplementation(
                usernames => usernames.map(u => mockedUsers[u]).filter(u => u != undefined) as any
            );
        });

        it('should insert a new message and return it', async () => {
            const user = new UserEntity();
            user.id = 50;

            const message = await service.addMessage('123', user);
            expect(message.mentions).toEqual([]);
            expect(message.message).toBe('123');
            expect(message.author.id).toBe(50);
        });

        it('should detect a mention at the start', async () => {
            const user = new UserEntity();
            user.id = 50;

            const message = await service.addMessage('@user1 haha', user);
            expect(message.mentions).toEqual([1]);
        });

        it('should detect a mention at the end', async () => {
            const user = new UserEntity();
            user.id = 50;

            const message = await service.addMessage('haha @user1', user);
            expect(message.mentions).toEqual([1]);
        });

        it('should detect a mention in the middle', async () => {
            const user = new UserEntity();
            user.id = 50;

            const message = await service.addMessage('haha @user1 haha', user);
            expect(message.mentions).toEqual([1]);
        });

        it('should detect multiple mentions', async () => {
            const user = new UserEntity();
            user.id = 50;

            const message = await service.addMessage('@user1 @user2', user);
            expect(message.mentions).toEqual([1, 2]);
        });
    });

    describe('softDeleteChat', () => {
        let chatMessage: ChatMessageEntity;
        let mod: UserEntity;
        let user: UserEntity;

        beforeEach(() => {
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

            // @ts-ignore
            jest.spyOn(repo, 'findOne').mockImplementation(id => (id === 1 ? chatMessage : undefined));
        });

        it('should soft delete', async () => {
            const message = await service.softDeleteChat(1, mod);
            expect(message.deletedBy.id).toBe(40);
        });

        it("should throw when message doesn't exists", () => {
            return expect(service.softDeleteChat(2, mod)).rejects.toBeInstanceOf(InternalServerErrorException);
        });
    });
});
