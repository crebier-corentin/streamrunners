import { UserEntity } from './user.entity';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

export interface TwitchUser {
    broadcaster_type: 'partner' | 'affiliate' | '';
    description: string;
    display_name: string;
    email?: string;
    id: string;
    login: string;
    offline_image_url: string;
    profile_image_url: string;
    type: 'staff' | 'admin' | 'global_mod' | '';
    view_count: number;
}

@Injectable()
export class UserService {
    constructor(
        @InjectRepository(UserEntity)
        private readonly repo: Repository<UserEntity>
    ) {}

    /**
     *
     * @param id The id of the wanted user
     * @return Wanted user or undefined if not found
     */
    public fromId(id: number): Promise<UserEntity | undefined> {
        return this.repo.findOne(id);
    }

    /**
     * Creates or update an user from twitch authentication
     *
     * @param data Data from the twitch request
     * @return The newly created or updated user
     */
    public async updateFromTwitch(data: TwitchUser): Promise<UserEntity> {
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
}
