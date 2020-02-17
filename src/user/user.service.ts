import { TwitchUser } from '../twitch/twitch.interfaces';
import { EntityService } from '../utils/EntityService';
import { formatDatetimeSQL } from '../utils/utils';
import { UserEntity } from './user.entity';
import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import moment = require('moment');
import { RaffleEntity } from '../raffle/raffle.entity';
import { TwitchService } from '../twitch/twitch.service';

@Injectable()
export class UserService extends EntityService<UserEntity> {
    constructor(
        @InjectRepository(UserEntity)
        repo: Repository<UserEntity>,
        private readonly twitchService: TwitchService
    ) {
        super(repo);
    }

    /**
     * Creates or update an user from twitch authentication
     *
     * @param data Data from the twitch request
     * @return The newly created or updated user
     */
    async updateFromTwitch(data: TwitchUser): Promise<UserEntity> {
        //Find or create
        const user = (await this.repo.findOne({ where: { twitchId: data.id } })) ?? new UserEntity();

        //Update data
        user.twitchId = data.id;
        user.username = data.login;
        user.displayName = data.display_name;
        user.avatar = data.profile_image_url;

        //Save
        return this.repo.save(user);
    }

    async changePointsSave(user: UserEntity, amount: number) {
        user.changePoints(amount);
        await this.repo.save(user);
    }

    pickRaffleWinner(raffle: RaffleEntity): Promise<UserEntity> {
        return this.repo
            .createQueryBuilder('user')
            .leftJoin('user.raffleParticipations', 'rp')
            .leftJoin('rp.raffle', 'raffle')
            .where('raffle.id = :id', { id: raffle.id })
            .orderBy('-LOG(1.0 - rand()) / rp.tickets')
            .getOne();
    }

    pickRandomNonDefaultAvatars(count: number) {
        return this.repo
            .createQueryBuilder('user')
            .select('user.avatar')
            .where("user.avatar NOT LIKE 'https://static-cdn.jtvnw.net/user-default-pictures-uv%'") //No default avatar
            .orderBy('RAND()')
            .limit(count)
            .getMany();
    }

    viewers() {
        return this.repo
            .createQueryBuilder('user')
            .where('user.lastOnWatchPage > :datetime', {
                datetime: formatDatetimeSQL(moment().subtract(30, 'seconds')),
            })
            .orderBy('user.chatRank', 'DESC')
            .getMany();
    }

    async syncFromTwitchProcess(ids: string[]): Promise<void> {
        //Do nothing if ids is empty
        if (ids.length === 0) return;

        const twitchUsers = await this.twitchService.getUsers(ids);

        //Save displayName and avatar to db
        await Promise.all(
            twitchUsers.data.data.map(user =>
                this.repo
                    .createQueryBuilder('user')
                    .update()
                    .set({ displayName: user.display_name, avatar: user.profile_image_url })
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
    async syncFromTwitch(): Promise<void> {
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
}
