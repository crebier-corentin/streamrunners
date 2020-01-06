import {User} from "../database/entity/User";
import {Client} from "discord.js";
import {DiscordUser} from "../database/entity/DiscordUser";

const Discord = require("discord.js");

export async function loadDiscord(): Promise<Client> {
    const client = new Discord.Client();
    await client.login(process.env.DISCORD_TOKEN);
    client.user.setActivity("https://streamrunners.fr", {type: "WATCHING"});

    client.on('message', async message => {
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

    return client;
}


