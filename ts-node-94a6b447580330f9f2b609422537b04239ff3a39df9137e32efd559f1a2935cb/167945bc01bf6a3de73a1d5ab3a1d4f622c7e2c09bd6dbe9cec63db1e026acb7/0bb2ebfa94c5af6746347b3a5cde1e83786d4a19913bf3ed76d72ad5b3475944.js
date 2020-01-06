"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
const typeorm_1 = require("typeorm");
const User_1 = require("./database/entity/User");
const Case_1 = require("./database/entity/Case");
const CaseContent_1 = require("./other/CaseContent");
require("reflect-metadata");
const Product_1 = require("./database/entity/Product");
const moment = require("moment");
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const cookieSession = require('cookie-session');
const logger = require('morgan');
const expressNunjucks = require('express-nunjucks');
const passport = require('passport');
const twitchStrategy = require("passport-twitch-new").Strategy;
const compression = require('compression');
const helmet = require('helmet');
const Discord = require("discord.js");
const fs = require("fs");
const config = require('./config.json');
let db = JSON.parse(fs.readFileSync("./database.json", "utf8"));
//.env
require("dotenv").config();
//Load routes
var indexRouter = require('./routes/index');
var caseRouter = require('./routes/case');
var shopRouter = require('./routes/shop');
var parrainageRouter = require('./routes/parrainage');
var giveawayRouter = require('./routes/giveaway');
var couponRouter = require('./routes/coupon');
var pointsRouter = require('./routes/points');
var watchRouter = require('./routes/watch');
var shopRouter = require('./routes/shop');
var stuffshopRouter = require('./routes/stuffshop');
var adminRouter = require('./routes/admin');
//App
var app = express();
global['discordAntiSpamDate'] = moment().subtract("20", "hours");
//DB
typeorm_1.createConnection().then(() => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const isDev = app.get('env') === 'development';
    //Nunjucks
    app.set('views', __dirname + '/views');
    app.set("view engine", "nunj");
    const njk = expressNunjucks(app, {
        watch: isDev,
        noCache: isDev,
        globals: {
            HOSTNAME: process.env.HOSTNAME
        }
    });
    //Discord
    const client = new Discord.Client();
    yield client.login(process.env.DISCORD_TOKEN);
    client.user.setActivity("https://streamrunners.fr", { type: "WATCHING" });
    app.use((req, res, next) => {
        req.discord = client;
        next();
    });
    //ping
    client.on('message', message => {
        if (message.content.startsWith("!ping")) {
            message.channel.send({
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
    });
    //Niveau
    client.on("message", message => {
        if (message.author.bot)
            return; // ignore bots
        // if the user is not on db add the user and change his values to 0
        if (!db[message.author.id])
            db[message.author.id] = {
                xp: 0,
                level: 0
            };
        db[message.author.id].xp++;
        let userInfo = db[message.author.id];
        if (userInfo.xp > 100) {
            userInfo.level++;
            userInfo.xp = 0;
            message.reply("Bravo, tu montes de niveau !");
        }
        const args = message.content.slice(config.prefix.length).trim().split(/ +/g);
        const cmd = args.shift().toLowerCase();
        if (cmd === "niveau") {
            let userInfo = db[message.author.id];
            let member = message.mentions.members.first();
            let embed = new Discord.RichEmbed()
                .setColor(0x4286f4)
                .addField("Niveau", userInfo.level)
                .addField("XP", userInfo.xp + "/100");
            if (!member)
                return message.channel.sendEmbed(embed);
            let memberInfo = db[member.id];
            let embed2 = new Discord.RichEmbed()
                .setColor(0x4286f4)
                .addField("Niveau", memberInfo.level)
                .addField("XP", memberInfo.xp + "/100");
            message.channel.sendEmbed(embed2);
        }
        fs.writeFile("./database.json", JSON.stringify(db), (x) => {
            if (x)
                console.error(x);
        });
    });
    //Leaderboard
    client.on("message", (msg) => __awaiter(void 0, void 0, void 0, function* () {
        if (!msg.author.bot && msg.content === "!leaderboardpoints") {
            //Most points
            const mostPoints = yield User_1.User.mostPoints();
            let pointsResponse = "Points```";
            let placement = 0;
            for (const user of mostPoints) {
                pointsResponse += `${++placement}# ${user.display_name}\n\t${user.points}\n`;
            }
            pointsResponse += "```";
            //Most place
            const mostPlace = yield User_1.User.mostPlace();
            let placeResponse = "Seconde streamé```";
            placement = 0;
            for (const user of mostPlace) {
                placeResponse += `${++placement}# ${user.display_name}\n\t${user.time}\n`;
            }
            placeResponse += "```";
            yield msg.channel.send(pointsResponse);
            yield msg.channel.send(placeResponse);
        }
    }));
    //Maintenance
    if (((_a = process.env.MAINTENANCE) === null || _a === void 0 ? void 0 : _a.toLowerCase()) === "true") {
        app.use("*", (req, res) => {
            return res.render("maintenance");
        });
    }
    app.use(logger('dev'));
    app.use(express.json());
    app.use(express.urlencoded({ extended: false }));
    app.use(cookieParser());
    app.use(compression());
    app.use(helmet());
    app.use(express.static(path.join(__dirname, 'public')));
    app.use(cookieSession({ keys: [process.env.COOKIE_KEY] })); // Express cookie session middleware
    //Passport
    passport.use(new twitchStrategy({
        clientID: process.env.TWITCH_CLIENT_ID,
        clientSecret: process.env.TWITCH_CLIENT_SECRET,
        callbackURL: process.env.HOSTNAME + "/auth/twitch/callback",
        scope: "user_read"
    }, function (accessToken, refreshToken, profile, done) {
        return __awaiter(this, void 0, void 0, function* () {
            //Find or create
            let users = yield User_1.User.find({ twitchId: profile.id });
            if (users.length > 0) {
                //Met à jour
                let user = users[0];
                user.username = profile.login;
                user.display_name = profile.display_name;
                user.avatar = profile.profile_image_url;
                yield user.save();
                done(null, user);
            }
            else {
                let newUser = new User_1.User();
                newUser.twitchId = profile.id;
                newUser.username = profile.login;
                newUser.display_name = profile.display_name;
                newUser.avatar = profile.profile_image_url;
                yield newUser.save();
                done(null, newUser);
            }
        });
    }));
    passport.serializeUser(function (user, done) {
        done(null, user.twitchId);
    });
    passport.deserializeUser(function (twitchId, done) {
        User_1.User.findOne({ twitchId: twitchId }).then((user) => {
            let realUser = user == undefined ? false : user;
            done(null, realUser);
        });
    });
    app.use(passport.initialize()); // passport initialize middleware
    app.use(passport.session()); // passport session middleware
    //Parrainage
    /*app.use(async (req, res: Express.Response, done) => {

        if (req.query.parrain_id != undefined) {
            req.session.parrain_id = req.query.parrain_id;
        }

        if (req.isAuthenticated() && req.session.parrain_id != undefined && req.user.parrain == undefined) {
            req.user.parrain = await User.findOne({where: {parrainage_id: req.session.parrain_id}});
            await req.user.save();
        }

        done();

    });*/
    //StreamQueue
    /* async function update() {
         await updateStreamQueue().catch(reason => {
             console.log(reason);
         });
         setTimeout(update, 1000);
     }

     update().catch(reason => console.log(reason));*/
    /*app.use(async (req, res: Express.Response, done) => {
        await updateStreamQueue();
        done();
    });*/
    //Routes
    app.use('/', indexRouter);
    app.use('/case', caseRouter);
    app.use('/parrainage', parrainageRouter);
    app.use('/giveaway', giveawayRouter);
    app.use('/coupon', couponRouter);
    app.use('/points', pointsRouter);
    app.use('/watch', watchRouter);
    app.use('/shop', shopRouter);
    app.use('/stuffshop', stuffshopRouter);
    app.use('/admin', adminRouter);
    app.get("/auth/twitch", passport.authenticate("twitch"));
    app.get("/auth/twitch/callback", passport.authenticate("twitch", { failureRedirect: "/" }), function (req, res) {
        res.redirect("/");
    });
    //Sync cases
    yield Case_1.syncCases(CaseContent_1.casesContent);
    yield Product_1.syncProducts();
})).catch(error => console.log(error));
module.exports = app;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiL1N0cmVhbVJ1bm5lcnMvVHdpdGNoVmlldy9hcHAudHMiLCJzb3VyY2VzIjpbIi9TdHJlYW1SdW5uZXJzL1R3aXRjaFZpZXcvYXBwLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7O0FBQUEsNEJBQTBCO0FBQzFCLHFDQUF5QztBQUN6QyxpREFBNEM7QUFHNUMsaURBQWlEO0FBQ2pELHFEQUFpRDtBQUVqRCw0QkFBMEI7QUFFMUIsdURBQWdFO0FBRWhFLE1BQU0sTUFBTSxHQUFHLE9BQU8sQ0FBQyxRQUFRLENBQUMsQ0FBQztBQUVqQyxNQUFNLE9BQU8sR0FBRyxPQUFPLENBQUMsU0FBUyxDQUFDLENBQUM7QUFDbkMsTUFBTSxJQUFJLEdBQUcsT0FBTyxDQUFDLE1BQU0sQ0FBQyxDQUFDO0FBQzdCLE1BQU0sWUFBWSxHQUFHLE9BQU8sQ0FBQyxlQUFlLENBQUMsQ0FBQztBQUM5QyxNQUFNLGFBQWEsR0FBRyxPQUFPLENBQUMsZ0JBQWdCLENBQUMsQ0FBQztBQUNoRCxNQUFNLE1BQU0sR0FBRyxPQUFPLENBQUMsUUFBUSxDQUFDLENBQUM7QUFDakMsTUFBTSxlQUFlLEdBQUcsT0FBTyxDQUFDLGtCQUFrQixDQUFDLENBQUM7QUFDcEQsTUFBTSxRQUFRLEdBQUcsT0FBTyxDQUFDLFVBQVUsQ0FBQyxDQUFDO0FBQ3JDLE1BQU0sY0FBYyxHQUFHLE9BQU8sQ0FBQyxxQkFBcUIsQ0FBQyxDQUFDLFFBQVEsQ0FBQztBQUMvRCxNQUFNLFdBQVcsR0FBRyxPQUFPLENBQUMsYUFBYSxDQUFDLENBQUM7QUFDM0MsTUFBTSxNQUFNLEdBQUcsT0FBTyxDQUFDLFFBQVEsQ0FBQyxDQUFDO0FBQ2pDLE1BQU0sT0FBTyxHQUFHLE9BQU8sQ0FBQyxZQUFZLENBQUMsQ0FBQztBQUN0QyxNQUFNLEVBQUUsR0FBRyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUM7QUFDekIsTUFBTSxNQUFNLEdBQUcsT0FBTyxDQUFDLGVBQWUsQ0FBQyxDQUFDO0FBQ3hDLElBQUksRUFBRSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsRUFBRSxDQUFDLFlBQVksQ0FBQyxpQkFBaUIsRUFBRSxNQUFNLENBQUMsQ0FBQyxDQUFDO0FBRWhFLE1BQU07QUFDTixPQUFPLENBQUMsUUFBUSxDQUFDLENBQUMsTUFBTSxFQUFFLENBQUM7QUFFM0IsYUFBYTtBQUNiLElBQUksV0FBVyxHQUFHLE9BQU8sQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDO0FBQzVDLElBQUksVUFBVSxHQUFHLE9BQU8sQ0FBQyxlQUFlLENBQUMsQ0FBQztBQUMxQyxJQUFJLFVBQVUsR0FBRyxPQUFPLENBQUMsZUFBZSxDQUFDLENBQUM7QUFDMUMsSUFBSSxnQkFBZ0IsR0FBRyxPQUFPLENBQUMscUJBQXFCLENBQUMsQ0FBQztBQUN0RCxJQUFJLGNBQWMsR0FBRyxPQUFPLENBQUMsbUJBQW1CLENBQUMsQ0FBQztBQUNsRCxJQUFJLFlBQVksR0FBRyxPQUFPLENBQUMsaUJBQWlCLENBQUMsQ0FBQztBQUM5QyxJQUFJLFlBQVksR0FBRyxPQUFPLENBQUMsaUJBQWlCLENBQUMsQ0FBQztBQUM5QyxJQUFJLFdBQVcsR0FBRyxPQUFPLENBQUMsZ0JBQWdCLENBQUMsQ0FBQztBQUM1QyxJQUFJLFVBQVUsR0FBRyxPQUFPLENBQUMsZUFBZSxDQUFDLENBQUM7QUFDMUMsSUFBSSxlQUFlLEdBQUcsT0FBTyxDQUFDLG9CQUFvQixDQUFDLENBQUM7QUFDcEQsSUFBSSxXQUFXLEdBQUcsT0FBTyxDQUFDLGdCQUFnQixDQUFDLENBQUM7QUFFNUMsS0FBSztBQUNMLElBQUksR0FBRyxHQUFHLE9BQU8sRUFBRSxDQUFDO0FBRXBCLE1BQU0sQ0FBQyxxQkFBcUIsQ0FBQyxHQUFHLE1BQU0sRUFBRSxDQUFDLFFBQVEsQ0FBQyxJQUFJLEVBQUUsT0FBTyxDQUFDLENBQUM7QUFFakUsSUFBSTtBQUNKLDBCQUFnQixFQUFFLENBQUMsSUFBSSxDQUFDLEdBQVMsRUFBRTs7SUFFL0IsTUFBTSxLQUFLLEdBQUcsR0FBRyxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsS0FBSyxhQUFhLENBQUM7SUFFL0MsVUFBVTtJQUNWLEdBQUcsQ0FBQyxHQUFHLENBQUMsT0FBTyxFQUFFLFNBQVMsR0FBRyxRQUFRLENBQUMsQ0FBQztJQUN2QyxHQUFHLENBQUMsR0FBRyxDQUFDLGFBQWEsRUFBRSxNQUFNLENBQUMsQ0FBQztJQUMvQixNQUFNLEdBQUcsR0FBRyxlQUFlLENBQUMsR0FBRyxFQUFFO1FBQzdCLEtBQUssRUFBRSxLQUFLO1FBQ1osT0FBTyxFQUFFLEtBQUs7UUFDZCxPQUFPLEVBQUU7WUFDTCxRQUFRLEVBQUUsT0FBTyxDQUFDLEdBQUcsQ0FBQyxRQUFRO1NBQ2pDO0tBQ0osQ0FBQyxDQUFDO0lBRUgsU0FBUztJQUNULE1BQU0sTUFBTSxHQUFHLElBQUksT0FBTyxDQUFDLE1BQU0sRUFBRSxDQUFDO0lBQ3BDLE1BQU0sTUFBTSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLGFBQWEsQ0FBQyxDQUFDO0lBQzlDLE1BQU0sQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLDBCQUEwQixFQUFFLEVBQUMsSUFBSSxFQUFFLFVBQVUsRUFBQyxDQUFDLENBQUM7SUFDeEUsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsSUFBSSxFQUFFLEVBQUU7UUFDdkIsR0FBRyxDQUFDLE9BQU8sR0FBRyxNQUFNLENBQUM7UUFDckIsSUFBSSxFQUFFLENBQUM7SUFDWCxDQUFDLENBQUMsQ0FBQztJQUVILE1BQU07SUFDTixNQUFNLENBQUMsRUFBRSxDQUFDLFNBQVMsRUFBRSxPQUFPLENBQUMsRUFBRTtRQUMvQixJQUFHLE9BQU8sQ0FBQyxPQUFPLENBQUMsVUFBVSxDQUFDLE9BQU8sQ0FBQyxFQUFFO1lBQ2hDLE9BQU8sQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUNuQjtnQkFDUCxPQUFPLEVBQUU7b0JBQ1AsT0FBTyxFQUFFLE1BQU07b0JBQ2YsS0FBSyxFQUFFLDBCQUEwQjtvQkFDakMsT0FBTyxFQUFFLE9BQU87b0JBQ2hCLFdBQVcsRUFBRSxPQUFPLENBQUMsU0FBUztvQkFDOUIsUUFBUSxFQUFFO3dCQUNSLFVBQVUsRUFBRSw2Q0FBNkM7d0JBQ3pELE1BQU0sRUFBRSxlQUFlO3FCQUN4QjtvQkFDRCxXQUFXLEVBQUU7d0JBQ1gsS0FBSyxFQUFFLDZDQUE2QztxQkFDckQ7b0JBQ0QsUUFBUSxFQUFFO3dCQUNSLE1BQU0sRUFBRSx5QkFBeUI7d0JBQ2pDLEtBQUssRUFBRSx3QkFBd0I7d0JBQy9CLFVBQVUsRUFBRSw2Q0FBNkM7cUJBQzFEO29CQUNELFFBQVEsRUFBRTt3QkFDUjs0QkFDRSxNQUFNLEVBQUUsTUFBTTs0QkFDZCxPQUFPLEVBQUUsSUFBSSxJQUFJLEVBQUUsQ0FBQyxPQUFPLEVBQUUsR0FBRyxPQUFPLENBQUMsZ0JBQWdCLEdBQUcsUUFBUTt5QkFDcEU7cUJBQ0Y7aUJBQ0Y7YUFDRixDQUFDLENBQUM7U0FDRjtJQUNKLENBQUMsQ0FBQyxDQUFDO0lBRUgsUUFBUTtJQUVSLE1BQU0sQ0FBQyxFQUFFLENBQUMsU0FBUyxFQUFFLE9BQU8sQ0FBQyxFQUFFO1FBQzVCLElBQUksT0FBTyxDQUFDLE1BQU0sQ0FBQyxHQUFHO1lBQUUsT0FBTyxDQUFDLGNBQWM7UUFFOUMsbUVBQW1FO1FBQ25FLElBQUksQ0FBQyxFQUFFLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUM7WUFBRSxFQUFFLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUMsR0FBRztnQkFDaEQsRUFBRSxFQUFFLENBQUM7Z0JBQ0wsS0FBSyxFQUFFLENBQUM7YUFDVCxDQUFDO1FBQ0osRUFBRSxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUM7UUFDM0IsSUFBSSxRQUFRLEdBQUcsRUFBRSxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsRUFBRSxDQUFDLENBQUM7UUFDckMsSUFBRyxRQUFRLENBQUMsRUFBRSxHQUFHLEdBQUcsRUFBRTtZQUNsQixRQUFRLENBQUMsS0FBSyxFQUFFLENBQUE7WUFDaEIsUUFBUSxDQUFDLEVBQUUsR0FBRyxDQUFDLENBQUE7WUFDZixPQUFPLENBQUMsS0FBSyxDQUFDLDhCQUE4QixDQUFDLENBQUE7U0FDaEQ7UUFDRCxNQUFNLElBQUksR0FBRyxPQUFPLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxDQUFDLElBQUksRUFBRSxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUM3RSxNQUFNLEdBQUcsR0FBRyxJQUFJLENBQUMsS0FBSyxFQUFFLENBQUMsV0FBVyxFQUFFLENBQUM7UUFDdkMsSUFBRyxHQUFHLEtBQUssUUFBUSxFQUFFO1lBQ2pCLElBQUksUUFBUSxHQUFHLEVBQUUsQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQyxDQUFDO1lBQ3JDLElBQUksTUFBTSxHQUFHLE9BQU8sQ0FBQyxRQUFRLENBQUMsT0FBTyxDQUFDLEtBQUssRUFBRSxDQUFDO1lBQzlDLElBQUksS0FBSyxHQUFHLElBQUksT0FBTyxDQUFDLFNBQVMsRUFBRTtpQkFDbEMsUUFBUSxDQUFDLFFBQVEsQ0FBQztpQkFDbEIsUUFBUSxDQUFDLFFBQVEsRUFBRSxRQUFRLENBQUMsS0FBSyxDQUFDO2lCQUNsQyxRQUFRLENBQUMsSUFBSSxFQUFFLFFBQVEsQ0FBQyxFQUFFLEdBQUMsTUFBTSxDQUFDLENBQUM7WUFDcEMsSUFBRyxDQUFDLE1BQU07Z0JBQUUsT0FBTyxPQUFPLENBQUMsT0FBTyxDQUFDLFNBQVMsQ0FBQyxLQUFLLENBQUMsQ0FBQTtZQUNuRCxJQUFJLFVBQVUsR0FBRyxFQUFFLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQyxDQUFBO1lBQzlCLElBQUksTUFBTSxHQUFHLElBQUksT0FBTyxDQUFDLFNBQVMsRUFBRTtpQkFDbkMsUUFBUSxDQUFDLFFBQVEsQ0FBQztpQkFDbEIsUUFBUSxDQUFDLFFBQVEsRUFBRSxVQUFVLENBQUMsS0FBSyxDQUFDO2lCQUNwQyxRQUFRLENBQUMsSUFBSSxFQUFFLFVBQVUsQ0FBQyxFQUFFLEdBQUMsTUFBTSxDQUFDLENBQUE7WUFDckMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFDLENBQUE7U0FDcEM7UUFDRCxFQUFFLENBQUMsU0FBUyxDQUFDLGlCQUFpQixFQUFFLElBQUksQ0FBQyxTQUFTLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsRUFBRTtZQUN0RCxJQUFJLENBQUM7Z0JBQUUsT0FBTyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUN6QixDQUFDLENBQUMsQ0FBQztJQUNULENBQUMsQ0FBQyxDQUFBO0lBRUUsYUFBYTtJQUNiLE1BQU0sQ0FBQyxFQUFFLENBQUMsU0FBUyxFQUFFLENBQU0sR0FBRyxFQUFDLEVBQUU7UUFDN0IsSUFBSSxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsR0FBRyxJQUFJLEdBQUcsQ0FBQyxPQUFPLEtBQUssb0JBQW9CLEVBQUU7WUFFekQsYUFBYTtZQUNiLE1BQU0sVUFBVSxHQUFHLE1BQU0sV0FBSSxDQUFDLFVBQVUsRUFBRSxDQUFDO1lBRTNDLElBQUksY0FBYyxHQUFHLFdBQVcsQ0FBQztZQUNqQyxJQUFJLFNBQVMsR0FBRyxDQUFDLENBQUM7WUFDbEIsS0FBSyxNQUFNLElBQUksSUFBSSxVQUFVLEVBQUU7Z0JBQzNCLGNBQWMsSUFBSSxHQUFHLEVBQUUsU0FBUyxLQUFLLElBQUksQ0FBQyxZQUFZLE9BQU8sSUFBSSxDQUFDLE1BQU0sSUFBSSxDQUFBO2FBQy9FO1lBQ0QsY0FBYyxJQUFJLEtBQUssQ0FBQztZQUV4QixZQUFZO1lBQ1osTUFBTSxTQUFTLEdBQUcsTUFBTSxXQUFJLENBQUMsU0FBUyxFQUFFLENBQUM7WUFFekMsSUFBSSxhQUFhLEdBQUcsb0JBQW9CLENBQUM7WUFDekMsU0FBUyxHQUFHLENBQUMsQ0FBQztZQUNkLEtBQUssTUFBTSxJQUFJLElBQUksU0FBUyxFQUFFO2dCQUMxQixhQUFhLElBQUksR0FBRyxFQUFFLFNBQVMsS0FBSyxJQUFJLENBQUMsWUFBWSxPQUFPLElBQUksQ0FBQyxJQUFJLElBQUksQ0FBQTthQUM1RTtZQUNELGFBQWEsSUFBSSxLQUFLLENBQUM7WUFHdkIsTUFBTSxHQUFHLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxjQUFjLENBQUMsQ0FBQztZQUN2QyxNQUFNLEdBQUcsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxDQUFDO1NBRXpDO0lBQ0wsQ0FBQyxDQUFBLENBQUMsQ0FBQztJQUdILGFBQWE7SUFDYixJQUFJLE9BQUEsT0FBTyxDQUFDLEdBQUcsQ0FBQyxXQUFXLDBDQUFFLFdBQVcsUUFBTyxNQUFNLEVBQUU7UUFDbkQsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLEVBQUU7WUFDdEIsT0FBTyxHQUFHLENBQUMsTUFBTSxDQUFDLGFBQWEsQ0FBQyxDQUFDO1FBQ3JDLENBQUMsQ0FBQyxDQUFDO0tBQ047SUFFRCxHQUFHLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDO0lBQ3ZCLEdBQUcsQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLElBQUksRUFBRSxDQUFDLENBQUM7SUFDeEIsR0FBRyxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsVUFBVSxDQUFDLEVBQUMsUUFBUSxFQUFFLEtBQUssRUFBQyxDQUFDLENBQUMsQ0FBQztJQUMvQyxHQUFHLENBQUMsR0FBRyxDQUFDLFlBQVksRUFBRSxDQUFDLENBQUM7SUFHeEIsR0FBRyxDQUFDLEdBQUcsQ0FBQyxXQUFXLEVBQUUsQ0FBQyxDQUFDO0lBQ3ZCLEdBQUcsQ0FBQyxHQUFHLENBQUMsTUFBTSxFQUFFLENBQUMsQ0FBQztJQUVsQixHQUFHLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxTQUFTLEVBQUUsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBRXhELEdBQUcsQ0FBQyxHQUFHLENBQUMsYUFBYSxDQUFDLEVBQUMsSUFBSSxFQUFFLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxVQUFVLENBQUMsRUFBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLG9DQUFvQztJQUU5RixVQUFVO0lBQ1YsUUFBUSxDQUFDLEdBQUcsQ0FBQyxJQUFJLGNBQWMsQ0FBQztRQUN4QixRQUFRLEVBQUUsT0FBTyxDQUFDLEdBQUcsQ0FBQyxnQkFBZ0I7UUFDdEMsWUFBWSxFQUFFLE9BQU8sQ0FBQyxHQUFHLENBQUMsb0JBQW9CO1FBQzlDLFdBQVcsRUFBRSxPQUFPLENBQUMsR0FBRyxDQUFDLFFBQVEsR0FBRyx1QkFBdUI7UUFDM0QsS0FBSyxFQUFFLFdBQVc7S0FDckIsRUFDRCxVQUFnQixXQUFXLEVBQUUsWUFBWSxFQUFFLE9BQU8sRUFBRSxJQUFJOztZQUVwRCxnQkFBZ0I7WUFDaEIsSUFBSSxLQUFLLEdBQUcsTUFBTSxXQUFJLENBQUMsSUFBSSxDQUFDLEVBQUMsUUFBUSxFQUFFLE9BQU8sQ0FBQyxFQUFFLEVBQUMsQ0FBQyxDQUFDO1lBRXBELElBQUksS0FBSyxDQUFDLE1BQU0sR0FBRyxDQUFDLEVBQUU7Z0JBQ2xCLFlBQVk7Z0JBQ1osSUFBSSxJQUFJLEdBQUcsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUVwQixJQUFJLENBQUMsUUFBUSxHQUFHLE9BQU8sQ0FBQyxLQUFLLENBQUM7Z0JBQzlCLElBQUksQ0FBQyxZQUFZLEdBQUcsT0FBTyxDQUFDLFlBQVksQ0FBQztnQkFDekMsSUFBSSxDQUFDLE1BQU0sR0FBRyxPQUFPLENBQUMsaUJBQWlCLENBQUM7Z0JBRXhDLE1BQU0sSUFBSSxDQUFDLElBQUksRUFBRSxDQUFDO2dCQUVsQixJQUFJLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxDQUFDO2FBQ3BCO2lCQUNJO2dCQUNELElBQUksT0FBTyxHQUFHLElBQUksV0FBSSxFQUFFLENBQUM7Z0JBRXpCLE9BQU8sQ0FBQyxRQUFRLEdBQUcsT0FBTyxDQUFDLEVBQUUsQ0FBQztnQkFDOUIsT0FBTyxDQUFDLFFBQVEsR0FBRyxPQUFPLENBQUMsS0FBSyxDQUFDO2dCQUNqQyxPQUFPLENBQUMsWUFBWSxHQUFHLE9BQU8sQ0FBQyxZQUFZLENBQUM7Z0JBQzVDLE9BQU8sQ0FBQyxNQUFNLEdBQUcsT0FBTyxDQUFDLGlCQUFpQixDQUFDO2dCQUUzQyxNQUFNLE9BQU8sQ0FBQyxJQUFJLEVBQUUsQ0FBQztnQkFFckIsSUFBSSxDQUFDLElBQUksRUFBRSxPQUFPLENBQUMsQ0FBQzthQUV2QjtRQUVMLENBQUM7S0FBQSxDQUFDLENBQUMsQ0FBQztJQUNSLFFBQVEsQ0FBQyxhQUFhLENBQUMsVUFBVSxJQUFJLEVBQUUsSUFBSTtRQUN2QyxJQUFJLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQztJQUM5QixDQUFDLENBQUMsQ0FBQztJQUNILFFBQVEsQ0FBQyxlQUFlLENBQUMsVUFBVSxRQUFRLEVBQUUsSUFBSTtRQUM3QyxXQUFJLENBQUMsT0FBTyxDQUFDLEVBQUMsUUFBUSxFQUFFLFFBQVEsRUFBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsSUFBSSxFQUFFLEVBQUU7WUFDN0MsSUFBSSxRQUFRLEdBQUcsSUFBSSxJQUFJLFNBQVMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUM7WUFDaEQsSUFBSSxDQUFDLElBQUksRUFBRSxRQUFRLENBQUMsQ0FBQztRQUN6QixDQUFDLENBQUMsQ0FBQztJQUNQLENBQUMsQ0FBQyxDQUFDO0lBRUgsR0FBRyxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsVUFBVSxFQUFFLENBQUMsQ0FBQyxDQUFHLGlDQUFpQztJQUNuRSxHQUFHLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxPQUFPLEVBQUUsQ0FBQyxDQUFDLENBQU0sOEJBQThCO0lBRWhFLFlBQVk7SUFDWjs7Ozs7Ozs7Ozs7OztTQWFLO0lBRUwsYUFBYTtJQUNiOzs7Ozs7O3FEQU9pRDtJQUNqRDs7O1NBR0s7SUFFTCxRQUFRO0lBQ1IsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLEVBQUUsV0FBVyxDQUFDLENBQUM7SUFDMUIsR0FBRyxDQUFDLEdBQUcsQ0FBQyxPQUFPLEVBQUUsVUFBVSxDQUFDLENBQUM7SUFDN0IsR0FBRyxDQUFDLEdBQUcsQ0FBQyxhQUFhLEVBQUUsZ0JBQWdCLENBQUMsQ0FBQztJQUN6QyxHQUFHLENBQUMsR0FBRyxDQUFDLFdBQVcsRUFBRSxjQUFjLENBQUMsQ0FBQztJQUNyQyxHQUFHLENBQUMsR0FBRyxDQUFDLFNBQVMsRUFBRSxZQUFZLENBQUMsQ0FBQztJQUNqQyxHQUFHLENBQUMsR0FBRyxDQUFDLFNBQVMsRUFBRSxZQUFZLENBQUMsQ0FBQztJQUNqQyxHQUFHLENBQUMsR0FBRyxDQUFDLFFBQVEsRUFBRSxXQUFXLENBQUMsQ0FBQztJQUMvQixHQUFHLENBQUMsR0FBRyxDQUFDLE9BQU8sRUFBRSxVQUFVLENBQUMsQ0FBQztJQUM3QixHQUFHLENBQUMsR0FBRyxDQUFDLFlBQVksRUFBRSxlQUFlLENBQUMsQ0FBQztJQUN2QyxHQUFHLENBQUMsR0FBRyxDQUFDLFFBQVEsRUFBRSxXQUFXLENBQUMsQ0FBQztJQUUvQixHQUFHLENBQUMsR0FBRyxDQUFDLGNBQWMsRUFBRSxRQUFRLENBQUMsWUFBWSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUM7SUFDekQsR0FBRyxDQUFDLEdBQUcsQ0FBQyx1QkFBdUIsRUFBRSxRQUFRLENBQUMsWUFBWSxDQUFDLFFBQVEsRUFBRSxFQUFDLGVBQWUsRUFBRSxHQUFHLEVBQUMsQ0FBQyxFQUFFLFVBQVUsR0FBRyxFQUFFLEdBQUc7UUFDeEcsR0FBRyxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsQ0FBQztJQUN0QixDQUFDLENBQUMsQ0FBQztJQUdILFlBQVk7SUFDWixNQUFNLGdCQUFTLENBQUMsMEJBQVksQ0FBQyxDQUFDO0lBQzlCLE1BQU0sc0JBQVksRUFBRSxDQUFDO0FBRXpCLENBQUMsQ0FBQSxDQUFDLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxFQUFFLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDO0FBRXRDLE1BQU0sQ0FBQyxPQUFPLEdBQUcsR0FBRyxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IFwicmVmbGVjdC1tZXRhZGF0YVwiO1xuaW1wb3J0IHtjcmVhdGVDb25uZWN0aW9ufSBmcm9tIFwidHlwZW9ybVwiO1xuaW1wb3J0IHtVc2VyfSBmcm9tIFwiLi9kYXRhYmFzZS9lbnRpdHkvVXNlclwiO1xuaW1wb3J0IHt1cGRhdGVTdHJlYW1RdWV1ZX0gZnJvbSBcIi4vZGF0YWJhc2UvZW50aXR5L1N0cmVhbVF1ZXVlXCI7XG5pbXBvcnQge3N5bmN9IGZyb20gXCJnbG9iXCI7XG5pbXBvcnQge3N5bmNDYXNlc30gZnJvbSBcIi4vZGF0YWJhc2UvZW50aXR5L0Nhc2VcIjtcbmltcG9ydCB7Y2FzZXNDb250ZW50fSBmcm9tIFwiLi9vdGhlci9DYXNlQ29udGVudFwiO1xuXG5pbXBvcnQgXCJyZWZsZWN0LW1ldGFkYXRhXCI7XG5pbXBvcnQgKiBhcyBjaGlsZF9wcm9jZXNzIGZyb20gXCJjaGlsZF9wcm9jZXNzXCI7XG5pbXBvcnQge1Byb2R1Y3QsIHN5bmNQcm9kdWN0c30gZnJvbSBcIi4vZGF0YWJhc2UvZW50aXR5L1Byb2R1Y3RcIjtcblxuY29uc3QgbW9tZW50ID0gcmVxdWlyZShcIm1vbWVudFwiKTtcblxuY29uc3QgZXhwcmVzcyA9IHJlcXVpcmUoJ2V4cHJlc3MnKTtcbmNvbnN0IHBhdGggPSByZXF1aXJlKCdwYXRoJyk7XG5jb25zdCBjb29raWVQYXJzZXIgPSByZXF1aXJlKCdjb29raWUtcGFyc2VyJyk7XG5jb25zdCBjb29raWVTZXNzaW9uID0gcmVxdWlyZSgnY29va2llLXNlc3Npb24nKTtcbmNvbnN0IGxvZ2dlciA9IHJlcXVpcmUoJ21vcmdhbicpO1xuY29uc3QgZXhwcmVzc051bmp1Y2tzID0gcmVxdWlyZSgnZXhwcmVzcy1udW5qdWNrcycpO1xuY29uc3QgcGFzc3BvcnQgPSByZXF1aXJlKCdwYXNzcG9ydCcpO1xuY29uc3QgdHdpdGNoU3RyYXRlZ3kgPSByZXF1aXJlKFwicGFzc3BvcnQtdHdpdGNoLW5ld1wiKS5TdHJhdGVneTtcbmNvbnN0IGNvbXByZXNzaW9uID0gcmVxdWlyZSgnY29tcHJlc3Npb24nKTtcbmNvbnN0IGhlbG1ldCA9IHJlcXVpcmUoJ2hlbG1ldCcpO1xuY29uc3QgRGlzY29yZCA9IHJlcXVpcmUoXCJkaXNjb3JkLmpzXCIpO1xuY29uc3QgZnMgPSByZXF1aXJlKFwiZnNcIik7XG5jb25zdCBjb25maWcgPSByZXF1aXJlKCcuL2NvbmZpZy5qc29uJyk7XG5sZXQgZGIgPSBKU09OLnBhcnNlKGZzLnJlYWRGaWxlU3luYyhcIi4vZGF0YWJhc2UuanNvblwiLCBcInV0ZjhcIikpO1xuXG4vLy5lbnZcbnJlcXVpcmUoXCJkb3RlbnZcIikuY29uZmlnKCk7XG5cbi8vTG9hZCByb3V0ZXNcbnZhciBpbmRleFJvdXRlciA9IHJlcXVpcmUoJy4vcm91dGVzL2luZGV4Jyk7XG52YXIgY2FzZVJvdXRlciA9IHJlcXVpcmUoJy4vcm91dGVzL2Nhc2UnKTtcbnZhciBzaG9wUm91dGVyID0gcmVxdWlyZSgnLi9yb3V0ZXMvc2hvcCcpO1xudmFyIHBhcnJhaW5hZ2VSb3V0ZXIgPSByZXF1aXJlKCcuL3JvdXRlcy9wYXJyYWluYWdlJyk7XG52YXIgZ2l2ZWF3YXlSb3V0ZXIgPSByZXF1aXJlKCcuL3JvdXRlcy9naXZlYXdheScpO1xudmFyIGNvdXBvblJvdXRlciA9IHJlcXVpcmUoJy4vcm91dGVzL2NvdXBvbicpO1xudmFyIHBvaW50c1JvdXRlciA9IHJlcXVpcmUoJy4vcm91dGVzL3BvaW50cycpO1xudmFyIHdhdGNoUm91dGVyID0gcmVxdWlyZSgnLi9yb3V0ZXMvd2F0Y2gnKTtcbnZhciBzaG9wUm91dGVyID0gcmVxdWlyZSgnLi9yb3V0ZXMvc2hvcCcpO1xudmFyIHN0dWZmc2hvcFJvdXRlciA9IHJlcXVpcmUoJy4vcm91dGVzL3N0dWZmc2hvcCcpO1xudmFyIGFkbWluUm91dGVyID0gcmVxdWlyZSgnLi9yb3V0ZXMvYWRtaW4nKTtcblxuLy9BcHBcbnZhciBhcHAgPSBleHByZXNzKCk7XG5cbmdsb2JhbFsnZGlzY29yZEFudGlTcGFtRGF0ZSddID0gbW9tZW50KCkuc3VidHJhY3QoXCIyMFwiLCBcImhvdXJzXCIpO1xuXG4vL0RCXG5jcmVhdGVDb25uZWN0aW9uKCkudGhlbihhc3luYyAoKSA9PiB7XG5cbiAgICBjb25zdCBpc0RldiA9IGFwcC5nZXQoJ2VudicpID09PSAnZGV2ZWxvcG1lbnQnO1xuXG4gICAgLy9OdW5qdWNrc1xuICAgIGFwcC5zZXQoJ3ZpZXdzJywgX19kaXJuYW1lICsgJy92aWV3cycpO1xuICAgIGFwcC5zZXQoXCJ2aWV3IGVuZ2luZVwiLCBcIm51bmpcIik7XG4gICAgY29uc3QgbmprID0gZXhwcmVzc051bmp1Y2tzKGFwcCwge1xuICAgICAgICB3YXRjaDogaXNEZXYsXG4gICAgICAgIG5vQ2FjaGU6IGlzRGV2LFxuICAgICAgICBnbG9iYWxzOiB7XG4gICAgICAgICAgICBIT1NUTkFNRTogcHJvY2Vzcy5lbnYuSE9TVE5BTUVcbiAgICAgICAgfVxuICAgIH0pO1xuXG4gICAgLy9EaXNjb3JkXG4gICAgY29uc3QgY2xpZW50ID0gbmV3IERpc2NvcmQuQ2xpZW50KCk7XG4gICAgYXdhaXQgY2xpZW50LmxvZ2luKHByb2Nlc3MuZW52LkRJU0NPUkRfVE9LRU4pO1xuICAgIGNsaWVudC51c2VyLnNldEFjdGl2aXR5KFwiaHR0cHM6Ly9zdHJlYW1ydW5uZXJzLmZyXCIsIHt0eXBlOiBcIldBVENISU5HXCJ9KTtcbiAgICBhcHAudXNlKChyZXEsIHJlcywgbmV4dCkgPT4ge1xuICAgICAgICByZXEuZGlzY29yZCA9IGNsaWVudDtcbiAgICAgICAgbmV4dCgpO1xuICAgIH0pO1xuXG4gICAgLy9waW5nXG4gICAgY2xpZW50Lm9uKCdtZXNzYWdlJywgbWVzc2FnZSA9PiB7XG4gICAgaWYobWVzc2FnZS5jb250ZW50LnN0YXJ0c1dpdGgoXCIhcGluZ1wiKSkge1xuICAgICAgICAgICAgbWVzc2FnZS5jaGFubmVsLnNlbmQoXG4gICAgICAgICAgICBcdHtcblx0XHRcdFx0ICBcImVtYmVkXCI6IHtcblx0XHRcdFx0ICAgIFwidGl0bGVcIjogXCJQaW5nXCIsXG5cdFx0XHRcdCAgICBcInVybFwiOiBcImh0dHBzOi8vc3RyZWFtcnVubmVycy5mclwiLFxuXHRcdFx0XHQgICAgXCJjb2xvclwiOiAzMDY2OTkzLFxuXHRcdFx0XHQgICAgXCJ0aW1lc3RhbXBcIjogbWVzc2FnZS5jcmVhdGVkQXQsXG5cdFx0XHRcdCAgICBcImZvb3RlclwiOiB7XG5cdFx0XHRcdCAgICAgIFwiaWNvbl91cmxcIjogXCJodHRwczovL3N0cmVhbXJ1bm5lcnMuZnIvaW1nL2xvZ29zcXVhcmUucG5nXCIsXG5cdFx0XHRcdCAgICAgIFwidGV4dFwiOiBcIlN0cmVhbVJ1bm5lcnNcIlxuXHRcdFx0XHQgICAgfSxcblx0XHRcdFx0ICAgIFwidGh1bWJuYWlsXCI6IHtcblx0XHRcdFx0ICAgICAgXCJ1cmxcIjogXCJodHRwczovL3N0cmVhbXJ1bm5lcnMuZnIvaW1nL2xvZ29zcXVhcmUucG5nXCJcblx0XHRcdFx0ICAgIH0sXG5cdFx0XHRcdCAgICBcImF1dGhvclwiOiB7XG5cdFx0XHRcdCAgICAgIFwibmFtZVwiOiBcIkJvdCBkZSBTdHJlYW1SdW5uZXJzLmZyXCIsXG5cdFx0XHRcdCAgICAgIFwidXJsXCI6IFwiaHR0cHM6Ly9kaXNjb3JkYXBwLmNvbVwiLFxuXHRcdFx0XHQgICAgICBcImljb25fdXJsXCI6IFwiaHR0cHM6Ly9zdHJlYW1ydW5uZXJzLmZyL2ltZy9sb2dvc3F1YXJlLnBuZ1wiXG5cdFx0XHRcdCAgICB9LFxuXHRcdFx0XHQgICAgXCJmaWVsZHNcIjogW1xuXHRcdFx0XHQgICAgICB7XG5cdFx0XHRcdCAgICAgICAgXCJuYW1lXCI6IFwiUGluZ1wiLFxuXHRcdFx0XHQgICAgICAgIFwidmFsdWVcIjogbmV3IERhdGUoKS5nZXRUaW1lKCkgLSBtZXNzYWdlLmNyZWF0ZWRUaW1lc3RhbXAgKyBcIiBtcyDwn5KTXCJcblx0XHRcdFx0ICAgICAgfVxuXHRcdFx0XHQgICAgXVxuXHRcdFx0XHQgIH1cblx0XHRcdFx0fSk7ICAgICAgICBcbiAgICB9XG5cdH0pO1xuXG5cdC8vTml2ZWF1XG5cblx0Y2xpZW50Lm9uKFwibWVzc2FnZVwiLCBtZXNzYWdlID0+IHtcbiAgICBpZiAobWVzc2FnZS5hdXRob3IuYm90KSByZXR1cm47IC8vIGlnbm9yZSBib3RzXG5cbiAgICAvLyBpZiB0aGUgdXNlciBpcyBub3Qgb24gZGIgYWRkIHRoZSB1c2VyIGFuZCBjaGFuZ2UgaGlzIHZhbHVlcyB0byAwXG4gICAgaWYgKCFkYlttZXNzYWdlLmF1dGhvci5pZF0pIGRiW21lc3NhZ2UuYXV0aG9yLmlkXSA9IHtcbiAgICAgICAgeHA6IDAsXG4gICAgICAgIGxldmVsOiAwXG4gICAgICB9O1xuICAgIGRiW21lc3NhZ2UuYXV0aG9yLmlkXS54cCsrO1xuICAgIGxldCB1c2VySW5mbyA9IGRiW21lc3NhZ2UuYXV0aG9yLmlkXTtcbiAgICBpZih1c2VySW5mby54cCA+IDEwMCkge1xuICAgICAgICB1c2VySW5mby5sZXZlbCsrXG4gICAgICAgIHVzZXJJbmZvLnhwID0gMFxuICAgICAgICBtZXNzYWdlLnJlcGx5KFwiQnJhdm8sIHR1IG1vbnRlcyBkZSBuaXZlYXUgIVwiKVxuICAgIH1cbiAgICBjb25zdCBhcmdzID0gbWVzc2FnZS5jb250ZW50LnNsaWNlKGNvbmZpZy5wcmVmaXgubGVuZ3RoKS50cmltKCkuc3BsaXQoLyArL2cpO1xuICAgIGNvbnN0IGNtZCA9IGFyZ3Muc2hpZnQoKS50b0xvd2VyQ2FzZSgpO1xuICAgIGlmKGNtZCA9PT0gXCJuaXZlYXVcIikge1xuICAgICAgICBsZXQgdXNlckluZm8gPSBkYlttZXNzYWdlLmF1dGhvci5pZF07XG4gICAgICAgIGxldCBtZW1iZXIgPSBtZXNzYWdlLm1lbnRpb25zLm1lbWJlcnMuZmlyc3QoKTtcbiAgICAgICAgbGV0IGVtYmVkID0gbmV3IERpc2NvcmQuUmljaEVtYmVkKClcbiAgICAgICAgLnNldENvbG9yKDB4NDI4NmY0KVxuICAgICAgICAuYWRkRmllbGQoXCJOaXZlYXVcIiwgdXNlckluZm8ubGV2ZWwpXG4gICAgICAgIC5hZGRGaWVsZChcIlhQXCIsIHVzZXJJbmZvLnhwK1wiLzEwMFwiKTtcbiAgICAgICAgaWYoIW1lbWJlcikgcmV0dXJuIG1lc3NhZ2UuY2hhbm5lbC5zZW5kRW1iZWQoZW1iZWQpXG4gICAgICAgIGxldCBtZW1iZXJJbmZvID0gZGJbbWVtYmVyLmlkXVxuICAgICAgICBsZXQgZW1iZWQyID0gbmV3IERpc2NvcmQuUmljaEVtYmVkKClcbiAgICAgICAgLnNldENvbG9yKDB4NDI4NmY0KVxuICAgICAgICAuYWRkRmllbGQoXCJOaXZlYXVcIiwgbWVtYmVySW5mby5sZXZlbClcbiAgICAgICAgLmFkZEZpZWxkKFwiWFBcIiwgbWVtYmVySW5mby54cCtcIi8xMDBcIilcbiAgICAgICAgbWVzc2FnZS5jaGFubmVsLnNlbmRFbWJlZChlbWJlZDIpXG4gICAgfVxuICAgIGZzLndyaXRlRmlsZShcIi4vZGF0YWJhc2UuanNvblwiLCBKU09OLnN0cmluZ2lmeShkYiksICh4KSA9PiB7XG4gICAgICAgIGlmICh4KSBjb25zb2xlLmVycm9yKHgpXG4gICAgICB9KTtcbn0pXG5cbiAgICAvL0xlYWRlcmJvYXJkXG4gICAgY2xpZW50Lm9uKFwibWVzc2FnZVwiLCBhc3luYyBtc2cgPT4ge1xuICAgICAgICBpZiAoIW1zZy5hdXRob3IuYm90ICYmIG1zZy5jb250ZW50ID09PSBcIiFsZWFkZXJib2FyZHBvaW50c1wiKSB7XG5cbiAgICAgICAgICAgIC8vTW9zdCBwb2ludHNcbiAgICAgICAgICAgIGNvbnN0IG1vc3RQb2ludHMgPSBhd2FpdCBVc2VyLm1vc3RQb2ludHMoKTtcblxuICAgICAgICAgICAgbGV0IHBvaW50c1Jlc3BvbnNlID0gXCJQb2ludHNgYGBcIjtcbiAgICAgICAgICAgIGxldCBwbGFjZW1lbnQgPSAwO1xuICAgICAgICAgICAgZm9yIChjb25zdCB1c2VyIG9mIG1vc3RQb2ludHMpIHtcbiAgICAgICAgICAgICAgICBwb2ludHNSZXNwb25zZSArPSBgJHsrK3BsYWNlbWVudH0jICR7dXNlci5kaXNwbGF5X25hbWV9XFxuXFx0JHt1c2VyLnBvaW50c31cXG5gXG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBwb2ludHNSZXNwb25zZSArPSBcImBgYFwiO1xuXG4gICAgICAgICAgICAvL01vc3QgcGxhY2VcbiAgICAgICAgICAgIGNvbnN0IG1vc3RQbGFjZSA9IGF3YWl0IFVzZXIubW9zdFBsYWNlKCk7XG5cbiAgICAgICAgICAgIGxldCBwbGFjZVJlc3BvbnNlID0gXCJTZWNvbmRlIHN0cmVhbcOpYGBgXCI7XG4gICAgICAgICAgICBwbGFjZW1lbnQgPSAwO1xuICAgICAgICAgICAgZm9yIChjb25zdCB1c2VyIG9mIG1vc3RQbGFjZSkge1xuICAgICAgICAgICAgICAgIHBsYWNlUmVzcG9uc2UgKz0gYCR7KytwbGFjZW1lbnR9IyAke3VzZXIuZGlzcGxheV9uYW1lfVxcblxcdCR7dXNlci50aW1lfVxcbmBcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHBsYWNlUmVzcG9uc2UgKz0gXCJgYGBcIjtcblxuXG4gICAgICAgICAgICBhd2FpdCBtc2cuY2hhbm5lbC5zZW5kKHBvaW50c1Jlc3BvbnNlKTtcbiAgICAgICAgICAgIGF3YWl0IG1zZy5jaGFubmVsLnNlbmQocGxhY2VSZXNwb25zZSk7XG5cbiAgICAgICAgfVxuICAgIH0pO1xuXG5cbiAgICAvL01haW50ZW5hbmNlXG4gICAgaWYgKHByb2Nlc3MuZW52Lk1BSU5URU5BTkNFPy50b0xvd2VyQ2FzZSgpID09PSBcInRydWVcIikge1xuICAgICAgICBhcHAudXNlKFwiKlwiLCAocmVxLCByZXMpID0+IHtcbiAgICAgICAgICAgIHJldHVybiByZXMucmVuZGVyKFwibWFpbnRlbmFuY2VcIik7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIGFwcC51c2UobG9nZ2VyKCdkZXYnKSk7XG4gICAgYXBwLnVzZShleHByZXNzLmpzb24oKSk7XG4gICAgYXBwLnVzZShleHByZXNzLnVybGVuY29kZWQoe2V4dGVuZGVkOiBmYWxzZX0pKTtcbiAgICBhcHAudXNlKGNvb2tpZVBhcnNlcigpKTtcblxuXG4gICAgYXBwLnVzZShjb21wcmVzc2lvbigpKTtcbiAgICBhcHAudXNlKGhlbG1ldCgpKTtcblxuICAgIGFwcC51c2UoZXhwcmVzcy5zdGF0aWMocGF0aC5qb2luKF9fZGlybmFtZSwgJ3B1YmxpYycpKSk7XG5cbiAgICBhcHAudXNlKGNvb2tpZVNlc3Npb24oe2tleXM6IFtwcm9jZXNzLmVudi5DT09LSUVfS0VZXX0pKTsgLy8gRXhwcmVzcyBjb29raWUgc2Vzc2lvbiBtaWRkbGV3YXJlXG5cbiAgICAvL1Bhc3Nwb3J0XG4gICAgcGFzc3BvcnQudXNlKG5ldyB0d2l0Y2hTdHJhdGVneSh7XG4gICAgICAgICAgICBjbGllbnRJRDogcHJvY2Vzcy5lbnYuVFdJVENIX0NMSUVOVF9JRCxcbiAgICAgICAgICAgIGNsaWVudFNlY3JldDogcHJvY2Vzcy5lbnYuVFdJVENIX0NMSUVOVF9TRUNSRVQsXG4gICAgICAgICAgICBjYWxsYmFja1VSTDogcHJvY2Vzcy5lbnYuSE9TVE5BTUUgKyBcIi9hdXRoL3R3aXRjaC9jYWxsYmFja1wiLFxuICAgICAgICAgICAgc2NvcGU6IFwidXNlcl9yZWFkXCJcbiAgICAgICAgfSxcbiAgICAgICAgYXN5bmMgZnVuY3Rpb24gKGFjY2Vzc1Rva2VuLCByZWZyZXNoVG9rZW4sIHByb2ZpbGUsIGRvbmUpIHtcblxuICAgICAgICAgICAgLy9GaW5kIG9yIGNyZWF0ZVxuICAgICAgICAgICAgbGV0IHVzZXJzID0gYXdhaXQgVXNlci5maW5kKHt0d2l0Y2hJZDogcHJvZmlsZS5pZH0pO1xuXG4gICAgICAgICAgICBpZiAodXNlcnMubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgICAgIC8vTWV0IMOgIGpvdXJcbiAgICAgICAgICAgICAgICBsZXQgdXNlciA9IHVzZXJzWzBdO1xuXG4gICAgICAgICAgICAgICAgdXNlci51c2VybmFtZSA9IHByb2ZpbGUubG9naW47XG4gICAgICAgICAgICAgICAgdXNlci5kaXNwbGF5X25hbWUgPSBwcm9maWxlLmRpc3BsYXlfbmFtZTtcbiAgICAgICAgICAgICAgICB1c2VyLmF2YXRhciA9IHByb2ZpbGUucHJvZmlsZV9pbWFnZV91cmw7XG5cbiAgICAgICAgICAgICAgICBhd2FpdCB1c2VyLnNhdmUoKTtcblxuICAgICAgICAgICAgICAgIGRvbmUobnVsbCwgdXNlcik7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICBsZXQgbmV3VXNlciA9IG5ldyBVc2VyKCk7XG5cbiAgICAgICAgICAgICAgICBuZXdVc2VyLnR3aXRjaElkID0gcHJvZmlsZS5pZDtcbiAgICAgICAgICAgICAgICBuZXdVc2VyLnVzZXJuYW1lID0gcHJvZmlsZS5sb2dpbjtcbiAgICAgICAgICAgICAgICBuZXdVc2VyLmRpc3BsYXlfbmFtZSA9IHByb2ZpbGUuZGlzcGxheV9uYW1lO1xuICAgICAgICAgICAgICAgIG5ld1VzZXIuYXZhdGFyID0gcHJvZmlsZS5wcm9maWxlX2ltYWdlX3VybDtcblxuICAgICAgICAgICAgICAgIGF3YWl0IG5ld1VzZXIuc2F2ZSgpO1xuXG4gICAgICAgICAgICAgICAgZG9uZShudWxsLCBuZXdVc2VyKTtcblxuICAgICAgICAgICAgfVxuXG4gICAgICAgIH0pKTtcbiAgICBwYXNzcG9ydC5zZXJpYWxpemVVc2VyKGZ1bmN0aW9uICh1c2VyLCBkb25lKSB7XG4gICAgICAgIGRvbmUobnVsbCwgdXNlci50d2l0Y2hJZCk7XG4gICAgfSk7XG4gICAgcGFzc3BvcnQuZGVzZXJpYWxpemVVc2VyKGZ1bmN0aW9uICh0d2l0Y2hJZCwgZG9uZSkge1xuICAgICAgICBVc2VyLmZpbmRPbmUoe3R3aXRjaElkOiB0d2l0Y2hJZH0pLnRoZW4oKHVzZXIpID0+IHtcbiAgICAgICAgICAgIGxldCByZWFsVXNlciA9IHVzZXIgPT0gdW5kZWZpbmVkID8gZmFsc2UgOiB1c2VyO1xuICAgICAgICAgICAgZG9uZShudWxsLCByZWFsVXNlcik7XG4gICAgICAgIH0pO1xuICAgIH0pO1xuXG4gICAgYXBwLnVzZShwYXNzcG9ydC5pbml0aWFsaXplKCkpOyAgIC8vIHBhc3Nwb3J0IGluaXRpYWxpemUgbWlkZGxld2FyZVxuICAgIGFwcC51c2UocGFzc3BvcnQuc2Vzc2lvbigpKTsgICAgICAvLyBwYXNzcG9ydCBzZXNzaW9uIG1pZGRsZXdhcmVcblxuICAgIC8vUGFycmFpbmFnZVxuICAgIC8qYXBwLnVzZShhc3luYyAocmVxLCByZXM6IEV4cHJlc3MuUmVzcG9uc2UsIGRvbmUpID0+IHtcblxuICAgICAgICBpZiAocmVxLnF1ZXJ5LnBhcnJhaW5faWQgIT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICByZXEuc2Vzc2lvbi5wYXJyYWluX2lkID0gcmVxLnF1ZXJ5LnBhcnJhaW5faWQ7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAocmVxLmlzQXV0aGVudGljYXRlZCgpICYmIHJlcS5zZXNzaW9uLnBhcnJhaW5faWQgIT0gdW5kZWZpbmVkICYmIHJlcS51c2VyLnBhcnJhaW4gPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICByZXEudXNlci5wYXJyYWluID0gYXdhaXQgVXNlci5maW5kT25lKHt3aGVyZToge3BhcnJhaW5hZ2VfaWQ6IHJlcS5zZXNzaW9uLnBhcnJhaW5faWR9fSk7XG4gICAgICAgICAgICBhd2FpdCByZXEudXNlci5zYXZlKCk7XG4gICAgICAgIH1cblxuICAgICAgICBkb25lKCk7XG5cbiAgICB9KTsqL1xuXG4gICAgLy9TdHJlYW1RdWV1ZVxuICAgIC8qIGFzeW5jIGZ1bmN0aW9uIHVwZGF0ZSgpIHtcbiAgICAgICAgIGF3YWl0IHVwZGF0ZVN0cmVhbVF1ZXVlKCkuY2F0Y2gocmVhc29uID0+IHtcbiAgICAgICAgICAgICBjb25zb2xlLmxvZyhyZWFzb24pO1xuICAgICAgICAgfSk7XG4gICAgICAgICBzZXRUaW1lb3V0KHVwZGF0ZSwgMTAwMCk7XG4gICAgIH1cblxuICAgICB1cGRhdGUoKS5jYXRjaChyZWFzb24gPT4gY29uc29sZS5sb2cocmVhc29uKSk7Ki9cbiAgICAvKmFwcC51c2UoYXN5bmMgKHJlcSwgcmVzOiBFeHByZXNzLlJlc3BvbnNlLCBkb25lKSA9PiB7XG4gICAgICAgIGF3YWl0IHVwZGF0ZVN0cmVhbVF1ZXVlKCk7XG4gICAgICAgIGRvbmUoKTtcbiAgICB9KTsqL1xuXG4gICAgLy9Sb3V0ZXNcbiAgICBhcHAudXNlKCcvJywgaW5kZXhSb3V0ZXIpO1xuICAgIGFwcC51c2UoJy9jYXNlJywgY2FzZVJvdXRlcik7XG4gICAgYXBwLnVzZSgnL3BhcnJhaW5hZ2UnLCBwYXJyYWluYWdlUm91dGVyKTtcbiAgICBhcHAudXNlKCcvZ2l2ZWF3YXknLCBnaXZlYXdheVJvdXRlcik7XG4gICAgYXBwLnVzZSgnL2NvdXBvbicsIGNvdXBvblJvdXRlcik7XG4gICAgYXBwLnVzZSgnL3BvaW50cycsIHBvaW50c1JvdXRlcik7XG4gICAgYXBwLnVzZSgnL3dhdGNoJywgd2F0Y2hSb3V0ZXIpO1xuICAgIGFwcC51c2UoJy9zaG9wJywgc2hvcFJvdXRlcik7XG4gICAgYXBwLnVzZSgnL3N0dWZmc2hvcCcsIHN0dWZmc2hvcFJvdXRlcik7XG4gICAgYXBwLnVzZSgnL2FkbWluJywgYWRtaW5Sb3V0ZXIpO1xuXG4gICAgYXBwLmdldChcIi9hdXRoL3R3aXRjaFwiLCBwYXNzcG9ydC5hdXRoZW50aWNhdGUoXCJ0d2l0Y2hcIikpO1xuICAgIGFwcC5nZXQoXCIvYXV0aC90d2l0Y2gvY2FsbGJhY2tcIiwgcGFzc3BvcnQuYXV0aGVudGljYXRlKFwidHdpdGNoXCIsIHtmYWlsdXJlUmVkaXJlY3Q6IFwiL1wifSksIGZ1bmN0aW9uIChyZXEsIHJlcykge1xuICAgICAgICByZXMucmVkaXJlY3QoXCIvXCIpO1xuICAgIH0pO1xuXG5cbiAgICAvL1N5bmMgY2FzZXNcbiAgICBhd2FpdCBzeW5jQ2FzZXMoY2FzZXNDb250ZW50KTtcbiAgICBhd2FpdCBzeW5jUHJvZHVjdHMoKTtcblxufSkuY2F0Y2goZXJyb3IgPT4gY29uc29sZS5sb2coZXJyb3IpKTtcblxubW9kdWxlLmV4cG9ydHMgPSBhcHA7XG4iXX0=