/* eslint-disable @typescript-eslint/ban-ts-ignore */
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import MockDate = require('mockdate');
import { Repository } from 'typeorm';
import { DiscordBotService } from '../discord/discord-bot.service';
import { UserEntity } from '../user/user.entity';
import { NotEnoughPointsException } from '../user/user.exception';
import { UserService } from '../user/user.service';
import { RaffleParticipationEntity } from './raffle-participation.entity';
import { RaffleParticipationService } from './raffle-participation.service';
import { RaffleEntity } from './raffle.entity';
import { RaffleService } from './raffle.service';

describe('RaffleService', () => {
    let service: RaffleService;
    let userService: UserService;
    let repo: Repository<RaffleEntity>;
    let rpService: RaffleParticipationService;
    let discord: DiscordBotService;
    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                RaffleService,
                {
                    provide: UserService,
                    useValue: {
                        changePointsSave: jest.fn((user: UserEntity, amount: number) => {
                            user.points += amount;
                        }),
                        byId: jest.fn(),
                        pickRaffleWinner: jest.fn(),
                    },
                },
                {
                    provide: getRepositoryToken(RaffleEntity),
                    useClass: Repository,
                },
                {
                    provide: RaffleParticipationService,
                    useValue: {
                        findForUserAndRaffle: jest.fn(),
                        findOrCreate: jest.fn(),
                        save: jest.fn(),
                    },
                },
                {
                    provide: DiscordBotService,
                    useValue: {
                        sendRaffleNotificationMessage: jest.fn(),
                        updateRaffleValueCount: jest.fn(),
                    },
                },
            ],
        }).compile();

        service = module.get<RaffleService>(RaffleService);
        userService = module.get<UserService>(UserService);
        repo = module.get<Repository<RaffleEntity>>(getRepositoryToken(RaffleEntity));
        rpService = module.get<RaffleParticipationService>(RaffleParticipationService);
        discord = module.get<DiscordBotService>(DiscordBotService);
        // @ts-ignore
        jest.spyOn(repo, 'save').mockImplementation(entity => entity);
        // @ts-ignore
        jest.spyOn(rpService, 'save').mockImplementation(entity => entity);

        MockDate.reset();
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('active', () => {
        it('should map total to the entities', async () => {
            const r1 = new RaffleEntity();
            r1.id = 1;

            const r2 = new RaffleEntity();
            r2.id = 2;
            // @ts-ignore
            jest.spyOn(repo, 'createQueryBuilder').mockReturnValue({
                leftJoin: jest.fn().mockReturnThis(),
                where: jest.fn().mockReturnThis(),
                andWhere: jest.fn().mockReturnThis(),
                addSelect: jest.fn().mockReturnThis(),
                groupBy: jest.fn().mockReturnThis(),
                orderBy: jest.fn().mockReturnThis(),
                getRawAndEntities: jest.fn().mockResolvedValue({
                    entities: [r1, r2],
                    raw: [{ total: 10 }, { total: undefined }],
                }),
            });

            // @ts-ignore
            const raffles = await service.active();
            expect(raffles[0].id).toBe(1);
            expect(raffles[0].totalTickets).toBe(10);

            expect(raffles[1].id).toBe(2);
            expect(raffles[1].totalTickets).toBe(0);
        });
    });

    describe('activeAndTicketCount', () => {
        it('should map total and ticketCount to the entities', async () => {
            const r1 = new RaffleEntity();
            r1.id = 1;

            const r2 = new RaffleEntity();
            r2.id = 2;
            // @ts-ignore
            jest.spyOn(repo, 'createQueryBuilder').mockReturnValue({
                leftJoin: jest.fn().mockReturnThis(),
                where: jest.fn().mockReturnThis(),
                andWhere: jest.fn().mockReturnThis(),
                addSelect: jest.fn().mockReturnThis(),
                groupBy: jest.fn().mockReturnThis(),
                orderBy: jest.fn().mockReturnThis(),
                getRawAndEntities: jest.fn().mockReturnValue({
                    entities: [r1, r2],
                    raw: [{ total: 10 }, { total: undefined }],
                }),
            });

            const rp1 = new RaffleParticipationEntity();
            rp1.raffle = r1;
            rp1.tickets = 5;
            // @ts-ignore
            jest.spyOn(rpService, 'findForUserAndRaffle')
                .mockResolvedValueOnce(rp1)
                .mockResolvedValueOnce(undefined);

            const raffles = await service.activeAndTicketCount(new UserEntity());
            expect(raffles[0].id).toBe(1);
            expect(raffles[0].totalTickets).toBe(10);
            expect(raffles[0].userTickets).toBe(5);

            expect(raffles[1].id).toBe(2);
            expect(raffles[1].totalTickets).toBe(0);
            expect(raffles[1].userTickets).toBe(0);
        });
    });

    describe('pickWinners', () => {
        it('should pick a winner', async () => {
            const winner = new UserEntity();
            winner.id = 1;
            jest.spyOn(userService, 'pickRaffleWinner').mockResolvedValue(winner);

            const r1 = new RaffleEntity();
            r1.id = 1;
            const r2 = new RaffleEntity();
            r2.id = 2;
            // @ts-ignore
            jest.spyOn(repo, 'createQueryBuilder').mockReturnValue({
                where: jest.fn().mockReturnThis(),
                andWhere: jest.fn().mockReturnThis(),
                getMany: jest.fn().mockResolvedValue([r1, r2]),
            });

            // @ts-ignore
            const mockedSave = jest.spyOn(repo, 'save').mockImplementation(entity => entity);
            // @ts-ignore
            await service.pickWinners();

            const calls = mockedSave.mock.calls;
            expect(calls[0][0]).toHaveProperty('id', 1);
            expect(calls[0][0]).toHaveProperty('winner.id', 1);
            expect(calls[1][0]).toHaveProperty('id', 2);
            expect(calls[1][0]).toHaveProperty('winner.id', 1);
        });
    });

    describe('buy', () => {
        it.each([0, -10, -2453])('should fail if amount is inferior or equal to 0', amount => {
            return expect(service.buy(1, amount, new UserEntity())).rejects.toBeDefined();
        });

        it("should fail if the raffle doesn't exist", () => {
            jest.spyOn(repo, 'findOne').mockResolvedValue(undefined);
            return expect(service.buy(1, 1, new UserEntity())).rejects.toBeDefined();
        });

        it('should fail if the raffle is inactive (winner)', () => {
            const r = new RaffleEntity();
            r.winner = new UserEntity();
            r.endingDate = new Date('2020-01-01');

            MockDate.set('2021-01-01');

            jest.spyOn(repo, 'findOne').mockResolvedValue(r);
            return expect(service.buy(1, 1, new UserEntity())).rejects.toBeDefined();
        });

        it('should fail if the raffle is inactive (endingDate)', () => {
            const r = new RaffleEntity();
            r.winner = null;
            r.endingDate = new Date('2020-01-01');

            MockDate.set('2019-01-01');

            jest.spyOn(repo, 'findOne').mockResolvedValue(r);
            return expect(service.buy(1, 1, new UserEntity())).rejects.toBeDefined();
        });

        it("should fail if the user can't afford the raffle", async () => {
            const r = new RaffleEntity();
            r.winner = null;
            r.endingDate = new Date('2020-01-01');
            r.price = 60;
            jest.spyOn(repo, 'findOne').mockResolvedValue(r);

            const user = new UserEntity();
            user.points = 100;

            MockDate.set('2019-01-01');

            return expect(service.buy(1, 2, user)).rejects.toBeInstanceOf(NotEnoughPointsException);
        });

        it('should fail if the user has bought max tickets', () => {
            const r = new RaffleEntity();
            r.winner = null;
            r.endingDate = new Date('2020-01-01');
            r.maxTickets = 10;
            r.price = 100;
            jest.spyOn(repo, 'findOne').mockResolvedValue(r);

            const rp = new RaffleParticipationEntity();
            rp.tickets = 6;
            // @ts-ignore
            jest.spyOn(rpService, 'findOrCreate').mockResolvedValue(rp);

            MockDate.set('2019-01-01');

            const user = new UserEntity();
            user.points = 1000;

            return expect(service.buy(1, 5, user)).rejects.toBeDefined();
        });

        it('should remove the points from user when bought and increase the ticket count', async () => {
            const r = new RaffleEntity();
            r.winner = null;
            r.endingDate = new Date('2020-01-01');
            r.maxTickets = -1;
            r.price = 100;
            jest.spyOn(repo, 'findOne').mockResolvedValue(r);

            const rp = new RaffleParticipationEntity();
            rp.tickets = 10;
            // @ts-ignore
            jest.spyOn(rpService, 'findOrCreate').mockResolvedValue(rp);

            MockDate.set('2019-01-01');

            const user = new UserEntity();
            user.points = 1000;

            await service.buy(1, 2, user);
            expect(user.points).toBe(800);
            expect(rp.tickets).toBe(12);
        });
    });

    describe('add', () => {
        it('should insert a new raffle and call DiscordBotService.sendRaffleNotificationMessage', async () => {
            const mockedSave = jest.spyOn(repo, 'save');
            const mockedDiscord = jest.spyOn(discord, 'sendRaffleNotificationMessage');

            const raffleData = {
                title: 'title',
                description: null,
                icon: 'icon',
                price: 100,
                maxTickets: -1,
                endingDate: new Date('2019-01-01'),
                code: 'abc',
                value: 5,
            };

            const raffle = new RaffleEntity();
            raffle.title = raffleData.title;
            raffle.description = ''; //Null description should become empty string
            raffle.icon = raffleData.icon;
            raffle.price = raffleData.price;
            raffle.maxTickets = raffleData.maxTickets;
            raffle.endingDate = raffleData.endingDate;
            raffle.code = raffleData.code;
            raffle.value = raffleData.value;

            await service.add(raffleData);
            expect(mockedSave).toHaveBeenCalledWith(raffle);

            expect(mockedDiscord).toHaveBeenCalledWith(raffle);
        });
    });
});
