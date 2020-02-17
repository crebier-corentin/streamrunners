import { EntityService } from '../utils/entity-service';
import { DiscordUserEntity } from './discord-user.entity';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class DiscordUserService extends EntityService<DiscordUserEntity> {
    constructor(@InjectRepository(DiscordUserEntity) repo) {
        super(repo);
    }

    async byDiscordIdOrCreate(discordId: string): Promise<DiscordUserEntity> {
        let discordUser = await this.repo.findOne({ where: { discordId } });

        if (discordUser == undefined) {
            discordUser = new DiscordUserEntity();
            discordUser.discordId = discordId;
            discordUser = await this.repo.save(discordUser);
        }

        return discordUser;
    }

    /**
     * Increase the xp by one and handle level ups
     * @param discordUser
     *
     * @return if the user leveled up
     */
    async increaseXp(discordUser: DiscordUserEntity): Promise<boolean> {
        discordUser.xp++;
        //Level up
        if (discordUser.xp > 100) {
            discordUser.level++;
            discordUser.xp = 0;

            await this.repo.save(discordUser);
            return true;
        }

        await this.repo.save(discordUser);
        return false;
    }
}
