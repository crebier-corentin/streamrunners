import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

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

    @CreateDateColumn()
    public createdAt: Date;

    @UpdateDateColumn()
    public updatedAt: Date;
}
