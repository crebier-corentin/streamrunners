import {User} from "../database/entity/User";
import {Channel, Client, Role, TextChannel, VoiceChannel} from "discord.js";
import {DiscordUser} from "../database/entity/DiscordUser";
import * as moment from "moment";
import {Raffle} from "../database/entity/Raffle";

const Discord = require("discord.js");

export async function updateMemberCount() {

}

interface DiscordBotConstructor {
    token: string;
    siteUserCountChannelId: string;
    discordMemberCountChannelId: string;
    streamNotificationChannelId: string;
    streamNotificationRoleId: string;
    raffleNotificationChannelId: string;
    raffleNotificationRoleId: string;
}

export class DiscordBot {
    private static client: Client;

    private static siteUserCountChannel: VoiceChannel;
    private static discordMemberCountChannel: VoiceChannel;

    private static streamNotificationChannel: TextChannel;
    private static streamNotificationRole: Role;
    private static lastStreamMessageSent: moment.Moment = moment().subtract(20, "hours");

    private static raffleNotificationChannel: TextChannel;
    private static raffleNotificationRole: Role;

    public static async initializeDiscordClient({token, siteUserCountChannelId, discordMemberCountChannelId, streamNotificationChannelId, streamNotificationRoleId, raffleNotificationChannelId, raffleNotificationRoleId}: DiscordBotConstructor): Promise<Client> {
        this.client = new Discord.Client();

        this.client.on('message', async message => {
            //Ignore bots
            if (message.author.bot) return;

            ////Niveau////
            //Get discord user from db
            const discordUser = await DiscordUser.FindOrCreate(message.author.id);

            //Add xp
            discordUser.xp++;
            if (discordUser.xp > 100) {
                discordUser.level++;
                discordUser.xp = 0;
                message.reply("Bravo, tu montes de niveau !");
            }

            //Command
            if (message.content.startsWith("!niveau")) {
                //Self
                let member = message.mentions.members.first();
                let embed = new Discord.RichEmbed()
                    .setColor(0x4286f4)
                    .addField("Niveau", discordUser.level)
                    .addField("XP", discordUser.xp + "/100");
                if (!member) return message.channel.sendEmbed(embed);

                //Other member
                let memberInfo = await DiscordUser.FindOrCreate(member.id);
                let embed2 = new Discord.RichEmbed()
                    .setColor(0x4286f4)
                    .addField("Niveau", memberInfo.level)
                    .addField("XP", memberInfo.xp + "/100");
                message.channel.sendEmbed(embed2);
            }

            await discordUser.save();

            //Ping
            if (message.content.startsWith("!ping")) {
                message.channel.send(
                    {
                        "embed": {
                            "title": "Ping",
                            "url": "https://streamrunners.fr",
                            "color": 3066993,
                            "timestamp": message.createdAt,
                            "footer": {
                                "icon_url": "https://streamrunners.fr/img/logosquare.png",
                                "text": "StreamRunners"
                            },
                            "thumbnail": {
                                "url": "https://streamrunners.fr/img/logosquare.png"
                            },
                            "author": {
                                "name": "Bot de StreamRunners.fr",
                                "url": "https://discordapp.com",
                                "icon_url": "https://streamrunners.fr/img/logosquare.png"
                            },
                            "fields": [
                                {
                                    "name": "Ping",
                                    "value": new Date().getTime() - message.createdTimestamp + " ms 💓"
                                }
                            ]
                        }
                    });
            }

            //Leaderboard
            if (message.content.startsWith("!leaderboardpoints")) {

                //Most points
                const mostPoints = await User.mostPoints();

                let pointsResponse = "Points```";
                let placement = 0;
                for (const user of mostPoints) {
                    pointsResponse += `${++placement}# ${user.display_name}\n\t${user.points}\n`
                }
                pointsResponse += "```";

                //Most place
                const mostPlace = await User.mostPlace();

                let placeResponse = "Seconde streamé```";
                placement = 0;
                for (const user of mostPlace) {
                    placeResponse += `${++placement}# ${user.display_name}\n\t${user.time}\n`
                }
                placeResponse += "```";


                await message.channel.send(pointsResponse);
                await message.channel.send(placeResponse);

            }
        });
        this.client.on("ready", async () => {
            this.client.user.setActivity("https://streamrunners.fr", {type: "WATCHING"});

            //User count
            this.siteUserCountChannel = this.client.channels.find(c => c.id === siteUserCountChannelId) as VoiceChannel;
            await this.updateSiteUserCount();

            //Member count
            this.discordMemberCountChannel = this.client.channels.find(c => c.id === discordMemberCountChannelId) as VoiceChannel;
            await this.updateDiscordMemberCountChannel();

            //Stream notification
            this.streamNotificationChannel = this.client.channels.find(c => c.id === streamNotificationChannelId) as TextChannel;
            this.streamNotificationRole = this.streamNotificationChannel?.guild.roles.find(r => r.id === streamNotificationRoleId);

            //Raffle notification
            this.raffleNotificationChannel = this.client.channels.find(c => c.id === raffleNotificationChannelId) as TextChannel;
            this.streamNotificationRole = this.raffleNotificationChannel?.guild.roles.find(r => r.id === raffleNotificationRoleId);
        });

        this.client.on("guildMemberAdd", this.updateDiscordMemberCountChannel);
        this.client.on("guildMemberRemove", this.updateDiscordMemberCountChannel);

        await this.client.login(token);

        return this.client;
    }

    public static async updateSiteUserCount(): Promise<void> {
        await this.siteUserCountChannel?.setName(`🖊️ Inscrits : ${await User.count()}`);
    }

    public static async updateDiscordMemberCountChannel(): Promise<void> {
        const count = this.discordMemberCountChannel?.guild.memberCount;
        await this.discordMemberCountChannel?.setName(`👤 Membres : ${count}`);
    }

    public static async sendStreamNotificationMessage(): Promise<void> {

        //Don't spam, only one message every hour
        if (this.lastStreamMessageSent.add(1, "hour") > moment()) return;
        this.lastStreamMessageSent = moment();

        await this.streamNotificationChannel?.send(`
  Un stream viens d'être lancé sur StreamRunners ! Va vite récupérer des points !
  https://streamrunners.fr/

  ${this.streamNotificationRole}`);

    }

    public static async sendRaffleNotificationMessage(raffle: Raffle): Promise<void> {

        await this.raffleNotificationChannel?.send(`
Un giveaway viens d'être lancé, il s'agit de ${raffle.title} d'une valeur de ${raffle.value}€ 
${this.raffleNotificationRole}`);

    }

}
