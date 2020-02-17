import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('discord_user')
export class DiscordUserEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    discordId: string;

    @Column({ default: 0 })
    xp: number;

    @Column({ default: 0 })
    level: number;
}
