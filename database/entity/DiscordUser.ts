import {BaseEntity, Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, Repository} from "typeorm";

@Entity()
export class DiscordUser extends BaseEntity {

    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    discordId: string;

    @Column({default: 0})
    xp: number;

    @Column({default: 0})
    level: number;

    static async FindOrCreate(discordId: string): Promise<DiscordUser> {
        let discordUser = await DiscordUser.findOne({where: {discordId}});

        if (discordUser == undefined) {
            discordUser = new DiscordUser();
            discordUser.discordId = discordId;
            discordUser.xp = discordUser.level = 0;
        }

        return discordUser;
    }

}

