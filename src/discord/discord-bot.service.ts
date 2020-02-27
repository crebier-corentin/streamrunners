import { forwardRef, Inject, Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Client, Message, Role, TextChannel, VoiceChannel } from 'discord.js';
import * as moment from 'moment';
import { LeaderboardDrawerService } from '../leaderboard/leaderboard-drawer.service';
import { RaffleEntity } from '../raffle/raffle.entity';
import { UserService } from '../user/user.service';
import { DiscordUserEntity } from './discord-user.entity';
import { DiscordUserService } from './discord-user.service';
import Discord = require('discord.js');

interface DiscordBotConstructor {
    token: string;
    siteUserCountChannelId: string;
    discordMemberCountChannelId: string;
    streamNotificationChannelId: string;
    streamNotificationRoleId: string;
    raffleNotificationChannelId: string;
    raffleNotificationRoleId: string;
}

@Injectable()
export class DiscordBotService implements OnApplicationBootstrap {
    private client: Client;

    private siteUserCountChannel: VoiceChannel;
    private discordMemberCountChannel: VoiceChannel;

    private streamNotificationChannel: TextChannel;
    private streamNotificationRole: Role;
    private lastStreamMessageSent: moment.Moment = moment().subtract(20, 'hours');

    private raffleNotificationChannel: TextChannel;
    private raffleNotificationRole: Role;

    public constructor(
        private readonly config: ConfigService,
        @Inject(forwardRef(() => UserService)) private readonly userService: UserService,
        @Inject(forwardRef(() => LeaderboardDrawerService))
        private readonly leaderboardDrawer: LeaderboardDrawerService,
        private readonly discordUserService: DiscordUserService
    ) {}

    public async onApplicationBootstrap(): Promise<void> {
        await this.initFromConfig();
    }

    private async initFromConfig(): Promise<void> {
        await this.initializeDiscordClient({
            token: this.config.get('DISCORD_TOKEN'),
            siteUserCountChannelId: this.config.get('SITE_USER_COUNT_CHANNEL_ID'),
            discordMemberCountChannelId: this.config.get('DISCORD_MEMBER_COUNT_CHANNEL_ID'),
            streamNotificationChannelId: this.config.get('STREAM_NOTIFICATION_CHANNEL_ID'),
            streamNotificationRoleId: this.config.get('STREAM_NOTIFICATION_ROLE_ID'),
            raffleNotificationChannelId: this.config.get('RAFFLE_NOTIFICATION_CHANNEL_ID'),
            raffleNotificationRoleId: this.config.get('RAFFLE_NOTIFICATION_ROLE_ID'),
        });
    }

    public async initializeDiscordClient({
        token,
        siteUserCountChannelId,
        discordMemberCountChannelId,
        streamNotificationChannelId,
        streamNotificationRoleId,
        raffleNotificationChannelId,
        raffleNotificationRoleId,
    }: DiscordBotConstructor): Promise<Client> {
        this.client = new Discord.Client();

        this.client.on('message', async message => {
            //Ignore bots
            if (message.author.bot) return;

            //Get discord user from db
            const discordUser = await this.discordUserService.byDiscordIdOrCreate(message.author.id);

            //Add xp
            if (await this.discordUserService.increaseXp(discordUser)) {
                message.reply('Bravo, tu montes de niveau !');
            }

            //Commands
            if (message.content.startsWith('+niveau')) {
                await this.levelCommand(message, discordUser);
            }

            //Ping
            else if (message.content.startsWith('+ping')) {
                await this.pingCommand(message);
            }

            //Leaderboard
            else if (message.content.startsWith('+leaderboard')) {
                await this.leaderboardCommand(message);
            }
        });
        this.client.on('ready', async () => {
            this.client.user.setActivity('https://streamrunners.fr', { type: 'WATCHING' });

            //User count
            this.siteUserCountChannel = this.client.channels.find(c => c.id === siteUserCountChannelId) as VoiceChannel;
            await this.updateSiteUserCount();

            //Member count
            this.discordMemberCountChannel = this.client.channels.find(
                c => c.id === discordMemberCountChannelId
            ) as VoiceChannel;
            await this.updateDiscordMemberCountChannel();

            //Stream notification
            this.streamNotificationChannel = this.client.channels.find(
                c => c.id === streamNotificationChannelId
            ) as TextChannel;
            this.streamNotificationRole = this.streamNotificationChannel?.guild.roles.find(
                r => r.id === streamNotificationRoleId
            );

            //Raffle notification
            this.raffleNotificationChannel = this.client.channels.find(
                c => c.id === raffleNotificationChannelId
            ) as TextChannel;
            this.raffleNotificationRole = this.raffleNotificationChannel?.guild.roles.find(
                r => r.id === raffleNotificationRoleId
            );
        });

        this.client.on('guildMemberAdd', this.updateDiscordMemberCountChannel);
        this.client.on('guildMemberRemove', this.updateDiscordMemberCountChannel);

        await this.client.login(token);

        return this.client;
    }

    public async pingCommand(message: Message): Promise<void> {
        await message.channel.send({
            embed: {
                title: 'Ping',
                url: 'https://streamrunners.fr',
                color: 3066993,
                timestamp: message.createdAt,
                footer: {
                    // eslint-disable-next-line @typescript-eslint/camelcase
                    icon_url: 'https://streamrunners.fr/img/logosquare.png',
                    text: 'StreamRunners',
                },
                thumbnail: {
                    url: 'https://streamrunners.fr/img/logosquare.png',
                },
                author: {
                    name: 'Bot de StreamRunners.fr',
                    url: 'https://discordapp.com',
                    // eslint-disable-next-line @typescript-eslint/camelcase
                    icon_url: 'https://streamrunners.fr/img/logosquare.png',
                },
                fields: [
                    {
                        name: 'Ping',
                        value: new Date().getTime() - message.createdTimestamp + ' ms 💓',
                    },
                ],
            },
        });
    }

    public async levelCommand(message: Message, discordUser: DiscordUserEntity): Promise<void> {
        const mentionedMember = message.mentions.members.first();

        //Self if mentionedMember is empty
        const targetUser =
            mentionedMember == null
                ? discordUser
                : await this.discordUserService.byDiscordIdOrCreate(mentionedMember.id);

        const embed = new Discord.RichEmbed()
            .setColor(0x4286f4)
            .addField('Niveau', targetUser.level)
            .addField('XP', targetUser.xp + '/100');
        message.channel.send(embed);
    }

    public async leaderboardCommand(message: Message): Promise<void> {
        const args = message.content.split(/\s+/);

        //Most points
        if (/points?/i.test(args[1])) {
            const mostPoints = await this.userService.mostPoints();

            let pointsResponse = 'Points```';
            let placement = 0;
            for (const user of mostPoints) {
                pointsResponse += `${++placement}# ${user.displayName}\n\t${user.points}\n`;
            }
            pointsResponse += '```';

            await message.channel.send(pointsResponse);
        }

        //Most place
        else if (/streamer/i.test(args[1])) {
            let unitOfTime;

            if (args[2] == undefined) unitOfTime = null;
            else if (/jour/i.test(args[2])) unitOfTime = 'day';
            else if (/mois/i.test(args[2])) unitOfTime = 'month';
            else if (/semaine/i.test(args[2])) unitOfTime = 'isoWeek';
            else if (/ann[ée]e?/i.test(args[2])) unitOfTime = 'year';
            //Invalid
            else {
                await message.channel.send(':x: Période de leaderboard inconnu (jour/mois/semaine/année)');
                return;
            }

            await message.channel.send({ file: await this.leaderboardDrawer.getLeaderboardFor(unitOfTime) });
        }

        //Invalid
        else {
            await message.channel.send(':x: Type de leaderboard inconnu (points/streamer)');
        }
    }

    public async updateSiteUserCount(): Promise<void> {
        await this.siteUserCountChannel?.setName(`👍 Inscrits : ${await this.userService.count()}`);
    }

    public async updateDiscordMemberCountChannel(): Promise<void> {
        const count = this.discordMemberCountChannel?.guild.memberCount;
        await this.discordMemberCountChannel?.setName(`👤 Membres : ${count}`);
    }

    public async sendStreamNotificationMessage(): Promise<void> {
        //Don't spam, only one message every hour
        if (this.lastStreamMessageSent.add(1, 'hour') > moment()) return;
        this.lastStreamMessageSent = moment();

        await this.streamNotificationChannel?.send(`
  Un stream viens d'être lancé sur StreamRunners ! Va vite récupérer des points !
  https://streamrunners.fr/

  ${this.streamNotificationRole}`);
    }

    public async sendRaffleNotificationMessage(raffle: RaffleEntity): Promise<void> {
        await this.raffleNotificationChannel?.send(`
Un giveaway viens d'être lancé, il s'agit de **${raffle.title}** d'une valeur de **${raffle.value}€** 
${this.raffleNotificationRole}`);
    }
}
