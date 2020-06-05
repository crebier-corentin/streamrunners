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

/**
 * Entity service to manage [[UserEntity]].
 *
 * @Category Service
 */
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

    /**
     *
     * @param username Username of the searched user.
     * @param relations Relations to load.
     *
     * @returns The user with the searched username or undefined if not found.
     */
    public byUsername(username: string, relations: string[] = []): Promise<UserEntity | undefined> {
        return this.repo.findOne({ where: { username }, relations });
    }

    /**
     *
     * Throws if no matching user is found.
     *
     * @param username Username of the searched user.
     * @param relations Relations to load.
     * @param exception Exception to throw when no matching user is found.
     *
     * @returns The user with the searched username.
     */
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
     * Creates or update a user from twitch authentication.\
     * Updates the discord site user count in case of new user.
     *
     * @param data Data from the twitch request.
     * @return The newly created or updated user.
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

    /**
     * Increments a column and updates the entity with the new value.
     *
     * @param user The user to modify.
     * @param column The column to increment/decrement.
     * @param amount How much the column is incremented. (Can be negative for decrementing.)
     */
    private async changeAmountSave<K extends keyof UserEntity>(
        user: UserEntity,
        column: K,
        amount: number
    ): Promise<void> {
        await this.repo.increment({ id: user.id }, column, amount);
        user[column] = (
            await this.repo
                .createQueryBuilder('user')
                .select(`user.${column}`, column)
                .where('user.id = :id', { id: user.id })
                .getRawOne()
        )[column];
    }

    /**
     * Increments the user's points and updates the entity with the new point value.
     *
     * @param user The user to modify.
     * @param amount How much points is incremented. (Can be negative for decrementing.)
     */
    public async changePointsSave(user: UserEntity, amount: number): Promise<void> {
        await this.changeAmountSave(user, 'points', amount);
    }

    /**
     * Increments the user's meteores and updates the entity with the new point value.
     *
     * @param user The user to modify.
     * @param amount How much meteores is incremented. (Can be negative for decrementing.)
     */
    public async changeMeteoresSave(user: UserEntity, amount: number): Promise<void> {
        await this.changeAmountSave(user, 'meteores', amount);
    }

    /**
     * Randomely picks a winner for a raffle.\
     * Based on tickets bought. (More tickets = more chances to win.)
     *
     * @param raffle The raffle to win.
     *
     * @returns The randomely picked winner.
     */
    public pickRaffleWinner(raffle: RaffleEntity): Promise<UserEntity> {
        return this.repo
            .createQueryBuilder('user')
            .leftJoin('user.raffleParticipations', 'rp')
            .leftJoin('rp.raffle', 'raffle')
            .where('raffle.id = :id', { id: raffle.id })
            .orderBy('-LOG(1.0 - rand()) / rp.tickets')
            .getOne();
    }

    /**
     *
     * @remark
     * Might return less than count.
     *
     * @param count Maximum number of avatars to return.
     *
     * @returns Random user avatars. Only the [[UserEntity.avatar]] column is loaded. (Default twitch avatars are excluded.)
     */
    public pickRandomNonDefaultAvatars(count: number): Promise<UserEntity[]> {
        return this.repo
            .createQueryBuilder('user')
            .select('user.avatar')
            .where("user.avatar NOT LIKE 'https://static-cdn.jtvnw.net/user-default-pictures-uv%'") //No default avatar
            .orderBy('RAND()')
            .limit(count)
            .getMany();
    }

    /**
     *
     * Used to find users who are currently watching the stream.
     *
     * @param intervalInSeconds Maximum amount of seconds to include in search
     * @param excludeId [[UserEntity.id]] to exclude
     *
     * @returns Users who sent a request to /watch/update in the last intervalInSeconds seconds.
     *
     */
    public viewers(intervalInSeconds: number, excludeId = -1): Promise<UserEntity[]> {
        return this.repo
            .createQueryBuilder('user')
            .select([
                'user.id',
                'user.points',
                'user.username',
                'user.displayName',
                'user.avatar',
                'user.moderator', //For chatRank
                'user.admin', //For chatRank
                'user.partner', //For chatRank
                'user.birthday', //For chatRank
                'user.sparkle', //For chatRank
                'user.gotAffiliateCase',
            ])
            .leftJoinAndSelect('user.currentSubscription', 'sub')
            .leftJoinAndSelect('user.affiliatedTo', 'a')
            .where(`user.lastOnWatchPage > NOW() - INTERVAL ${intervalInSeconds} SECOND`)
            .andWhere('user.id != :excludeId', { excludeId })
            .getMany();
    }

    /**
     * @returns Users who are partners. (Based on [[UserEntity.partner]].)
     */
    public partners(): Promise<Pick<UserEntity, 'username' | 'displayName' | 'avatar' | 'twitchDescription'>[]> {
        return this.repo
            .createQueryBuilder('user')
            .select(['user.username', 'user.displayName', 'user.avatar', 'user.twitchDescription'])
            .where('user.partner = true')
            .orderBy('RAND()')
            .getMany();
    }

    //Twitch sync//
    /**
     *
     * @param size Size of a chunk
     *
     * @returns An async generator who returns arrays of [[UserEntity.twitchId]] of size chunk. Stops after processing every row.
     */
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
     * Update [[UserEntity.displayName]], [[UserEntity.avatar]] and [[UserEntity.twitchDescription]] from twitch's API.\
     * 100 users at a time.
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
     * @return The sum of every user's points.
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
     * @remark
     * Performs no check for userToBeBanned and bannedBy. Use [[AdminService.ban]] instead.
     *
     * @param userToBeBanned User to ban.
     * @param bannedBy Admin or moderator that banned the user.
     */
    public async ban(userToBeBanned: UserEntity, bannedBy: UserEntity): Promise<void> {
        userToBeBanned.banned = true;
        userToBeBanned.bannedBy = bannedBy;
        userToBeBanned.banDate = new Date();

        await this.repo.save(userToBeBanned);
    }

    /**
     *
     * Unbans a user.\
     * Sets [[UserEntity.bannedBy]] and [[UserEntity.banDate]] to NULL;
     *
     * @param userToBeUnbanned User to unban.
     */
    public async unban(userToBeUnbanned: UserEntity): Promise<void> {
        if (!userToBeUnbanned.banned) throw new UserErrorException(`${userToBeUnbanned.displayName} n'est pas banni.`);

        userToBeUnbanned.banned = false;
        userToBeUnbanned.bannedBy = null;
        userToBeUnbanned.banDate = null;

        await this.repo.save(userToBeUnbanned);
    }

    /**
     *
     * Toggles [[UserEntity.partner]].
     *
     * If not partner, the user becomes one.\
     * If partner, the users stops being one.
     *
     * @param user User to toggle partner.
     */
    public async togglePartner(user: UserEntity): Promise<void> {
        user.partner = !user.partner;
        await this.repo.save(user);
    }

    /**
     *
     * @param page Current page.
     * @param perPage How many users to return per page.
     * @param search [[UserEntity.username]] and [[UserEntity.displayName]] search query.
     *
     * @returns An array of users based on the current page and the total number of users in the table.
     *
     */
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
