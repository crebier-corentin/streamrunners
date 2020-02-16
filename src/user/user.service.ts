import { TwitchUser } from '../twitch/twitch.interfaces';
import { ModelService } from '../utils/ModelService';
import { formatDatetimeSQL } from '../utils/utils';
import { UserEntity } from './user.entity';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import moment = require('moment');
import { RaffleEntity } from '../raffle/raffle.entity';

@Injectable()
export class UserService extends ModelService<UserEntity> {
    constructor(
        @InjectRepository(UserEntity)
        repo: Repository<UserEntity>
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
}
