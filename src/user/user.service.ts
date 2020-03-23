import { forwardRef, HttpException, Inject, Injectable, InternalServerErrorException } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import * as moment from 'moment';
import { Repository } from 'typeorm';
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

    public viewers(): Promise<UserEntity[]> {
        return this.repo
            .createQueryBuilder('user')
            .where('user.lastOnWatchPage > :datetime', {
                datetime: formatDatetimeSQL(moment().subtract(30, 'seconds')),
            })
            .orderBy('user.chatRank', 'DESC')
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

    private async syncFromTwitchProcess(ids: string[]): Promise<void> {
        //Do nothing if ids is empty
        if (ids.length === 0) return;

        const twitchUsers = await this.twitchService.getUsers(ids);

        //Save displayName and avatar to db
        await Promise.all(
            twitchUsers.data.data.map(user =>
                this.repo
                    .createQueryBuilder('user')
                    .update()
                    .set({
                        displayName: user.display_name,
                        avatar: user.profile_image_url,
                        twitchDescription: user.description,
                    })
                    .where('user.twitchId = :twitchId', { twitchId: user.id })
                    .execute()
            )
        );
    }

    /**
     * Sync displayName and avatars from twitch
     * 100 users at a time
     */
    @Cron(CronExpression.EVERY_HOUR)
    public async syncFromTwitch(): Promise<void> {
        let users: { twitchId: string }[];
        let offset = 0;

        //Process 100 users at a time
        do {
            users = await this.repo
                .createQueryBuilder('user')
                .select('user.twitchId', 'twitchId')
                .offset(offset)
                .limit(offset + 100)
                .getRawMany();

            offset += 100;

            await this.syncFromTwitchProcess(users.map(u => u.twitchId));
        } while (users.length > 0);
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
            .addSelect('SUM(queue.current)', 'time')
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
}
