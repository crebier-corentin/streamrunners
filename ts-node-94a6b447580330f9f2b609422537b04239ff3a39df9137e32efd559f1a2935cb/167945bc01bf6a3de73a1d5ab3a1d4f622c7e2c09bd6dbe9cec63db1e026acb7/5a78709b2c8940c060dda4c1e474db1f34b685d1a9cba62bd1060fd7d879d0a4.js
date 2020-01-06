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
    app.get("/auth/twitch", passport.authenticate("twitch"));
    app.get("/auth/twitch/callback", passport.authenticate("twitch", { failureRedirect: "/" }), function (req, res) {
        res.redirect("/");
    });
    //Sync cases
    yield Case_1.syncCases(CaseContent_1.casesContent);
    yield Product_1.syncProducts();
})).catch(error => console.log(error));
module.exports = app;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiL1N0cmVhbVJ1bm5lcnMvVHdpdGNoVmlldy9hcHAudHMiLCJzb3VyY2VzIjpbIi9TdHJlYW1SdW5uZXJzL1R3aXRjaFZpZXcvYXBwLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7O0FBQUEsNEJBQTBCO0FBQzFCLHFDQUF5QztBQUN6QyxpREFBNEM7QUFHNUMsaURBQWlEO0FBQ2pELHFEQUFpRDtBQUVqRCw0QkFBMEI7QUFFMUIsdURBQWdFO0FBRWhFLE1BQU0sTUFBTSxHQUFHLE9BQU8sQ0FBQyxRQUFRLENBQUMsQ0FBQztBQUVqQyxNQUFNLE9BQU8sR0FBRyxPQUFPLENBQUMsU0FBUyxDQUFDLENBQUM7QUFDbkMsTUFBTSxJQUFJLEdBQUcsT0FBTyxDQUFDLE1BQU0sQ0FBQyxDQUFDO0FBQzdCLE1BQU0sWUFBWSxHQUFHLE9BQU8sQ0FBQyxlQUFlLENBQUMsQ0FBQztBQUM5QyxNQUFNLGFBQWEsR0FBRyxPQUFPLENBQUMsZ0JBQWdCLENBQUMsQ0FBQztBQUNoRCxNQUFNLE1BQU0sR0FBRyxPQUFPLENBQUMsUUFBUSxDQUFDLENBQUM7QUFDakMsTUFBTSxlQUFlLEdBQUcsT0FBTyxDQUFDLGtCQUFrQixDQUFDLENBQUM7QUFDcEQsTUFBTSxRQUFRLEdBQUcsT0FBTyxDQUFDLFVBQVUsQ0FBQyxDQUFDO0FBQ3JDLE1BQU0sY0FBYyxHQUFHLE9BQU8sQ0FBQyxxQkFBcUIsQ0FBQyxDQUFDLFFBQVEsQ0FBQztBQUMvRCxNQUFNLFdBQVcsR0FBRyxPQUFPLENBQUMsYUFBYSxDQUFDLENBQUM7QUFDM0MsTUFBTSxNQUFNLEdBQUcsT0FBTyxDQUFDLFFBQVEsQ0FBQyxDQUFDO0FBQ2pDLE1BQU0sT0FBTyxHQUFHLE9BQU8sQ0FBQyxZQUFZLENBQUMsQ0FBQztBQUN0QyxNQUFNLEVBQUUsR0FBRyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUM7QUFDekIsTUFBTSxNQUFNLEdBQUcsT0FBTyxDQUFDLGVBQWUsQ0FBQyxDQUFDO0FBQ3hDLElBQUksRUFB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T0FBTyxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDO0FBRXRDLE1BQU0sQ0FBQyxPQUFPLEdBQUcsR0FBRyxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IFwicmVmbGVjdC1tZXRhZGF0YVwiO1xuaW1wb3J0IHtjcmVhdGVDb25uZWN0aW9ufSBmcm9tIFwidHlwZW9ybVwiO1xuaW1wb3J0IHtVc2VyfSBmcm9tIFwiLi9kYXRhYmFzZS9lbnRpdHkvVXNlclwiO1xuaW1wb3J0IHt1cGRhdGVTdHJlYW1RdWV1ZX0gZnJvbSBcIi4vZGF0YWJhc2UvZW50aXR5L1N0cmVhbVF1ZXVlXCI7XG5pbXBvcnQge3N5bmN9IGZyb20gXCJnbG9iXCI7XG5pbXBvcnQge3N5bmNDYXNlc30gZnJvbSBcIi4vZGF0YWJhc2UvZW50aXR5L0Nhc2VcIjtcbmltcG9ydCB7Y2FzZXNDb250ZW50fSBmcm9tIFwiLi9vdGhlci9DYXNlQ29udGVudFwiO1xuXG5pbXBvcnQgXCJyZWZsZWN0LW1ldGFkYXRhXCI7XG5pbXBvcnQgKiBhcyBjaGlsZF9wcm9jZXNzIGZyb20gXCJjaGlsZF9wcm9jZXNzXCI7XG5pbXBvcnQge1Byb2R1Y3QsIHN5bmNQcm9kdWN0c30gZnJvbSBcIi4vZGF0YWJhc2UvZW50aXR5L1Byb2R1Y3RcIjtcblxuY29uc3QgbW9tZW50ID0gcmVxdWlyZShcIm1vbWVudFwiKTtcblxuY29uc3QgZXhwcmVzcyA9IHJlcXVpcmUoJ2V4cHJlc3MnKTtcbmNvbnN0IHBhdGggPSByZXF1aXJlKCdwYXRoJyk7XG5jb25zdCBjb29raWVQYXJzZXIgPSByZXF1aXJlKCdjb29raWUtcGFyc2VyJyk7XG5jb25zdCBjb29raWVTZXNzaW9uID0gcmVxdWlyZSgnY29va2llLXNlc3Npb24nKTtcbmNvbnN0IGxvZ2dlciA9IHJlcXVpcmUoJ21vcmdhbicpO1xuY29uc3QgZXhwcmVzc051bmp1Y2tzID0gcmVxdWlyZSgnZXhwcmVzcy1udW5qdWNrcycpO1xuY29uc3QgcGFzc3BvcnQgPSByZXF1aXJlKCdwYXNzcG9ydCcpO1xuY29uc3QgdHdpdGNoU3RyYXRlZ3kgPSByZXF1aXJlKFwicGFzc3BvcnQtdHdpdGNoLW5ld1wiKS5TdHJhdGVneTtcbmNvbnN0IGNvbXByZXNzaW9uID0gcmVxdWlyZSgnY29tcHJlc3Npb24nKTtcbmNvbnN0IGhlbG1ldCA9IHJlcXVpcmUoJ2hlbG1ldCcpO1xuY29uc3QgRGlzY29yZCA9IHJlcXVpcmUoXCJkaXNjb3JkLmpzXCIpO1xuY29uc3QgZnMgPSByZXF1aXJlKFwiZnNcIik7XG5jb25zdCBjb25maWcgPSByZXF1aXJlKCcuL2NvbmZpZy5qc29uJyk7XG5sZXQgZGIgPSBKU09OLnBhcnNlKGZzLnJlYWRGaWxlU3luYyhcIi4vZGF0YWJhc2UuanNvblwiLCBcInV0ZjhcIikpO1xuXG4vLy5lbnZcbnJlcXVpcmUoXCJkb3RlbnZcIikuY29uZmlnKCk7XG5cbi8vTG9hZCByb3V0ZXNcbnZhciBpbmRleFJvdXRlciA9IHJlcXVpcmUoJy4vcm91dGVzL2luZGV4Jyk7XG52YXIgY2FzZVJvdXRlciA9IHJlcXVpcmUoJy4vcm91dGVzL2Nhc2UnKTtcbnZhciBzaG9wUm91dGVyID0gcmVxdWlyZSgnLi9yb3V0ZXMvc2hvcCcpO1xudmFyIHBhcnJhaW5hZ2VSb3V0ZXIgPSByZXF1aXJlKCcuL3JvdXRlcy9wYXJyYWluYWdlJyk7XG52YXIgZ2l2ZWF3YXlSb3V0ZXIgPSByZXF1aXJlKCcuL3JvdXRlcy9naXZlYXdheScpO1xudmFyIGNvdXBvblJvdXRlciA9IHJlcXVpcmUoJy4vcm91dGVzL2NvdXBvbicpO1xudmFyIHBvaW50c1JvdXRlciA9IHJlcXVpcmUoJy4vcm91dGVzL3BvaW50cycpO1xudmFyIHdhdGNoUm91dGVyID0gcmVxdWlyZSgnLi9yb3V0ZXMvd2F0Y2gnKTtcbnZhciBzaG9wUm91dGVyID0gcmVxdWlyZSgnLi9yb3V0ZXMvc2hvcCcpO1xudmFyIHN0dWZmc2hvcFJvdXRlciA9IHJlcXVpcmUoJy4vcm91dGVzL3N0dWZmc2hvcCcpO1xudmFyIGFkbWluUm91dGVyID0gcmVxdWlyZSgnLi9yb3V0ZXMvYWRtaW4nKTtcbnZhciBvbGRzaG9wUm91dGVyID0gcmVxdWlyZSgnLi9yb3V0ZXMvb2xkc2hvcCcpO1xuXG4vL0FwcFxudmFyIGFwcCA9IGV4cHJlc3MoKTtcblxuZ2xvYmFsWydkaXNjb3JkQW50aVNwYW1EYXRlJ10gPSBtb21lbnQoKS5zdWJ0cmFjdChcIjIwXCIsIFwiaG91cnNcIik7XG5cbi8vREJcbmNyZWF0ZUNvbm5lY3Rpb24oKS50aGVuKGFzeW5jICgpID0+IHtcblxuICAgIGNvbnN0IGlzRGV2ID0gYXBwLmdldCgnZW52JykgPT09ICdkZXZlbG9wbWVudCc7XG5cbiAgICAvL051bmp1Y2tzXG4gICAgYXBwLnNldCgndmlld3MnLCBfX2Rpcm5hbWUgKyAnL3ZpZXdzJyk7XG4gICAgYXBwLnNldChcInZpZXcgZW5naW5lXCIsIFwibnVualwiKTtcbiAgICBjb25zdCBuamsgPSBleHByZXNzTnVuanVja3MoYXBwLCB7XG4gICAgICAgIHdhdGNoOiBpc0RldixcbiAgICAgICAgbm9DYWNoZTogaXNEZXYsXG4gICAgICAgIGdsb2JhbHM6IHtcbiAgICAgICAgICAgIEhPU1ROQU1FOiBwcm9jZXNzLmVudi5IT1NUTkFNRVxuICAgICAgICB9XG4gICAgfSk7XG5cbiAgICAvL0Rpc2NvcmRcbiAgICBjb25zdCBjbGllbnQgPSBuZXcgRGlzY29yZC5DbGllbnQoKTtcbiAgICBhd2FpdCBjbGllbnQubG9naW4ocHJvY2Vzcy5lbnYuRElTQ09SRF9UT0tFTik7XG4gICAgY2xpZW50LnVzZXIuc2V0QWN0aXZpdHkoXCJodHRwczovL3N0cmVhbXJ1bm5lcnMuZnJcIiwge3R5cGU6IFwiV0FUQ0hJTkdcIn0pO1xuICAgIGFwcC51c2UoKHJlcSwgcmVzLCBuZXh0KSA9PiB7XG4gICAgICAgIHJlcS5kaXNjb3JkID0gY2xpZW50O1xuICAgICAgICBuZXh0KCk7XG4gICAgfSk7XG5cbiAgICAvL3BpbmdcbiAgICBjbGllbnQub24oJ21lc3NhZ2UnLCBtZXNzYWdlID0+IHtcbiAgICBpZihtZXNzYWdlLmNvbnRlbnQuc3RhcnRzV2l0aChcIiFwaW5nXCIpKSB7XG4gICAgICAgICAgICBtZXNzYWdlLmNoYW5uZWwuc2VuZChcbiAgICAgICAgICAgIFx0e1xuXHRcdFx0XHQgIFwiZW1iZWRcIjoge1xuXHRcdFx0XHQgICAgXCJ0aXRsZVwiOiBcIlBpbmdcIixcblx0XHRcdFx0ICAgIFwidXJsXCI6IFwiaHR0cHM6Ly9zdHJlYW1ydW5uZXJzLmZyXCIsXG5cdFx0XHRcdCAgICBcImNvbG9yXCI6IDMwNjY5OTMsXG5cdFx0XHRcdCAgICBcInRpbWVzdGFtcFwiOiBtZXNzYWdlLmNyZWF0ZWRBdCxcblx0XHRcdFx0ICAgIFwiZm9vdGVyXCI6IHtcblx0XHRcdFx0ICAgICAgXCJpY29uX3VybFwiOiBcImh0dHBzOi8vc3RyZWFtcnVubmVycy5mci9pbWcvbG9nb3NxdWFyZS5wbmdcIixcblx0XHRcdFx0ICAgICAgXCJ0ZXh0XCI6IFwiU3RyZWFtUnVubmVyc1wiXG5cdFx0XHRcdCAgICB9LFxuXHRcdFx0XHQgICAgXCJ0aHVtYm5haWxcIjoge1xuXHRcdFx0XHQgICAgICBcInVybFwiOiBcImh0dHBzOi8vc3RyZWFtcnVubmVycy5mci9pbWcvbG9nb3NxdWFyZS5wbmdcIlxuXHRcdFx0XHQgICAgfSxcblx0XHRcdFx0ICAgIFwiYXV0aG9yXCI6IHtcblx0XHRcdFx0ICAgICAgXCJuYW1lXCI6IFwiQm90IGRlIFN0cmVhbVJ1bm5lcnMuZnJcIixcblx0XHRcdFx0ICAgICAgXCJ1cmxcIjogXCJodHRwczovL2Rpc2NvcmRhcHAuY29tXCIsXG5cdFx0XHRcdCAgICAgIFwiaWNvbl91cmxcIjogXCJodHRwczovL3N0cmVhbXJ1bm5lcnMuZnIvaW1nL2xvZ29zcXVhcmUucG5nXCJcblx0XHRcdFx0ICAgIH0sXG5cdFx0XHRcdCAgICBcImZpZWxkc1wiOiBbXG5cdFx0XHRcdCAgICAgIHtcblx0XHRcdFx0ICAgICAgICBcIm5hbWVcIjogXCJQaW5nXCIsXG5cdFx0XHRcdCAgICAgICAgXCJ2YWx1ZVwiOiBuZXcgRGF0ZSgpLmdldFRpbWUoKSAtIG1lc3NhZ2UuY3JlYXRlZFRpbWVzdGFtcCArIFwiIG1zIPCfkpNcIlxuXHRcdFx0XHQgICAgICB9XG5cdFx0XHRcdCAgICBdXG5cdFx0XHRcdCAgfVxuXHRcdFx0XHR9KTsgICAgICAgIFxuICAgIH1cblx0fSk7XG5cblx0Ly9OaXZlYXVcblxuXHRjbGllbnQub24oXCJtZXNzYWdlXCIsIG1lc3NhZ2UgPT4ge1xuICAgIGlmIChtZXNzYWdlLmF1dGhvci5ib3QpIHJldHVybjsgLy8gaWdub3JlIGJvdHNcblxuICAgIC8vIGlmIHRoZSB1c2VyIGlzIG5vdCBvbiBkYiBhZGQgdGhlIHVzZXIgYW5kIGNoYW5nZSBoaXMgdmFsdWVzIHRvIDBcbiAgICBpZiAoIWRiW21lc3NhZ2UuYXV0aG9yLmlkXSkgZGJbbWVzc2FnZS5hdXRob3IuaWRdID0ge1xuICAgICAgICB4cDogMCxcbiAgICAgICAgbGV2ZWw6IDBcbiAgICAgIH07XG4gICAgZGJbbWVzc2FnZS5hdXRob3IuaWRdLnhwKys7XG4gICAgbGV0IHVzZXJJbmZvID0gZGJbbWVzc2FnZS5hdXRob3IuaWRdO1xuICAgIGlmKHVzZXJJbmZvLnhwID4gMTAwKSB7XG4gICAgICAgIHVzZXJJbmZvLmxldmVsKytcbiAgICAgICAgdXNlckluZm8ueHAgPSAwXG4gICAgICAgIG1lc3NhZ2UucmVwbHkoXCJCcmF2bywgdHUgbW9udGVzIGRlIG5pdmVhdSAhXCIpXG4gICAgfVxuICAgIGNvbnN0IGFyZ3MgPSBtZXNzYWdlLmNvbnRlbnQuc2xpY2UoY29uZmlnLnByZWZpeC5sZW5ndGgpLnRyaW0oKS5zcGxpdCgvICsvZyk7XG4gICAgY29uc3QgY21kID0gYXJncy5zaGlmdCgpLnRvTG93ZXJDYXNlKCk7XG4gICAgaWYoY21kID09PSBcIm5pdmVhdVwiKSB7XG4gICAgICAgIGxldCB1c2VySW5mbyA9IGRiW21lc3NhZ2UuYXV0aG9yLmlkXTtcbiAgICAgICAgbGV0IG1lbWJlciA9IG1lc3NhZ2UubWVudGlvbnMubWVtYmVycy5maXJzdCgpO1xuICAgICAgICBsZXQgZW1iZWQgPSBuZXcgRGlzY29yZC5SaWNoRW1iZWQoKVxuICAgICAgICAuc2V0Q29sb3IoMHg0Mjg2ZjQpXG4gICAgICAgIC5hZGRGaWVsZChcIk5pdmVhdVwiLCB1c2VySW5mby5sZXZlbClcbiAgICAgICAgLmFkZEZpZWxkKFwiWFBcIiwgdXNlckluZm8ueHArXCIvMTAwXCIpO1xuICAgICAgICBpZighbWVtYmVyKSByZXR1cm4gbWVzc2FnZS5jaGFubmVsLnNlbmRFbWJlZChlbWJlZClcbiAgICAgICAgbGV0IG1lbWJlckluZm8gPSBkYlttZW1iZXIuaWRdXG4gICAgICAgIGxldCBlbWJlZDIgPSBuZXcgRGlzY29yZC5SaWNoRW1iZWQoKVxuICAgICAgICAuc2V0Q29sb3IoMHg0Mjg2ZjQpXG4gICAgICAgIC5hZGRGaWVsZChcIk5pdmVhdVwiLCBtZW1iZXJJbmZvLmxldmVsKVxuICAgICAgICAuYWRkRmllbGQoXCJYUFwiLCBtZW1iZXJJbmZvLnhwK1wiLzEwMFwiKVxuICAgICAgICBtZXNzYWdlLmNoYW5uZWwuc2VuZEVtYmVkKGVtYmVkMilcbiAgICB9XG4gICAgZnMud3JpdGVGaWxlKFwiLi9kYXRhYmFzZS5qc29uXCIsIEpTT04uc3RyaW5naWZ5KGRiKSwgKHgpID0+IHtcbiAgICAgICAgaWYgKHgpIGNvbnNvbGUuZXJyb3IoeClcbiAgICAgIH0pO1xufSlcblxuICAgIC8vTGVhZGVyYm9hcmRcbiAgICBjbGllbnQub24oXCJtZXNzYWdlXCIsIGFzeW5jIG1zZyA9PiB7XG4gICAgICAgIGlmICghbXNnLmF1dGhvci5ib3QgJiYgbXNnLmNvbnRlbnQgPT09IFwiIWxlYWRlcmJvYXJkcG9pbnRzXCIpIHtcblxuICAgICAgICAgICAgLy9Nb3N0IHBvaW50c1xuICAgICAgICAgICAgY29uc3QgbW9zdFBvaW50cyA9IGF3YWl0IFVzZXIubW9zdFBvaW50cygpO1xuXG4gICAgICAgICAgICBsZXQgcG9pbnRzUmVzcG9uc2UgPSBcIlBvaW50c2BgYFwiO1xuICAgICAgICAgICAgbGV0IHBsYWNlbWVudCA9IDA7XG4gICAgICAgICAgICBmb3IgKGNvbnN0IHVzZXIgb2YgbW9zdFBvaW50cykge1xuICAgICAgICAgICAgICAgIHBvaW50c1Jlc3BvbnNlICs9IGAkeysrcGxhY2VtZW50fSMgJHt1c2VyLmRpc3BsYXlfbmFtZX1cXG5cXHQke3VzZXIucG9pbnRzfVxcbmBcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHBvaW50c1Jlc3BvbnNlICs9IFwiYGBgXCI7XG5cbiAgICAgICAgICAgIC8vTW9zdCBwbGFjZVxuICAgICAgICAgICAgY29uc3QgbW9zdFBsYWNlID0gYXdhaXQgVXNlci5tb3N0UGxhY2UoKTtcblxuICAgICAgICAgICAgbGV0IHBsYWNlUmVzcG9uc2UgPSBcIlNlY29uZGUgc3RyZWFtw6lgYGBcIjtcbiAgICAgICAgICAgIHBsYWNlbWVudCA9IDA7XG4gICAgICAgICAgICBmb3IgKGNvbnN0IHVzZXIgb2YgbW9zdFBsYWNlKSB7XG4gICAgICAgICAgICAgICAgcGxhY2VSZXNwb25zZSArPSBgJHsrK3BsYWNlbWVudH0jICR7dXNlci5kaXNwbGF5X25hbWV9XFxuXFx0JHt1c2VyLnRpbWV9XFxuYFxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcGxhY2VSZXNwb25zZSArPSBcImBgYFwiO1xuXG5cbiAgICAgICAgICAgIGF3YWl0IG1zZy5jaGFubmVsLnNlbmQocG9pbnRzUmVzcG9uc2UpO1xuICAgICAgICAgICAgYXdhaXQgbXNnLmNoYW5uZWwuc2VuZChwbGFjZVJlc3BvbnNlKTtcblxuICAgICAgICB9XG4gICAgfSk7XG5cblxuICAgIC8vTWFpbnRlbmFuY2VcbiAgICBpZiAocHJvY2Vzcy5lbnYuTUFJTlRFTkFOQ0U/LnRvTG93ZXJDYXNlKCkgPT09IFwidHJ1ZVwiKSB7XG4gICAgICAgIGFwcC51c2UoXCIqXCIsIChyZXEsIHJlcykgPT4ge1xuICAgICAgICAgICAgcmV0dXJuIHJlcy5yZW5kZXIoXCJtYWludGVuYW5jZVwiKTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgYXBwLnVzZShsb2dnZXIoJ2RldicpKTtcbiAgICBhcHAudXNlKGV4cHJlc3MuanNvbigpKTtcbiAgICBhcHAudXNlKGV4cHJlc3MudXJsZW5jb2RlZCh7ZXh0ZW5kZWQ6IGZhbHNlfSkpO1xuICAgIGFwcC51c2UoY29va2llUGFyc2VyKCkpO1xuXG5cbiAgICBhcHAudXNlKGNvbXByZXNzaW9uKCkpO1xuICAgIGFwcC51c2UoaGVsbWV0KCkpO1xuXG4gICAgYXBwLnVzZShleHByZXNzLnN0YXRpYyhwYXRoLmpvaW4oX19kaXJuYW1lLCAncHVibGljJykpKTtcblxuICAgIGFwcC51c2UoY29va2llU2Vzc2lvbih7a2V5czogW3Byb2Nlc3MuZW52LkNPT0tJRV9LRVldfSkpOyAvLyBFeHByZXNzIGNvb2tpZSBzZXNzaW9uIG1pZGRsZXdhcmVcblxuICAgIC8vUGFzc3BvcnRcbiAgICBwYXNzcG9ydC51c2UobmV3IHR3aXRjaFN0cmF0ZWd5KHtcbiAgICAgICAgICAgIGNsaWVudElEOiBwcm9jZXNzLmVudi5UV0lUQ0hfQ0xJRU5UX0lELFxuICAgICAgICAgICAgY2xpZW50U2VjcmV0OiBwcm9jZXNzLmVudi5UV0lUQ0hfQ0xJRU5UX1NFQ1JFVCxcbiAgICAgICAgICAgIGNhbGxiYWNrVVJMOiBwcm9jZXNzLmVudi5IT1NUTkFNRSArIFwiL2F1dGgvdHdpdGNoL2NhbGxiYWNrXCIsXG4gICAgICAgICAgICBzY29wZTogXCJ1c2VyX3JlYWRcIlxuICAgICAgICB9LFxuICAgICAgICBhc3luYyBmdW5jdGlvbiAoYWNjZXNzVG9rZW4sIHJlZnJlc2hUb2tlbiwgcHJvZmlsZSwgZG9uZSkge1xuXG4gICAgICAgICAgICAvL0ZpbmQgb3IgY3JlYXRlXG4gICAgICAgICAgICBsZXQgdXNlcnMgPSBhd2FpdCBVc2VyLmZpbmQoe3R3aXRjaElkOiBwcm9maWxlLmlkfSk7XG5cbiAgICAgICAgICAgIGlmICh1c2Vycy5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICAgICAgLy9NZXQgw6Agam91clxuICAgICAgICAgICAgICAgIGxldCB1c2VyID0gdXNlcnNbMF07XG5cbiAgICAgICAgICAgICAgICB1c2VyLnVzZXJuYW1lID0gcHJvZmlsZS5sb2dpbjtcbiAgICAgICAgICAgICAgICB1c2VyLmRpc3BsYXlfbmFtZSA9IHByb2ZpbGUuZGlzcGxheV9uYW1lO1xuICAgICAgICAgICAgICAgIHVzZXIuYXZhdGFyID0gcHJvZmlsZS5wcm9maWxlX2ltYWdlX3VybDtcblxuICAgICAgICAgICAgICAgIGF3YWl0IHVzZXIuc2F2ZSgpO1xuXG4gICAgICAgICAgICAgICAgZG9uZShudWxsLCB1c2VyKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIGxldCBuZXdVc2VyID0gbmV3IFVzZXIoKTtcblxuICAgICAgICAgICAgICAgIG5ld1VzZXIudHdpdGNoSWQgPSBwcm9maWxlLmlkO1xuICAgICAgICAgICAgICAgIG5ld1VzZXIudXNlcm5hbWUgPSBwcm9maWxlLmxvZ2luO1xuICAgICAgICAgICAgICAgIG5ld1VzZXIuZGlzcGxheV9uYW1lID0gcHJvZmlsZS5kaXNwbGF5X25hbWU7XG4gICAgICAgICAgICAgICAgbmV3VXNlci5hdmF0YXIgPSBwcm9maWxlLnByb2ZpbGVfaW1hZ2VfdXJsO1xuXG4gICAgICAgICAgICAgICAgYXdhaXQgbmV3VXNlci5zYXZlKCk7XG5cbiAgICAgICAgICAgICAgICBkb25lKG51bGwsIG5ld1VzZXIpO1xuXG4gICAgICAgICAgICB9XG5cbiAgICAgICAgfSkpO1xuICAgIHBhc3Nwb3J0LnNlcmlhbGl6ZVVzZXIoZnVuY3Rpb24gKHVzZXIsIGRvbmUpIHtcbiAgICAgICAgZG9uZShudWxsLCB1c2VyLnR3aXRjaElkKTtcbiAgICB9KTtcbiAgICBwYXNzcG9ydC5kZXNlcmlhbGl6ZVVzZXIoZnVuY3Rpb24gKHR3aXRjaElkLCBkb25lKSB7XG4gICAgICAgIFVzZXIuZmluZE9uZSh7dHdpdGNoSWQ6IHR3aXRjaElkfSkudGhlbigodXNlcikgPT4ge1xuICAgICAgICAgICAgbGV0IHJlYWxVc2VyID0gdXNlciA9PSB1bmRlZmluZWQgPyBmYWxzZSA6IHVzZXI7XG4gICAgICAgICAgICBkb25lKG51bGwsIHJlYWxVc2VyKTtcbiAgICAgICAgfSk7XG4gICAgfSk7XG5cbiAgICBhcHAudXNlKHBhc3Nwb3J0LmluaXRpYWxpemUoKSk7ICAgLy8gcGFzc3BvcnQgaW5pdGlhbGl6ZSBtaWRkbGV3YXJlXG4gICAgYXBwLnVzZShwYXNzcG9ydC5zZXNzaW9uKCkpOyAgICAgIC8vIHBhc3Nwb3J0IHNlc3Npb24gbWlkZGxld2FyZVxuXG4gICAgLy9QYXJyYWluYWdlXG4gICAgLyphcHAudXNlKGFzeW5jIChyZXEsIHJlczogRXhwcmVzcy5SZXNwb25zZSwgZG9uZSkgPT4ge1xuXG4gICAgICAgIGlmIChyZXEucXVlcnkucGFycmFpbl9pZCAhPSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgIHJlcS5zZXNzaW9uLnBhcnJhaW5faWQgPSByZXEucXVlcnkucGFycmFpbl9pZDtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChyZXEuaXNBdXRoZW50aWNhdGVkKCkgJiYgcmVxLnNlc3Npb24ucGFycmFpbl9pZCAhPSB1bmRlZmluZWQgJiYgcmVxLnVzZXIucGFycmFpbiA9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgIHJlcS51c2VyLnBhcnJhaW4gPSBhd2FpdCBVc2VyLmZpbmRPbmUoe3doZXJlOiB7cGFycmFpbmFnZV9pZDogcmVxLnNlc3Npb24ucGFycmFpbl9pZH19KTtcbiAgICAgICAgICAgIGF3YWl0IHJlcS51c2VyLnNhdmUoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGRvbmUoKTtcblxuICAgIH0pOyovXG5cbiAgICAvL1N0cmVhbVF1ZXVlXG4gICAgLyogYXN5bmMgZnVuY3Rpb24gdXBkYXRlKCkge1xuICAgICAgICAgYXdhaXQgdXBkYXRlU3RyZWFtUXVldWUoKS5jYXRjaChyZWFzb24gPT4ge1xuICAgICAgICAgICAgIGNvbnNvbGUubG9nKHJlYXNvbik7XG4gICAgICAgICB9KTtcbiAgICAgICAgIHNldFRpbWVvdXQodXBkYXRlLCAxMDAwKTtcbiAgICAgfVxuXG4gICAgIHVwZGF0ZSgpLmNhdGNoKHJlYXNvbiA9PiBjb25zb2xlLmxvZyhyZWFzb24pKTsqL1xuICAgIC8qYXBwLnVzZShhc3luYyAocmVxLCByZXM6IEV4cHJlc3MuUmVzcG9uc2UsIGRvbmUpID0+IHtcbiAgICAgICAgYXdhaXQgdXBkYXRlU3RyZWFtUXVldWUoKTtcbiAgICAgICAgZG9uZSgpO1xuICAgIH0pOyovXG5cbiAgICAvL1JvdXRlc1xuICAgIGFwcC51c2UoJy8nLCBpbmRleFJvdXRlcik7XG4gICAgYXBwLnVzZSgnL2Nhc2UnLCBjYXNlUm91dGVyKTtcbiAgICBhcHAudXNlKCcvcGFycmFpbmFnZScsIHBhcnJhaW5hZ2VSb3V0ZXIpO1xuICAgIGFwcC51c2UoJy9naXZlYXdheScsIGdpdmVhd2F5Um91dGVyKTtcbiAgICBhcHAudXNlKCcvY291cG9uJywgY291cG9uUm91dGVyKTtcbiAgICBhcHAudXNlKCcvcG9pbnRzJywgcG9pbnRzUm91dGVyKTtcbiAgICBhcHAudXNlKCcvd2F0Y2gnLCB3YXRjaFJvdXRlcik7XG4gICAgYXBwLnVzZSgnL3Nob3AnLCBzaG9wUm91dGVyKTtcbiAgICBhcHAudXNlKCcvc3R1ZmZzaG9wJywgc3R1ZmZzaG9wUm91dGVyKTtcbiAgICBhcHAudXNlKCcvYWRtaW4nLCBhZG1pblJvdXRlcik7XG5cbiAgICBhcHAuZ2V0KFwiL2F1dGgvdHdpdGNoXCIsIHBhc3Nwb3J0LmF1dGhlbnRpY2F0ZShcInR3aXRjaFwiKSk7XG4gICAgYXBwLmdldChcIi9hdXRoL3R3aXRjaC9jYWxsYmFja1wiLCBwYXNzcG9ydC5hdXRoZW50aWNhdGUoXCJ0d2l0Y2hcIiwge2ZhaWx1cmVSZWRpcmVjdDogXCIvXCJ9KSwgZnVuY3Rpb24gKHJlcSwgcmVzKSB7XG4gICAgICAgIHJlcy5yZWRpcmVjdChcIi9cIik7XG4gICAgfSk7XG5cblxuICAgIC8vU3luYyBjYXNlc1xuICAgIGF3YWl0IHN5bmNDYXNlcyhjYXNlc0NvbnRlbnQpO1xuICAgIGF3YWl0IHN5bmNQcm9kdWN0cygpO1xuXG59KS5jYXRjaChlcnJvciA9PiBjb25zb2xlLmxvZyhlcnJvcikpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGFwcDtcbiJdfQ==