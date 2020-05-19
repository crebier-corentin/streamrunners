/* eslint-disable @typescript-eslint/ban-ts-ignore */
import { InternalServerErrorException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity } from '../user/user.entity';
import { UserService } from '../user/user.service';
import { ChatMentionEntity } from './chat-mention.entity';
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
                        byUsername: jest.fn(),
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
        let user1: UserEntity;
        let user2: UserEntity;

        beforeEach(() => {
            user1 = new UserEntity();
            user1.id = 1;

            user2 = new UserEntity();
            user2.id = 2;

            const mockedUsers = { user1, user2 };
            jest.spyOn(userService, 'byUsername').mockImplementation(username => mockedUsers[username]);
        });

        it('should insert a new message and return it', async () => {
            const message = await service.addMessage('123', user1);
            expect(message.mentions).toEqual([]);
            expect(message.message).toBe('123');
            expect(message.author.id).toBe(1);
        });

        it('should escape html in the message', async () => {
            const message = await service.addMessage('<script src="evil.js"></script> \'&', user1);
            expect(message.message).toBe('&lt;script src=&quot;evil.js&quot;&gt;&lt;/script&gt; &#039;&amp;');
        });

        it('should not replace an url with a link for users', async () => {
            user1.moderator = false;
            user1.admin = false;

            const message = await service.addMessage('A https://www.example.com B', user1);
            expect(message.message).toBe('A https://www.example.com B');
        });

        it('should replace an url with a link for moderators', async () => {
            user1.moderator = true;
            user1.admin = false;

            const message = await service.addMessage('A https://www.example.com B', user1);
            expect(message.message).toBe('A <a href="https://www.example.com">https://www.example.com</a> B');
        });

        it('should replace an url with a link for admins', async () => {
            user1.moderator = false;
            user1.admin = true;

            const message = await service.addMessage('A https://www.example.com B', user1);
            expect(message.message).toBe('A <a href="https://www.example.com">https://www.example.com</a> B');
        });

        it('should detect a mention at the start', async () => {
            const message = await service.addMessage('@user1 haha', user1);

            const expectedMention = new ChatMentionEntity();
            expectedMention.user = user1;
            expectedMention.start = 0;
            expectedMention.end = 6;

            expect(message.mentions).toEqual([expectedMention]);
        });

        it('should detect a mention at the end', async () => {
            const message = await service.addMessage('haha @user1', user1);

            const expectedMention = new ChatMentionEntity();
            expectedMention.user = user1;
            expectedMention.start = 5;
            expectedMention.end = 11;

            expect(message.mentions).toEqual([expectedMention]);
        });

        it('should detect a mention in the middle', async () => {
            const message = await service.addMessage('haha @user1 haha', user1);

            const expectedMention = new ChatMentionEntity();
            expectedMention.user = user1;
            expectedMention.start = 5;
            expectedMention.end = 11;

            expect(message.mentions).toEqual([expectedMention]);
        });

        it('should detect multiple mentions', async () => {
            const message = await service.addMessage('@user1 @user2', user1);

            const expectedMention1 = new ChatMentionEntity();
            expectedMention1.user = user1;
            expectedMention1.start = 0;
            expectedMention1.end = 6;

            const expectedMention2 = new ChatMentionEntity();
            expectedMention2.user = user2;
            expectedMention2.start = 7;
            expectedMention2.end = 13;

            expect(message.mentions).toEqual([expectedMention1, expectedMention2]);
        });

        it('should ignore mentions to inexistant users', async () => {
            const message = await service.addMessage('@user1 @user404 test', user1);

            const expectedMention1 = new ChatMentionEntity();
            expectedMention1.user = user1;
            expectedMention1.start = 0;
            expectedMention1.end = 6;

            expect(message.mentions).toEqual([expectedMention1]);
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
