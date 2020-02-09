import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { TypeOrmCrudService } from '@nestjsx/crud-typeorm';

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
export class UserService extends TypeOrmCrudService<User> {
    constructor(@InjectRepository(User) repo: Repository<User>) {
        super(repo);
    }

    public fromId(id: number): Promise<User> {
        return this.repo.findOne(id);
    }

    public async updateFromTwitch(data: TwitchUser): Promise<User> {
        //Find or create
        const user =
            (await this.repo.findOne({ where: { twitchId: data.id } })) ??
            new User();

        //Update data
        user.twitchId = data.id;
        user.username = data.login;
        user.displayName = data.display_name;
        user.avatar = data.profile_image_url;

        //Save
        return this.repo.save(user);
    }
}
