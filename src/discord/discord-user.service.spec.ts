/* eslint-disable @typescript-eslint/ban-ts-ignore */
import { DiscordUserEntity } from './discord-user.entity';
import { DiscordUserService } from './discord-user.service';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

describe('DiscordUserService', () => {
    let service: DiscordUserService;
    let repo: Repository<DiscordUserEntity>;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                DiscordUserService,
                {
                    provide: getRepositoryToken(DiscordUserEntity),
                    useClass: Repository,
                },
            ],
        }).compile();

        service = module.get<DiscordUserService>(DiscordUserService);
        repo = module.get<Repository<DiscordUserEntity>>(getRepositoryToken(DiscordUserEntity));
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('byDiscordIdOrCreate', () => {
        it('should return an already existing user', async () => {
            const dUser = new DiscordUserEntity();
            dUser.id = 1;
            dUser.discordId = '123';
            dUser.level = 4;
            dUser.xp = 20;

            jest.spyOn(repo, 'findOne').mockResolvedValue(dUser);

            expect(await service.byDiscordIdOrCreate('123')).toEqual(dUser);
        });

        it("should return a new user if it doesn't already exists", async () => {
            jest.spyOn(repo, 'findOne').mockResolvedValue(undefined);
            // @ts-ignore
            jest.spyOn(repo, 'save').mockImplementation(entity => ({ ...entity, xp: 0, level: 0 }));

            const dUser = await service.byDiscordIdOrCreate('123');

            expect(dUser.discordId).toBe('123');
            expect(dUser.level).toBe(0);
            expect(dUser.xp).toBe(0);
        });
    });

    describe('increaseXp', () => {
        beforeEach(() => {
            // @ts-ignore
            jest.spyOn(repo, 'save').mockImplementation(entity => entity);
        });

        it('should increase xp by one', async () => {
            const dUser = new DiscordUserEntity();
            dUser.level = 4;
            dUser.xp = 20;

            expect(await service.increaseXp(dUser)).toBe(false);
            expect(dUser.xp).toBe(21);
            expect(dUser.level).toBe(4);
        });

        it('should return true, reset xp and level up at 100xp', async () => {
            const dUser = new DiscordUserEntity();
            dUser.level = 4;
            dUser.xp = 100;

            expect(await service.increaseXp(dUser)).toBe(true);
            expect(dUser.xp).toBe(0);
            expect(dUser.level).toBe(5);
        });
    });
});
