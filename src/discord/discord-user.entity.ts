import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('discord_user')
export class DiscordUserEntity {
    @PrimaryGeneratedColumn()
    public id: number;

    @Column()
    public discordId: string;

    @Column({ default: 0 })
    public xp: number;

    @Column({ default: 0 })
    public level: number;
}
