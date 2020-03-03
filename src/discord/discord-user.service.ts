import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityService } from '../common/utils/entity-service';
import { DiscordUserEntity } from './discord-user.entity';

@Injectable()
export class DiscordUserService extends EntityService<DiscordUserEntity> {
    public constructor(@InjectRepository(DiscordUserEntity) repo) {
        super(repo);
    }

    public async byDiscordIdOrCreate(discordId: string): Promise<DiscordUserEntity> {
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
    public async increaseXp(discordUser: DiscordUserEntity): Promise<boolean> {
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
