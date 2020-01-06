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
var stuffshopRouter = require('./routes/stuffshop');
var adminRouter = require('./routes/admin');
var oldshopRouter = require('./routes/oldshop');
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
    app.use('/oldshop', oldshopRouter);
    app.get("/auth/twitch", passport.authenticate("twitch"));
    app.get("/auth/twitch/callback", passport.authenticate("twitch", { failureRedirect: "/" }), function (req, res) {
        res.redirect("/");
    });
    //Sync cases
    yield Case_1.syncCases(CaseContent_1.casesContent);
    yield Product_1.syncProducts();
})).catch(error => console.log(error));
module.exports = app;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiL1N0cmVhbVJ1bm5lcnMvVHdpdGNoVmlldy9hcHAudHMiLCJzb3VyY2VzIjpbIi9TdHJlYW1SdW5uZXJzL1R3aXRjaFZpZXcvYXBwLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7O0FBQUEsNEJBQTBCO0FBQzFCLHFDQUF5QztBQUN6QyxpREFBNEM7QUFHNUMsaURBQWlEO0FBQ2pELHFEQUFpRDtBQUVqRCw0QkFBMEI7QUFFMUIsdURBQWdFO0FBRWhFLE1BQU0sTUFBTSxHQUFHLE9BQU8sQ0FBQyxRQUFRLENBQUMsQ0FBQztBQUVqQyxNQUFNLE9BQU8sR0FBRyxPQUFPLENBQUMsU0FBUyxDQUFDLENBQUM7QUFDbkMsTUFBTSxJQUFJLEdBQUcsT0FBTyxDQUFDLE1BQU0sQ0FBQyxDQUFDO0FBQzdCLE1BQU0sWUFBWSxHQUFHLE9BQU8sQ0FBQyxlQUFlLENBQUMsQ0FBQztBQUM5QyxNQUFNLGFBQWEsR0FBRyxPQUFPLENBQUMsZ0JBQWdCLENBQUMsQ0FBQztBQUNoRCxNQUFNLE1BQU0sR0FBRyxPQUFPLENBQUMsUUFBUSxDQUFDLENBQUM7QUFDakMsTUFBTSxlQUFlLEdBQUcsT0FBTyxDQUFDLGtCQUFrQixDQUFDLENBQUM7QUFDcEQsTUFBTSxRQUFRLEdBQUcsT0FBTyxDQUFDLFVBQVUsQ0FBQyxDQUFDO0FBQ3JDLE1BQU0sY0FBYyxHQUFHLE9BQU8sQ0FBQyxxQkFBcUIsQ0FBQyxDQUFDLFFBQVEsQ0FBQztBQUMvRCxNQUFNLFdBQVcsR0FBRyxPQUFPLENBQUMsYUFBYSxDQUFDLENBQUM7QUFDM0MsTUFBTSxNQUFNLEdBQUcsT0FBTyxDQUFDLFFBQVEsQ0FBQyxDQUFDO0FBQ2pDLE1BQU0sT0FBTyxHQUFHLE9BQU8sQ0FBQyxZQUFZLENBQUMsQ0FBQztBQUN0QyxNQUFNLEVBQUUsR0FBRyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUM7QUFDekIsTUFBTSxNQUFNLEdBQUcsT0FBTyxDQUFDLGVBQWUsQ0FBQyxDQUFDO0FBQ3hDLElBQUksRUFB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Q0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUM7QUFFdEMsTUFBTSxDQUFDLE9BQU8sR0FBRyxHQUFHLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgXCJyZWZsZWN0LW1ldGFkYXRhXCI7XG5pbXBvcnQge2NyZWF0ZUNvbm5lY3Rpb259IGZyb20gXCJ0eXBlb3JtXCI7XG5pbXBvcnQge1VzZXJ9IGZyb20gXCIuL2RhdGFiYXNlL2VudGl0eS9Vc2VyXCI7XG5pbXBvcnQge3VwZGF0ZVN0cmVhbVF1ZXVlfSBmcm9tIFwiLi9kYXRhYmFzZS9lbnRpdHkvU3RyZWFtUXVldWVcIjtcbmltcG9ydCB7c3luY30gZnJvbSBcImdsb2JcIjtcbmltcG9ydCB7c3luY0Nhc2VzfSBmcm9tIFwiLi9kYXRhYmFzZS9lbnRpdHkvQ2FzZVwiO1xuaW1wb3J0IHtjYXNlc0NvbnRlbnR9IGZyb20gXCIuL290aGVyL0Nhc2VDb250ZW50XCI7XG5cbmltcG9ydCBcInJlZmxlY3QtbWV0YWRhdGFcIjtcbmltcG9ydCAqIGFzIGNoaWxkX3Byb2Nlc3MgZnJvbSBcImNoaWxkX3Byb2Nlc3NcIjtcbmltcG9ydCB7UHJvZHVjdCwgc3luY1Byb2R1Y3RzfSBmcm9tIFwiLi9kYXRhYmFzZS9lbnRpdHkvUHJvZHVjdFwiO1xuXG5jb25zdCBtb21lbnQgPSByZXF1aXJlKFwibW9tZW50XCIpO1xuXG5jb25zdCBleHByZXNzID0gcmVxdWlyZSgnZXhwcmVzcycpO1xuY29uc3QgcGF0aCA9IHJlcXVpcmUoJ3BhdGgnKTtcbmNvbnN0IGNvb2tpZVBhcnNlciA9IHJlcXVpcmUoJ2Nvb2tpZS1wYXJzZXInKTtcbmNvbnN0IGNvb2tpZVNlc3Npb24gPSByZXF1aXJlKCdjb29raWUtc2Vzc2lvbicpO1xuY29uc3QgbG9nZ2VyID0gcmVxdWlyZSgnbW9yZ2FuJyk7XG5jb25zdCBleHByZXNzTnVuanVja3MgPSByZXF1aXJlKCdleHByZXNzLW51bmp1Y2tzJyk7XG5jb25zdCBwYXNzcG9ydCA9IHJlcXVpcmUoJ3Bhc3Nwb3J0Jyk7XG5jb25zdCB0d2l0Y2hTdHJhdGVneSA9IHJlcXVpcmUoXCJwYXNzcG9ydC10d2l0Y2gtbmV3XCIpLlN0cmF0ZWd5O1xuY29uc3QgY29tcHJlc3Npb24gPSByZXF1aXJlKCdjb21wcmVzc2lvbicpO1xuY29uc3QgaGVsbWV0ID0gcmVxdWlyZSgnaGVsbWV0Jyk7XG5jb25zdCBEaXNjb3JkID0gcmVxdWlyZShcImRpc2NvcmQuanNcIik7XG5jb25zdCBmcyA9IHJlcXVpcmUoXCJmc1wiKTtcbmNvbnN0IGNvbmZpZyA9IHJlcXVpcmUoJy4vY29uZmlnLmpzb24nKTtcbmxldCBkYiA9IEpTT04ucGFyc2UoZnMucmVhZEZpbGVTeW5jKFwiLi9kYXRhYmFzZS5qc29uXCIsIFwidXRmOFwiKSk7XG5cbi8vLmVudlxucmVxdWlyZShcImRvdGVudlwiKS5jb25maWcoKTtcblxuLy9Mb2FkIHJvdXRlc1xudmFyIGluZGV4Um91dGVyID0gcmVxdWlyZSgnLi9yb3V0ZXMvaW5kZXgnKTtcbnZhciBjYXNlUm91dGVyID0gcmVxdWlyZSgnLi9yb3V0ZXMvY2FzZScpO1xudmFyIHNob3BSb3V0ZXIgPSByZXF1aXJlKCcuL3JvdXRlcy9zaG9wJyk7XG52YXIgcGFycmFpbmFnZVJvdXRlciA9IHJlcXVpcmUoJy4vcm91dGVzL3BhcnJhaW5hZ2UnKTtcbnZhciBnaXZlYXdheVJvdXRlciA9IHJlcXVpcmUoJy4vcm91dGVzL2dpdmVhd2F5Jyk7XG52YXIgY291cG9uUm91dGVyID0gcmVxdWlyZSgnLi9yb3V0ZXMvY291cG9uJyk7XG52YXIgcG9pbnRzUm91dGVyID0gcmVxdWlyZSgnLi9yb3V0ZXMvcG9pbnRzJyk7XG52YXIgd2F0Y2hSb3V0ZXIgPSByZXF1aXJlKCcuL3JvdXRlcy93YXRjaCcpO1xudmFyIHN0dWZmc2hvcFJvdXRlciA9IHJlcXVpcmUoJy4vcm91dGVzL3N0dWZmc2hvcCcpO1xudmFyIGFkbWluUm91dGVyID0gcmVxdWlyZSgnLi9yb3V0ZXMvYWRtaW4nKTtcbnZhciBvbGRzaG9wUm91dGVyID0gcmVxdWlyZSgnLi9yb3V0ZXMvb2xkc2hvcCcpO1xuXG4vL0FwcFxudmFyIGFwcCA9IGV4cHJlc3MoKTtcblxuZ2xvYmFsWydkaXNjb3JkQW50aVNwYW1EYXRlJ10gPSBtb21lbnQoKS5zdWJ0cmFjdChcIjIwXCIsIFwiaG91cnNcIik7XG5cbi8vREJcbmNyZWF0ZUNvbm5lY3Rpb24oKS50aGVuKGFzeW5jICgpID0+IHtcblxuICAgIGNvbnN0IGlzRGV2ID0gYXBwLmdldCgnZW52JykgPT09ICdkZXZlbG9wbWVudCc7XG5cbiAgICAvL051bmp1Y2tzXG4gICAgYXBwLnNldCgndmlld3MnLCBfX2Rpcm5hbWUgKyAnL3ZpZXdzJyk7XG4gICAgYXBwLnNldChcInZpZXcgZW5naW5lXCIsIFwibnVualwiKTtcbiAgICBjb25zdCBuamsgPSBleHByZXNzTnVuanVja3MoYXBwLCB7XG4gICAgICAgIHdhdGNoOiBpc0RldixcbiAgICAgICAgbm9DYWNoZTogaXNEZXYsXG4gICAgICAgIGdsb2JhbHM6IHtcbiAgICAgICAgICAgIEhPU1ROQU1FOiBwcm9jZXNzLmVudi5IT1NUTkFNRVxuICAgICAgICB9XG4gICAgfSk7XG5cbiAgICAvL0Rpc2NvcmRcbiAgICBjb25zdCBjbGllbnQgPSBuZXcgRGlzY29yZC5DbGllbnQoKTtcbiAgICBhd2FpdCBjbGllbnQubG9naW4ocHJvY2Vzcy5lbnYuRElTQ09SRF9UT0tFTik7XG4gICAgY2xpZW50LnVzZXIuc2V0QWN0aXZpdHkoXCJodHRwczovL3N0cmVhbXJ1bm5lcnMuZnJcIiwge3R5cGU6IFwiV0FUQ0hJTkdcIn0pO1xuICAgIGFwcC51c2UoKHJlcSwgcmVzLCBuZXh0KSA9PiB7XG4gICAgICAgIHJlcS5kaXNjb3JkID0gY2xpZW50O1xuICAgICAgICBuZXh0KCk7XG4gICAgfSk7XG5cbiAgICAvL3BpbmdcbiAgICBjbGllbnQub24oJ21lc3NhZ2UnLCBtZXNzYWdlID0+IHtcbiAgICBpZihtZXNzYWdlLmNvbnRlbnQuc3RhcnRzV2l0aChcIiFwaW5nXCIpKSB7XG4gICAgICAgICAgICBtZXNzYWdlLmNoYW5uZWwuc2VuZChcbiAgICAgICAgICAgIFx0e1xuXHRcdFx0XHQgIFwiZW1iZWRcIjoge1xuXHRcdFx0XHQgICAgXCJ0aXRsZVwiOiBcIlBpbmdcIixcblx0XHRcdFx0ICAgIFwidXJsXCI6IFwiaHR0cHM6Ly9zdHJlYW1ydW5uZXJzLmZyXCIsXG5cdFx0XHRcdCAgICBcImNvbG9yXCI6IDMwNjY5OTMsXG5cdFx0XHRcdCAgICBcInRpbWVzdGFtcFwiOiBtZXNzYWdlLmNyZWF0ZWRBdCxcblx0XHRcdFx0ICAgIFwiZm9vdGVyXCI6IHtcblx0XHRcdFx0ICAgICAgXCJpY29uX3VybFwiOiBcImh0dHBzOi8vc3RyZWFtcnVubmVycy5mci9pbWcvbG9nb3NxdWFyZS5wbmdcIixcblx0XHRcdFx0ICAgICAgXCJ0ZXh0XCI6IFwiU3RyZWFtUnVubmVyc1wiXG5cdFx0XHRcdCAgICB9LFxuXHRcdFx0XHQgICAgXCJ0aHVtYm5haWxcIjoge1xuXHRcdFx0XHQgICAgICBcInVybFwiOiBcImh0dHBzOi8vc3RyZWFtcnVubmVycy5mci9pbWcvbG9nb3NxdWFyZS5wbmdcIlxuXHRcdFx0XHQgICAgfSxcblx0XHRcdFx0ICAgIFwiYXV0aG9yXCI6IHtcblx0XHRcdFx0ICAgICAgXCJuYW1lXCI6IFwiQm90IGRlIFN0cmVhbVJ1bm5lcnMuZnJcIixcblx0XHRcdFx0ICAgICAgXCJ1cmxcIjogXCJodHRwczovL2Rpc2NvcmRhcHAuY29tXCIsXG5cdFx0XHRcdCAgICAgIFwiaWNvbl91cmxcIjogXCJodHRwczovL3N0cmVhbXJ1bm5lcnMuZnIvaW1nL2xvZ29zcXVhcmUucG5nXCJcblx0XHRcdFx0ICAgIH0sXG5cdFx0XHRcdCAgICBcImZpZWxkc1wiOiBbXG5cdFx0XHRcdCAgICAgIHtcblx0XHRcdFx0ICAgICAgICBcIm5hbWVcIjogXCJQaW5nXCIsXG5cdFx0XHRcdCAgICAgICAgXCJ2YWx1ZVwiOiBuZXcgRGF0ZSgpLmdldFRpbWUoKSAtIG1lc3NhZ2UuY3JlYXRlZFRpbWVzdGFtcCArIFwiIG1zIPCfkpNcIlxuXHRcdFx0XHQgICAgICB9XG5cdFx0XHRcdCAgICBdXG5cdFx0XHRcdCAgfVxuXHRcdFx0XHR9KTsgICAgICAgIFxuICAgIH1cblx0fSk7XG5cblx0Ly9OaXZlYXVcblxuXHRjbGllbnQub24oXCJtZXNzYWdlXCIsIG1lc3NhZ2UgPT4ge1xuICAgIGlmIChtZXNzYWdlLmF1dGhvci5ib3QpIHJldHVybjsgLy8gaWdub3JlIGJvdHNcblxuICAgIC8vIGlmIHRoZSB1c2VyIGlzIG5vdCBvbiBkYiBhZGQgdGhlIHVzZXIgYW5kIGNoYW5nZSBoaXMgdmFsdWVzIHRvIDBcbiAgICBpZiAoIWRiW21lc3NhZ2UuYXV0aG9yLmlkXSkgZGJbbWVzc2FnZS5hdXRob3IuaWRdID0ge1xuICAgICAgICB4cDogMCxcbiAgICAgICAgbGV2ZWw6IDBcbiAgICAgIH07XG4gICAgZGJbbWVzc2FnZS5hdXRob3IuaWRdLnhwKys7XG4gICAgbGV0IHVzZXJJbmZvID0gZGJbbWVzc2FnZS5hdXRob3IuaWRdO1xuICAgIGlmKHVzZXJJbmZvLnhwID4gMTAwKSB7XG4gICAgICAgIHVzZXJJbmZvLmxldmVsKytcbiAgICAgICAgdXNlckluZm8ueHAgPSAwXG4gICAgICAgIG1lc3NhZ2UucmVwbHkoXCJCcmF2bywgdHUgbW9udGVzIGRlIG5pdmVhdSAhXCIpXG4gICAgfVxuICAgIGNvbnN0IGFyZ3MgPSBtZXNzYWdlLmNvbnRlbnQuc2xpY2UoY29uZmlnLnByZWZpeC5sZW5ndGgpLnRyaW0oKS5zcGxpdCgvICsvZyk7XG4gICAgY29uc3QgY21kID0gYXJncy5zaGlmdCgpLnRvTG93ZXJDYXNlKCk7XG4gICAgaWYoY21kID09PSBcIm5pdmVhdVwiKSB7XG4gICAgICAgIGxldCB1c2VySW5mbyA9IGRiW21lc3NhZ2UuYXV0aG9yLmlkXTtcbiAgICAgICAgbGV0IG1lbWJlciA9IG1lc3NhZ2UubWVudGlvbnMubWVtYmVycy5maXJzdCgpO1xuICAgICAgICBsZXQgZW1iZWQgPSBuZXcgRGlzY29yZC5SaWNoRW1iZWQoKVxuICAgICAgICAuc2V0Q29sb3IoMHg0Mjg2ZjQpXG4gICAgICAgIC5hZGRGaWVsZChcIk5pdmVhdVwiLCB1c2VySW5mby5sZXZlbClcbiAgICAgICAgLmFkZEZpZWxkKFwiWFBcIiwgdXNlckluZm8ueHArXCIvMTAwXCIpO1xuICAgICAgICBpZighbWVtYmVyKSByZXR1cm4gbWVzc2FnZS5jaGFubmVsLnNlbmRFbWJlZChlbWJlZClcbiAgICAgICAgbGV0IG1lbWJlckluZm8gPSBkYlttZW1iZXIuaWRdXG4gICAgICAgIGxldCBlbWJlZDIgPSBuZXcgRGlzY29yZC5SaWNoRW1iZWQoKVxuICAgICAgICAuc2V0Q29sb3IoMHg0Mjg2ZjQpXG4gICAgICAgIC5hZGRGaWVsZChcIk5pdmVhdVwiLCBtZW1iZXJJbmZvLmxldmVsKVxuICAgICAgICAuYWRkRmllbGQoXCJYUFwiLCBtZW1iZXJJbmZvLnhwK1wiLzEwMFwiKVxuICAgICAgICBtZXNzYWdlLmNoYW5uZWwuc2VuZEVtYmVkKGVtYmVkMilcbiAgICB9XG4gICAgZnMud3JpdGVGaWxlKFwiLi9kYXRhYmFzZS5qc29uXCIsIEpTT04uc3RyaW5naWZ5KGRiKSwgKHgpID0+IHtcbiAgICAgICAgaWYgKHgpIGNvbnNvbGUuZXJyb3IoeClcbiAgICAgIH0pO1xufSlcblxuICAgIC8vTGVhZGVyYm9hcmRcbiAgICBjbGllbnQub24oXCJtZXNzYWdlXCIsIGFzeW5jIG1zZyA9PiB7XG4gICAgICAgIGlmICghbXNnLmF1dGhvci5ib3QgJiYgbXNnLmNvbnRlbnQgPT09IFwiIWxlYWRlcmJvYXJkcG9pbnRzXCIpIHtcblxuICAgICAgICAgICAgLy9Nb3N0IHBvaW50c1xuICAgICAgICAgICAgY29uc3QgbW9zdFBvaW50cyA9IGF3YWl0IFVzZXIubW9zdFBvaW50cygpO1xuXG4gICAgICAgICAgICBsZXQgcG9pbnRzUmVzcG9uc2UgPSBcIlBvaW50c2BgYFwiO1xuICAgICAgICAgICAgbGV0IHBsYWNlbWVudCA9IDA7XG4gICAgICAgICAgICBmb3IgKGNvbnN0IHVzZXIgb2YgbW9zdFBvaW50cykge1xuICAgICAgICAgICAgICAgIHBvaW50c1Jlc3BvbnNlICs9IGAkeysrcGxhY2VtZW50fSMgJHt1c2VyLmRpc3BsYXlfbmFtZX1cXG5cXHQke3VzZXIucG9pbnRzfVxcbmBcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHBvaW50c1Jlc3BvbnNlICs9IFwiYGBgXCI7XG5cbiAgICAgICAgICAgIC8vTW9zdCBwbGFjZVxuICAgICAgICAgICAgY29uc3QgbW9zdFBsYWNlID0gYXdhaXQgVXNlci5tb3N0UGxhY2UoKTtcblxuICAgICAgICAgICAgbGV0IHBsYWNlUmVzcG9uc2UgPSBcIlNlY29uZGUgc3RyZWFtw6lgYGBcIjtcbiAgICAgICAgICAgIHBsYWNlbWVudCA9IDA7XG4gICAgICAgICAgICBmb3IgKGNvbnN0IHVzZXIgb2YgbW9zdFBsYWNlKSB7XG4gICAgICAgICAgICAgICAgcGxhY2VSZXNwb25zZSArPSBgJHsrK3BsYWNlbWVudH0jICR7dXNlci5kaXNwbGF5X25hbWV9XFxuXFx0JHt1c2VyLnRpbWV9XFxuYFxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcGxhY2VSZXNwb25zZSArPSBcImBgYFwiO1xuXG5cbiAgICAgICAgICAgIGF3YWl0IG1zZy5jaGFubmVsLnNlbmQocG9pbnRzUmVzcG9uc2UpO1xuICAgICAgICAgICAgYXdhaXQgbXNnLmNoYW5uZWwuc2VuZChwbGFjZVJlc3BvbnNlKTtcblxuICAgICAgICB9XG4gICAgfSk7XG5cblxuICAgIC8vTWFpbnRlbmFuY2VcbiAgICBpZiAocHJvY2Vzcy5lbnYuTUFJTlRFTkFOQ0U/LnRvTG93ZXJDYXNlKCkgPT09IFwidHJ1ZVwiKSB7XG4gICAgICAgIGFwcC51c2UoXCIqXCIsIChyZXEsIHJlcykgPT4ge1xuICAgICAgICAgICAgcmV0dXJuIHJlcy5yZW5kZXIoXCJtYWludGVuYW5jZVwiKTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgYXBwLnVzZShsb2dnZXIoJ2RldicpKTtcbiAgICBhcHAudXNlKGV4cHJlc3MuanNvbigpKTtcbiAgICBhcHAudXNlKGV4cHJlc3MudXJsZW5jb2RlZCh7ZXh0ZW5kZWQ6IGZhbHNlfSkpO1xuICAgIGFwcC51c2UoY29va2llUGFyc2VyKCkpO1xuXG5cbiAgICBhcHAudXNlKGNvbXByZXNzaW9uKCkpO1xuICAgIGFwcC51c2UoaGVsbWV0KCkpO1xuXG4gICAgYXBwLnVzZShleHByZXNzLnN0YXRpYyhwYXRoLmpvaW4oX19kaXJuYW1lLCAncHVibGljJykpKTtcblxuICAgIGFwcC51c2UoY29va2llU2Vzc2lvbih7a2V5czogW3Byb2Nlc3MuZW52LkNPT0tJRV9LRVldfSkpOyAvLyBFeHByZXNzIGNvb2tpZSBzZXNzaW9uIG1pZGRsZXdhcmVcblxuICAgIC8vUGFzc3BvcnRcbiAgICBwYXNzcG9ydC51c2UobmV3IHR3aXRjaFN0cmF0ZWd5KHtcbiAgICAgICAgICAgIGNsaWVudElEOiBwcm9jZXNzLmVudi5UV0lUQ0hfQ0xJRU5UX0lELFxuICAgICAgICAgICAgY2xpZW50U2VjcmV0OiBwcm9jZXNzLmVudi5UV0lUQ0hfQ0xJRU5UX1NFQ1JFVCxcbiAgICAgICAgICAgIGNhbGxiYWNrVVJMOiBwcm9jZXNzLmVudi5IT1NUTkFNRSArIFwiL2F1dGgvdHdpdGNoL2NhbGxiYWNrXCIsXG4gICAgICAgICAgICBzY29wZTogXCJ1c2VyX3JlYWRcIlxuICAgICAgICB9LFxuICAgICAgICBhc3luYyBmdW5jdGlvbiAoYWNjZXNzVG9rZW4sIHJlZnJlc2hUb2tlbiwgcHJvZmlsZSwgZG9uZSkge1xuXG4gICAgICAgICAgICAvL0ZpbmQgb3IgY3JlYXRlXG4gICAgICAgICAgICBsZXQgdXNlcnMgPSBhd2FpdCBVc2VyLmZpbmQoe3R3aXRjaElkOiBwcm9maWxlLmlkfSk7XG5cbiAgICAgICAgICAgIGlmICh1c2Vycy5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICAgICAgLy9NZXQgw6Agam91clxuICAgICAgICAgICAgICAgIGxldCB1c2VyID0gdXNlcnNbMF07XG5cbiAgICAgICAgICAgICAgICB1c2VyLnVzZXJuYW1lID0gcHJvZmlsZS5sb2dpbjtcbiAgICAgICAgICAgICAgICB1c2VyLmRpc3BsYXlfbmFtZSA9IHByb2ZpbGUuZGlzcGxheV9uYW1lO1xuICAgICAgICAgICAgICAgIHVzZXIuYXZhdGFyID0gcHJvZmlsZS5wcm9maWxlX2ltYWdlX3VybDtcblxuICAgICAgICAgICAgICAgIGF3YWl0IHVzZXIuc2F2ZSgpO1xuXG4gICAgICAgICAgICAgICAgZG9uZShudWxsLCB1c2VyKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIGxldCBuZXdVc2VyID0gbmV3IFVzZXIoKTtcblxuICAgICAgICAgICAgICAgIG5ld1VzZXIudHdpdGNoSWQgPSBwcm9maWxlLmlkO1xuICAgICAgICAgICAgICAgIG5ld1VzZXIudXNlcm5hbWUgPSBwcm9maWxlLmxvZ2luO1xuICAgICAgICAgICAgICAgIG5ld1VzZXIuZGlzcGxheV9uYW1lID0gcHJvZmlsZS5kaXNwbGF5X25hbWU7XG4gICAgICAgICAgICAgICAgbmV3VXNlci5hdmF0YXIgPSBwcm9maWxlLnByb2ZpbGVfaW1hZ2VfdXJsO1xuXG4gICAgICAgICAgICAgICAgYXdhaXQgbmV3VXNlci5zYXZlKCk7XG5cbiAgICAgICAgICAgICAgICBkb25lKG51bGwsIG5ld1VzZXIpO1xuXG4gICAgICAgICAgICB9XG5cbiAgICAgICAgfSkpO1xuICAgIHBhc3Nwb3J0LnNlcmlhbGl6ZVVzZXIoZnVuY3Rpb24gKHVzZXIsIGRvbmUpIHtcbiAgICAgICAgZG9uZShudWxsLCB1c2VyLnR3aXRjaElkKTtcbiAgICB9KTtcbiAgICBwYXNzcG9ydC5kZXNlcmlhbGl6ZVVzZXIoZnVuY3Rpb24gKHR3aXRjaElkLCBkb25lKSB7XG4gICAgICAgIFVzZXIuZmluZE9uZSh7dHdpdGNoSWQ6IHR3aXRjaElkfSkudGhlbigodXNlcikgPT4ge1xuICAgICAgICAgICAgbGV0IHJlYWxVc2VyID0gdXNlciA9PSB1bmRlZmluZWQgPyBmYWxzZSA6IHVzZXI7XG4gICAgICAgICAgICBkb25lKG51bGwsIHJlYWxVc2VyKTtcbiAgICAgICAgfSk7XG4gICAgfSk7XG5cbiAgICBhcHAudXNlKHBhc3Nwb3J0LmluaXRpYWxpemUoKSk7ICAgLy8gcGFzc3BvcnQgaW5pdGlhbGl6ZSBtaWRkbGV3YXJlXG4gICAgYXBwLnVzZShwYXNzcG9ydC5zZXNzaW9uKCkpOyAgICAgIC8vIHBhc3Nwb3J0IHNlc3Npb24gbWlkZGxld2FyZVxuXG4gICAgLy9QYXJyYWluYWdlXG4gICAgLyphcHAudXNlKGFzeW5jIChyZXEsIHJlczogRXhwcmVzcy5SZXNwb25zZSwgZG9uZSkgPT4ge1xuXG4gICAgICAgIGlmIChyZXEucXVlcnkucGFycmFpbl9pZCAhPSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgIHJlcS5zZXNzaW9uLnBhcnJhaW5faWQgPSByZXEucXVlcnkucGFycmFpbl9pZDtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChyZXEuaXNBdXRoZW50aWNhdGVkKCkgJiYgcmVxLnNlc3Npb24ucGFycmFpbl9pZCAhPSB1bmRlZmluZWQgJiYgcmVxLnVzZXIucGFycmFpbiA9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgIHJlcS51c2VyLnBhcnJhaW4gPSBhd2FpdCBVc2VyLmZpbmRPbmUoe3doZXJlOiB7cGFycmFpbmFnZV9pZDogcmVxLnNlc3Npb24ucGFycmFpbl9pZH19KTtcbiAgICAgICAgICAgIGF3YWl0IHJlcS51c2VyLnNhdmUoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGRvbmUoKTtcblxuICAgIH0pOyovXG5cbiAgICAvL1N0cmVhbVF1ZXVlXG4gICAgLyogYXN5bmMgZnVuY3Rpb24gdXBkYXRlKCkge1xuICAgICAgICAgYXdhaXQgdXBkYXRlU3RyZWFtUXVldWUoKS5jYXRjaChyZWFzb24gPT4ge1xuICAgICAgICAgICAgIGNvbnNvbGUubG9nKHJlYXNvbik7XG4gICAgICAgICB9KTtcbiAgICAgICAgIHNldFRpbWVvdXQodXBkYXRlLCAxMDAwKTtcbiAgICAgfVxuXG4gICAgIHVwZGF0ZSgpLmNhdGNoKHJlYXNvbiA9PiBjb25zb2xlLmxvZyhyZWFzb24pKTsqL1xuICAgIC8qYXBwLnVzZShhc3luYyAocmVxLCByZXM6IEV4cHJlc3MuUmVzcG9uc2UsIGRvbmUpID0+IHtcbiAgICAgICAgYXdhaXQgdXBkYXRlU3RyZWFtUXVldWUoKTtcbiAgICAgICAgZG9uZSgpO1xuICAgIH0pOyovXG5cbiAgICAvL1JvdXRlc1xuICAgIGFwcC51c2UoJy8nLCBpbmRleFJvdXRlcik7XG4gICAgYXBwLnVzZSgnL2Nhc2UnLCBjYXNlUm91dGVyKTtcbiAgICBhcHAudXNlKCcvcGFycmFpbmFnZScsIHBhcnJhaW5hZ2VSb3V0ZXIpO1xuICAgIGFwcC51c2UoJy9naXZlYXdheScsIGdpdmVhd2F5Um91dGVyKTtcbiAgICBhcHAudXNlKCcvY291cG9uJywgY291cG9uUm91dGVyKTtcbiAgICBhcHAudXNlKCcvcG9pbnRzJywgcG9pbnRzUm91dGVyKTtcbiAgICBhcHAudXNlKCcvd2F0Y2gnLCB3YXRjaFJvdXRlcik7XG4gICAgYXBwLnVzZSgnL3Nob3AnLCBzaG9wUm91dGVyKTtcbiAgICBhcHAudXNlKCcvc3R1ZmZzaG9wJywgc3R1ZmZzaG9wUm91dGVyKTtcbiAgICBhcHAudXNlKCcvYWRtaW4nLCBhZG1pblJvdXRlcik7XG4gICAgYXBwLnVzZSgnL29sZHNob3AnLCBvbGRzaG9wUm91dGVyKTtcblxuICAgIGFwcC5nZXQoXCIvYXV0aC90d2l0Y2hcIiwgcGFzc3BvcnQuYXV0aGVudGljYXRlKFwidHdpdGNoXCIpKTtcbiAgICBhcHAuZ2V0KFwiL2F1dGgvdHdpdGNoL2NhbGxiYWNrXCIsIHBhc3Nwb3J0LmF1dGhlbnRpY2F0ZShcInR3aXRjaFwiLCB7ZmFpbHVyZVJlZGlyZWN0OiBcIi9cIn0pLCBmdW5jdGlvbiAocmVxLCByZXMpIHtcbiAgICAgICAgcmVzLnJlZGlyZWN0KFwiL1wiKTtcbiAgICB9KTtcblxuXG4gICAgLy9TeW5jIGNhc2VzXG4gICAgYXdhaXQgc3luY0Nhc2VzKGNhc2VzQ29udGVudCk7XG4gICAgYXdhaXQgc3luY1Byb2R1Y3RzKCk7XG5cbn0pLmNhdGNoKGVycm9yID0+IGNvbnNvbGUubG9nKGVycm9yKSk7XG5cbm1vZHVsZS5leHBvcnRzID0gYXBwO1xuIl19