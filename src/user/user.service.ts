import { forwardRef, HttpException, Inject, Injectable, InternalServerErrorException } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import * as moment from 'moment';
import { Repository } from 'typeorm';
import { UserErrorException } from '../common/exception/user-error.exception';
import { EntityService } from '../common/utils/entity-service';
import { formatDatetimeSQL } from '../common/utils/utils';
import { DiscordBotService } from '../discord/discord-bot.service';
import { RaffleEntity } from '../raffle/raffle.entity';
import { TwitchUser } from '../twitch/twitch.interfaces';
import { TwitchService } from '../twitch/twitch.service';
import { MostPlaceResult } from './most-place-result.interface';
import { UserEntity } from './user.entity';

@Injectable()
export class UserService extends EntityService<UserEntity> {
    public constructor(
        @InjectRepository(UserEntity)
        repo: Repository<UserEntity>,
        private readonly twitchService: TwitchService,
        @Inject(forwardRef(() => DiscordBotService))
        private readonly discordBot: DiscordBotService
    ) {
        super(repo);
    }

    public byUsername(username: string, relations: string[] = []): Promise<UserEntity | undefined> {
        return this.repo.findOne({ where: { username }, relations });
    }

    public async byUsernameOrFail(
        username: string,
        relations: string[] = [],
        exception: HttpException = new InternalServerErrorException()
    ): Promise<UserEntity> {
        const user = await this.byUsername(username, relations);
        if (user == undefined) throw exception;

        return user;
    }

    /**
     * Creates or update an user from twitch authentication
     * Updates the discord site user count in case of new user
     *
     * @param data Data from the twitch request
     * @return The newly created or updated user
     */
    public async updateFromTwitch(data: TwitchUser): Promise<UserEntity> {
        //Find or create
        let user = await this.repo.findOne({ where: { twitchId: data.id } });
        const isNewUser = user == undefined;
        if (isNewUser) {
            user = new UserEntity();
        }

        //Update data
        user.twitchId = data.id;
        user.username = data.login;
        user.displayName = data.display_name;
        user.twitchDescription = data.description;
        user.avatar = data.profile_image_url;

        //Save
        const result = await this.repo.save(user);
        //Update count if new users
        if (isNewUser) {
            await this.discordBot.updateSiteUserCount();
        }
        return result;
    }

    public async changePointsSave(user: UserEntity, amount: number): Promise<void> {
        user.changePoints(amount);
        await this.repo.save(user);
    }

    public async changeMeteoresSave(user: UserEntity, amount: number): Promise<void> {
        user.changeMeteores(amount);
        await this.repo.save(user);
    }

    public pickRaffleWinner(raffle: RaffleEntity): Promise<UserEntity> {
        return this.repo
            .createQueryBuilder('user')
            .leftJoin('user.raffleParticipations', 'rp')
            .leftJoin('rp.raffle', 'raffle')
            .where('raffle.id = :id', { id: raffle.id })
            .orderBy('-LOG(1.0 - rand()) / rp.tickets')
            .getOne();
    }

    public pickRandomNonDefaultAvatars(count: number): Promise<UserEntity[]> {
        return this.repo
            .createQueryBuilder('user')
            .select('user.avatar')
            .where("user.avatar NOT LIKE 'https://static-cdn.jtvnw.net/user-default-pictures-uv%'") //No default avatar
            .orderBy('RAND()')
            .limit(count)
            .getMany();
    }

    public viewers(intervalInSeconds: number, excludeId = -1): Promise<UserEntity[]> {
        return this.repo
            .createQueryBuilder('user')
            .select([
                'user.id',
                'user.points',
                'user.username',
                'user.displayName',
                'user.avatar',
                'user.moderator',
                'user.admin',
                'user.partner',
                'user.sparkle',
                'user.gotAffiliateCase',
            ])
            .leftJoinAndSelect('user.currentSubscription', 'sub')
            .leftJoinAndSelect('user.affiliatedTo', 'a')
            .where(`user.lastOnWatchPage > NOW() - INTERVAL ${intervalInSeconds} SECOND`)
            .andWhere('user.id != :excludeId', { excludeId })
            .getMany();
    }

    public partners(): Promise<Pick<UserEntity, 'username' | 'displayName' | 'avatar' | 'twitchDescription'>[]> {
        return this.repo
            .createQueryBuilder('user')
            .select(['user.username', 'user.displayName', 'user.avatar', 'user.twitchDescription'])
            .where('user.partner = true')
            .orderBy('RAND()')
            .getMany();
    }

    //Twitch sync//
    private async *allTwitchIdChunk(size: number): AsyncGenerator<string[]> {
        let users: { twitchId: string }[];
        let offset = 0;

        //Process 100 users at a time
        while (true) {
            users = await this.repo
                .createQueryBuilder('user')
                .select('user.twitchId', 'twitchId')
                .offset(offset)
                .limit(size)
                .getRawMany();

            //No more data
            if (users.length === 0) break;

            offset += size;

            yield users.map(u => u.twitchId);

            //End of data
            if (users.length < size) break;
        }
    }

    /**
     * Sync displayName and avatars from twitch
     * 100 users at a time
     */
    @Cron(CronExpression.EVERY_HOUR)
    public async syncWithTwitch(): Promise<void> {
        for await (const ids of this.allTwitchIdChunk(100)) {
            try {
                const twitchUsers = await this.twitchService.getUsers(ids);

                //Save displayName and avatar to db
                for (const user of twitchUsers.data.data) {
                    await this.repo
                        .createQueryBuilder()
                        .update()
                        .set({
                            displayName: user.display_name,
                            avatar: user.profile_image_url,
                            twitchDescription: user.description,
                        })
                        .where('twitchId = :twitchId', { twitchId: user.id })
                        .callListeners(false)
                        .execute();
                }
            } catch (e) {
                console.error(e);
            }
        }
    }

    //Leaderboards//

    /**
     * @return The top 10 users ordered by points.
     * Return fields are username, displayName and points.
     */
    public mostPoints(): Promise<any> {
        return this.repo
            .createQueryBuilder('user')
            .select(['user.username', 'user.displayName', 'user.points'])
            .orderBy('user.points', 'DESC')
            .limit(10)
            .getMany();
    }

    /**
     * @param limitDate Queues must be created after this date. null for no limit.
     *
     * @return The top 10 users ordered by total stream_queue time.
     * Return fields are username, displayName and time.
     */
    public mostPlace(limitDate: moment.Moment | null = null): Promise<MostPlaceResult[]> {
        const query = this.repo
            .createQueryBuilder('user')
            .leftJoin('user.streamsQueued', 'queue')
            .select('user.username', 'username')
            .addSelect('user.displayName', 'displayName')
            .addSelect('SUM(LEAST(queue.time, queue.current))', 'time') //queue.current can be bigger than queue.time if the stream ends during a maintenance
            .orderBy('time', 'DESC')
            .groupBy('user.id')
            .limit(10);

        if (limitDate != null) {
            query.where('queue.createdAt >= :limitDate', { limitDate: formatDatetimeSQL(limitDate) });
        }

        return query.getRawMany();
    }

    //Admin//

    /**
     * @return The sum of every user's points
     */
    public async totalPoints(): Promise<number> {
        return (
            await this.repo
                .createQueryBuilder('user')
                .select('SUM(user.points)', 'totalPoints')
                .getRawOne()
        ).totalPoints;
    }

    /**
     * Bans userToBeBanned, sets userToBeBanned.bannedBy to bannedBy and userToBeBanned.banDate to now.
     * Note: performs no check.
     *
     * @param userToBeBanned
     * @param bannedBy
     */
    public async ban(userToBeBanned: UserEntity, bannedBy: UserEntity): Promise<void> {
        userToBeBanned.banned = true;
        userToBeBanned.bannedBy = bannedBy;
        userToBeBanned.banDate = new Date();

        await this.repo.save(userToBeBanned);
    }

    public async unban(userToBeUnbanned: UserEntity): Promise<void> {
        if (!userToBeUnbanned.banned) throw new UserErrorException(`${userToBeUnbanned.displayName} n'est pas banni.`);

        userToBeUnbanned.banned = false;
        userToBeUnbanned.bannedBy = null;
        userToBeUnbanned.banDate = null;

        await this.repo.save(userToBeUnbanned);
    }

    public async togglePartner(user: UserEntity): Promise<void> {
        user.partner = !user.partner;
        await this.repo.save(user);
    }

    public searchPaginate(page: number, perPage: number, search = ''): Promise<[UserEntity[], number]> {
        const query = this.repo
            .createQueryBuilder('user')
            .leftJoinAndSelect('user.currentSubscription', 'sub')
            .leftJoinAndSelect('user.bannedBy', 'bannedBy')
            .skip((page - 1) * perPage)
            .take(perPage);

        if (search.length > 0) {
            query
                .where('user.username LIKE :username', { username: `%${search}%` })
                .orWhere('user.displayName LIKE :displayName', { displayName: `%${search}%` });
        }

        return query.getManyAndCount();
    }
}
