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
                            "value": new Date().getTime() - message.createdTimestamp + " ms"
                        }
                    ]
                }
            });
        }
    });
    //Leaderboard
    client.on("message", (msg) => __awaiter(void 0, void 0, void 0, function* () {
        if (!msg.author.bot && msg.content === "!leaderboard") {
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiL1N0cmVhbVJ1bm5lcnMvVHdpdGNoVmlldy9hcHAudHMiLCJzb3VyY2VzIjpbIi9TdHJlYW1SdW5uZXJzL1R3aXRjaFZpZXcvYXBwLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7O0FBQUEsNEJBQTBCO0FBQzFCLHFDQUF5QztBQUN6QyxpREFBNEM7QUFHNUMsaURBQWlEO0FBQ2pELHFEQUFpRDtBQUVqRCw0QkFBMEI7QUFFMUIsdURBQWdFO0FBRWhFLE1BQU0sTUFBTSxHQUFHLE9BQU8sQ0FBQyxRQUFRLENBQUMsQ0FBQztBQUVqQyxNQUFNLE9BQU8sR0FBRyxPQUFPLENBQUMsU0FBUyxDQUFDLENBQUM7QUFDbkMsTUFBTSxJQUFJLEdBQUcsT0FBTyxDQUFDLE1BQU0sQ0FBQyxDQUFDO0FBQzdCLE1BQU0sWUFBWSxHQUFHLE9BQU8sQ0FBQyxlQUFlLENBQUMsQ0FBQztBQUM5QyxNQUFNLGFBQWEsR0FBRyxPQUFPLENBQUMsZ0JBQWdCLENBQUMsQ0FBQztBQUNoRCxNQUFNLE1BQU0sR0FBRyxPQUFPLENBQUMsUUFBUSxDQUFDLENBQUM7QUFDakMsTUFBTSxlQUFlLEdBQUcsT0FBTyxDQUFDLGtCQUFrQixDQUFDLENBQUM7QUFDcEQsTUFBTSxRQUFRLEdBQUcsT0FBTyxDQUFDLFVBQVUsQ0FBQyxDQUFDO0FBQ3JDLE1BQU0sY0FBYyxHQUFHLE9BQU8sQ0FBQyxxQkFBcUIsQ0FBQyxDQUFDLFFBQVEsQ0FBQztBQUMvRCxNQUFNLFdBQVcsR0FBRyxPQUFPLENBQUMsYUFBYSxDQUFDLENBQUM7QUFDM0MsTUFBTSxNQUFNLEdBQUcsT0FBTyxDQUFDLFFBQVEsQ0FBQyxDQUFDO0FBQ2pDLE1BQU0sT0FBTyxHQUFHLE9BQU8sQ0FBQyxZQUFZLENBQUMsQ0FBQztBQUV0QyxNQUFNO0FBQ04sT0FBTyxDQUFDLFFBQVEsQ0FBQyxDQUFDLE1BQU0sRUFBRSxDQUFDO0FBRTNCLGFBQWE7QUFDYixJQUFJLFdBQVcsR0FBRyxPQUFPLENBQUMsZ0JBQWdCLENB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XCJyZWZsZWN0LW1ldGFkYXRhXCI7XG5pbXBvcnQge2NyZWF0ZUNvbm5lY3Rpb259IGZyb20gXCJ0eXBlb3JtXCI7XG5pbXBvcnQge1VzZXJ9IGZyb20gXCIuL2RhdGFiYXNlL2VudGl0eS9Vc2VyXCI7XG5pbXBvcnQge3VwZGF0ZVN0cmVhbVF1ZXVlfSBmcm9tIFwiLi9kYXRhYmFzZS9lbnRpdHkvU3RyZWFtUXVldWVcIjtcbmltcG9ydCB7c3luY30gZnJvbSBcImdsb2JcIjtcbmltcG9ydCB7c3luY0Nhc2VzfSBmcm9tIFwiLi9kYXRhYmFzZS9lbnRpdHkvQ2FzZVwiO1xuaW1wb3J0IHtjYXNlc0NvbnRlbnR9IGZyb20gXCIuL290aGVyL0Nhc2VDb250ZW50XCI7XG5cbmltcG9ydCBcInJlZmxlY3QtbWV0YWRhdGFcIjtcbmltcG9ydCAqIGFzIGNoaWxkX3Byb2Nlc3MgZnJvbSBcImNoaWxkX3Byb2Nlc3NcIjtcbmltcG9ydCB7UHJvZHVjdCwgc3luY1Byb2R1Y3RzfSBmcm9tIFwiLi9kYXRhYmFzZS9lbnRpdHkvUHJvZHVjdFwiO1xuXG5jb25zdCBtb21lbnQgPSByZXF1aXJlKFwibW9tZW50XCIpO1xuXG5jb25zdCBleHByZXNzID0gcmVxdWlyZSgnZXhwcmVzcycpO1xuY29uc3QgcGF0aCA9IHJlcXVpcmUoJ3BhdGgnKTtcbmNvbnN0IGNvb2tpZVBhcnNlciA9IHJlcXVpcmUoJ2Nvb2tpZS1wYXJzZXInKTtcbmNvbnN0IGNvb2tpZVNlc3Npb24gPSByZXF1aXJlKCdjb29raWUtc2Vzc2lvbicpO1xuY29uc3QgbG9nZ2VyID0gcmVxdWlyZSgnbW9yZ2FuJyk7XG5jb25zdCBleHByZXNzTnVuanVja3MgPSByZXF1aXJlKCdleHByZXNzLW51bmp1Y2tzJyk7XG5jb25zdCBwYXNzcG9ydCA9IHJlcXVpcmUoJ3Bhc3Nwb3J0Jyk7XG5jb25zdCB0d2l0Y2hTdHJhdGVneSA9IHJlcXVpcmUoXCJwYXNzcG9ydC10d2l0Y2gtbmV3XCIpLlN0cmF0ZWd5O1xuY29uc3QgY29tcHJlc3Npb24gPSByZXF1aXJlKCdjb21wcmVzc2lvbicpO1xuY29uc3QgaGVsbWV0ID0gcmVxdWlyZSgnaGVsbWV0Jyk7XG5jb25zdCBEaXNjb3JkID0gcmVxdWlyZShcImRpc2NvcmQuanNcIik7XG5cbi8vLmVudlxucmVxdWlyZShcImRvdGVudlwiKS5jb25maWcoKTtcblxuLy9Mb2FkIHJvdXRlc1xudmFyIGluZGV4Um91dGVyID0gcmVxdWlyZSgnLi9yb3V0ZXMvaW5kZXgnKTtcbnZhciBjYXNlUm91dGVyID0gcmVxdWlyZSgnLi9yb3V0ZXMvY2FzZScpO1xudmFyIHNob3BSb3V0ZXIgPSByZXF1aXJlKCcuL3JvdXRlcy9zaG9wJyk7XG52YXIgcGFycmFpbmFnZVJvdXRlciA9IHJlcXVpcmUoJy4vcm91dGVzL3BhcnJhaW5hZ2UnKTtcbnZhciBnaXZlYXdheVJvdXRlciA9IHJlcXVpcmUoJy4vcm91dGVzL2dpdmVhd2F5Jyk7XG52YXIgY291cG9uUm91dGVyID0gcmVxdWlyZSgnLi9yb3V0ZXMvY291cG9uJyk7XG52YXIgcG9pbnRzUm91dGVyID0gcmVxdWlyZSgnLi9yb3V0ZXMvcG9pbnRzJyk7XG52YXIgd2F0Y2hSb3V0ZXIgPSByZXF1aXJlKCcuL3JvdXRlcy93YXRjaCcpO1xudmFyIHNob3BSb3V0ZXIgPSByZXF1aXJlKCcuL3JvdXRlcy9zaG9wJyk7XG52YXIgc3R1ZmZzaG9wUm91dGVyID0gcmVxdWlyZSgnLi9yb3V0ZXMvc3R1ZmZzaG9wJyk7XG52YXIgYWRtaW5Sb3V0ZXIgPSByZXF1aXJlKCcuL3JvdXRlcy9hZG1pbicpO1xuXG4vL0FwcFxudmFyIGFwcCA9IGV4cHJlc3MoKTtcblxuZ2xvYmFsWydkaXNjb3JkQW50aVNwYW1EYXRlJ10gPSBtb21lbnQoKS5zdWJ0cmFjdChcIjIwXCIsIFwiaG91cnNcIik7XG5cbi8vREJcbmNyZWF0ZUNvbm5lY3Rpb24oKS50aGVuKGFzeW5jICgpID0+IHtcblxuICAgIGNvbnN0IGlzRGV2ID0gYXBwLmdldCgnZW52JykgPT09ICdkZXZlbG9wbWVudCc7XG5cbiAgICAvL051bmp1Y2tzXG4gICAgYXBwLnNldCgndmlld3MnLCBfX2Rpcm5hbWUgKyAnL3ZpZXdzJyk7XG4gICAgYXBwLnNldChcInZpZXcgZW5naW5lXCIsIFwibnVualwiKTtcbiAgICBjb25zdCBuamsgPSBleHByZXNzTnVuanVja3MoYXBwLCB7XG4gICAgICAgIHdhdGNoOiBpc0RldixcbiAgICAgICAgbm9DYWNoZTogaXNEZXYsXG4gICAgICAgIGdsb2JhbHM6IHtcbiAgICAgICAgICAgIEhPU1ROQU1FOiBwcm9jZXNzLmVudi5IT1NUTkFNRVxuICAgICAgICB9XG4gICAgfSk7XG5cbiAgICAvL0Rpc2NvcmRcbiAgICBjb25zdCBjbGllbnQgPSBuZXcgRGlzY29yZC5DbGllbnQoKTtcbiAgICBhd2FpdCBjbGllbnQubG9naW4ocHJvY2Vzcy5lbnYuRElTQ09SRF9UT0tFTik7XG4gICAgY2xpZW50LnVzZXIuc2V0QWN0aXZpdHkoXCJodHRwczovL3N0cmVhbXJ1bm5lcnMuZnJcIiwge3R5cGU6IFwiV0FUQ0hJTkdcIn0pO1xuICAgIGFwcC51c2UoKHJlcSwgcmVzLCBuZXh0KSA9PiB7XG4gICAgICAgIHJlcS5kaXNjb3JkID0gY2xpZW50O1xuICAgICAgICBuZXh0KCk7XG4gICAgfSk7XG5cbiAgICAvL3BpbmdcbiAgICBjbGllbnQub24oJ21lc3NhZ2UnLCBtZXNzYWdlID0+IHtcbiAgICBpZihtZXNzYWdlLmNvbnRlbnQuc3RhcnRzV2l0aChcIiFwaW5nXCIpKSB7XG4gICAgICAgICAgICBtZXNzYWdlLmNoYW5uZWwuc2VuZChcbiAgICAgICAgICAgIFx0e1xuXHRcdFx0XHQgIFwiZW1iZWRcIjoge1xuXHRcdFx0XHQgICAgXCJ0aXRsZVwiOiBcIlBpbmdcIixcblx0XHRcdFx0ICAgIFwidXJsXCI6IFwiaHR0cHM6Ly9zdHJlYW1ydW5uZXJzLmZyXCIsXG5cdFx0XHRcdCAgICBcImNvbG9yXCI6IDMwNjY5OTMsXG5cdFx0XHRcdCAgICBcInRpbWVzdGFtcFwiOiBtZXNzYWdlLmNyZWF0ZWRBdCxcblx0XHRcdFx0ICAgIFwiZm9vdGVyXCI6IHtcblx0XHRcdFx0ICAgICAgXCJpY29uX3VybFwiOiBcImh0dHBzOi8vc3RyZWFtcnVubmVycy5mci9pbWcvbG9nb3NxdWFyZS5wbmdcIixcblx0XHRcdFx0ICAgICAgXCJ0ZXh0XCI6IFwiU3RyZWFtUnVubmVyc1wiXG5cdFx0XHRcdCAgICB9LFxuXHRcdFx0XHQgICAgXCJ0aHVtYm5haWxcIjoge1xuXHRcdFx0XHQgICAgICBcInVybFwiOiBcImh0dHBzOi8vc3RyZWFtcnVubmVycy5mci9pbWcvbG9nb3NxdWFyZS5wbmdcIlxuXHRcdFx0XHQgICAgfSxcblx0XHRcdFx0ICAgIFwiYXV0aG9yXCI6IHtcblx0XHRcdFx0ICAgICAgXCJuYW1lXCI6IFwiQm90IGRlIFN0cmVhbVJ1bm5lcnMuZnJcIixcblx0XHRcdFx0ICAgICAgXCJ1cmxcIjogXCJodHRwczovL2Rpc2NvcmRhcHAuY29tXCIsXG5cdFx0XHRcdCAgICAgIFwiaWNvbl91cmxcIjogXCJodHRwczovL3N0cmVhbXJ1bm5lcnMuZnIvaW1nL2xvZ29zcXVhcmUucG5nXCJcblx0XHRcdFx0ICAgIH0sXG5cdFx0XHRcdCAgICBcImZpZWxkc1wiOiBbXG5cdFx0XHRcdCAgICAgIHtcblx0XHRcdFx0ICAgICAgICBcIm5hbWVcIjogXCJQaW5nXCIsXG5cdFx0XHRcdCAgICAgICAgXCJ2YWx1ZVwiOiBuZXcgRGF0ZSgpLmdldFRpbWUoKSAtIG1lc3NhZ2UuY3JlYXRlZFRpbWVzdGFtcCArIFwiIG1zXCJcblx0XHRcdFx0ICAgICAgfVxuXHRcdFx0XHQgICAgXVxuXHRcdFx0XHQgIH1cblx0XHRcdFx0fSk7ICAgICAgICBcbiAgICB9XG5cdH0pO1xuXG4gICAgLy9MZWFkZXJib2FyZFxuICAgIGNsaWVudC5vbihcIm1lc3NhZ2VcIiwgYXN5bmMgbXNnID0+IHtcbiAgICAgICAgaWYgKCFtc2cuYXV0aG9yLmJvdCAmJiBtc2cuY29udGVudCA9PT0gXCIhbGVhZGVyYm9hcmRcIikge1xuXG4gICAgICAgICAgICAvL01vc3QgcG9pbnRzXG4gICAgICAgICAgICBjb25zdCBtb3N0UG9pbnRzID0gYXdhaXQgVXNlci5tb3N0UG9pbnRzKCk7XG5cbiAgICAgICAgICAgIGxldCBwb2ludHNSZXNwb25zZSA9IFwiUG9pbnRzYGBgXCI7XG4gICAgICAgICAgICBsZXQgcGxhY2VtZW50ID0gMDtcbiAgICAgICAgICAgIGZvciAoY29uc3QgdXNlciBvZiBtb3N0UG9pbnRzKSB7XG4gICAgICAgICAgICAgICAgcG9pbnRzUmVzcG9uc2UgKz0gYCR7KytwbGFjZW1lbnR9IyAke3VzZXIuZGlzcGxheV9uYW1lfVxcblxcdCR7dXNlci5wb2ludHN9XFxuYFxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcG9pbnRzUmVzcG9uc2UgKz0gXCJgYGBcIjtcblxuICAgICAgICAgICAgLy9Nb3N0IHBsYWNlXG4gICAgICAgICAgICBjb25zdCBtb3N0UGxhY2UgPSBhd2FpdCBVc2VyLm1vc3RQbGFjZSgpO1xuXG4gICAgICAgICAgICBsZXQgcGxhY2VSZXNwb25zZSA9IFwiU2Vjb25kZSBzdHJlYW3DqWBgYFwiO1xuICAgICAgICAgICAgcGxhY2VtZW50ID0gMDtcbiAgICAgICAgICAgIGZvciAoY29uc3QgdXNlciBvZiBtb3N0UGxhY2UpIHtcbiAgICAgICAgICAgICAgICBwbGFjZVJlc3BvbnNlICs9IGAkeysrcGxhY2VtZW50fSMgJHt1c2VyLmRpc3BsYXlfbmFtZX1cXG5cXHQke3VzZXIudGltZX1cXG5gXG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBwbGFjZVJlc3BvbnNlICs9IFwiYGBgXCI7XG5cblxuICAgICAgICAgICAgYXdhaXQgbXNnLmNoYW5uZWwuc2VuZChwb2ludHNSZXNwb25zZSk7XG4gICAgICAgICAgICBhd2FpdCBtc2cuY2hhbm5lbC5zZW5kKHBsYWNlUmVzcG9uc2UpO1xuXG4gICAgICAgIH1cbiAgICB9KTtcblxuXG4gICAgLy9NYWludGVuYW5jZVxuICAgIGlmIChwcm9jZXNzLmVudi5NQUlOVEVOQU5DRT8udG9Mb3dlckNhc2UoKSA9PT0gXCJ0cnVlXCIpIHtcbiAgICAgICAgYXBwLnVzZShcIipcIiwgKHJlcSwgcmVzKSA9PiB7XG4gICAgICAgICAgICByZXR1cm4gcmVzLnJlbmRlcihcIm1haW50ZW5hbmNlXCIpO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBhcHAudXNlKGxvZ2dlcignZGV2JykpO1xuICAgIGFwcC51c2UoZXhwcmVzcy5qc29uKCkpO1xuICAgIGFwcC51c2UoZXhwcmVzcy51cmxlbmNvZGVkKHtleHRlbmRlZDogZmFsc2V9KSk7XG4gICAgYXBwLnVzZShjb29raWVQYXJzZXIoKSk7XG5cblxuICAgIGFwcC51c2UoY29tcHJlc3Npb24oKSk7XG4gICAgYXBwLnVzZShoZWxtZXQoKSk7XG5cbiAgICBhcHAudXNlKGV4cHJlc3Muc3RhdGljKHBhdGguam9pbihfX2Rpcm5hbWUsICdwdWJsaWMnKSkpO1xuXG4gICAgYXBwLnVzZShjb29raWVTZXNzaW9uKHtrZXlzOiBbcHJvY2Vzcy5lbnYuQ09PS0lFX0tFWV19KSk7IC8vIEV4cHJlc3MgY29va2llIHNlc3Npb24gbWlkZGxld2FyZVxuXG4gICAgLy9QYXNzcG9ydFxuICAgIHBhc3Nwb3J0LnVzZShuZXcgdHdpdGNoU3RyYXRlZ3koe1xuICAgICAgICAgICAgY2xpZW50SUQ6IHByb2Nlc3MuZW52LlRXSVRDSF9DTElFTlRfSUQsXG4gICAgICAgICAgICBjbGllbnRTZWNyZXQ6IHByb2Nlc3MuZW52LlRXSVRDSF9DTElFTlRfU0VDUkVULFxuICAgICAgICAgICAgY2FsbGJhY2tVUkw6IHByb2Nlc3MuZW52LkhPU1ROQU1FICsgXCIvYXV0aC90d2l0Y2gvY2FsbGJhY2tcIixcbiAgICAgICAgICAgIHNjb3BlOiBcInVzZXJfcmVhZFwiXG4gICAgICAgIH0sXG4gICAgICAgIGFzeW5jIGZ1bmN0aW9uIChhY2Nlc3NUb2tlbiwgcmVmcmVzaFRva2VuLCBwcm9maWxlLCBkb25lKSB7XG5cbiAgICAgICAgICAgIC8vRmluZCBvciBjcmVhdGVcbiAgICAgICAgICAgIGxldCB1c2VycyA9IGF3YWl0IFVzZXIuZmluZCh7dHdpdGNoSWQ6IHByb2ZpbGUuaWR9KTtcblxuICAgICAgICAgICAgaWYgKHVzZXJzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgICAgICAvL01ldCDDoCBqb3VyXG4gICAgICAgICAgICAgICAgbGV0IHVzZXIgPSB1c2Vyc1swXTtcblxuICAgICAgICAgICAgICAgIHVzZXIudXNlcm5hbWUgPSBwcm9maWxlLmxvZ2luO1xuICAgICAgICAgICAgICAgIHVzZXIuZGlzcGxheV9uYW1lID0gcHJvZmlsZS5kaXNwbGF5X25hbWU7XG4gICAgICAgICAgICAgICAgdXNlci5hdmF0YXIgPSBwcm9maWxlLnByb2ZpbGVfaW1hZ2VfdXJsO1xuXG4gICAgICAgICAgICAgICAgYXdhaXQgdXNlci5zYXZlKCk7XG5cbiAgICAgICAgICAgICAgICBkb25lKG51bGwsIHVzZXIpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgbGV0IG5ld1VzZXIgPSBuZXcgVXNlcigpO1xuXG4gICAgICAgICAgICAgICAgbmV3VXNlci50d2l0Y2hJZCA9IHByb2ZpbGUuaWQ7XG4gICAgICAgICAgICAgICAgbmV3VXNlci51c2VybmFtZSA9IHByb2ZpbGUubG9naW47XG4gICAgICAgICAgICAgICAgbmV3VXNlci5kaXNwbGF5X25hbWUgPSBwcm9maWxlLmRpc3BsYXlfbmFtZTtcbiAgICAgICAgICAgICAgICBuZXdVc2VyLmF2YXRhciA9IHByb2ZpbGUucHJvZmlsZV9pbWFnZV91cmw7XG5cbiAgICAgICAgICAgICAgICBhd2FpdCBuZXdVc2VyLnNhdmUoKTtcblxuICAgICAgICAgICAgICAgIGRvbmUobnVsbCwgbmV3VXNlcik7XG5cbiAgICAgICAgICAgIH1cblxuICAgICAgICB9KSk7XG4gICAgcGFzc3BvcnQuc2VyaWFsaXplVXNlcihmdW5jdGlvbiAodXNlciwgZG9uZSkge1xuICAgICAgICBkb25lKG51bGwsIHVzZXIudHdpdGNoSWQpO1xuICAgIH0pO1xuICAgIHBhc3Nwb3J0LmRlc2VyaWFsaXplVXNlcihmdW5jdGlvbiAodHdpdGNoSWQsIGRvbmUpIHtcbiAgICAgICAgVXNlci5maW5kT25lKHt0d2l0Y2hJZDogdHdpdGNoSWR9KS50aGVuKCh1c2VyKSA9PiB7XG4gICAgICAgICAgICBsZXQgcmVhbFVzZXIgPSB1c2VyID09IHVuZGVmaW5lZCA/IGZhbHNlIDogdXNlcjtcbiAgICAgICAgICAgIGRvbmUobnVsbCwgcmVhbFVzZXIpO1xuICAgICAgICB9KTtcbiAgICB9KTtcblxuICAgIGFwcC51c2UocGFzc3BvcnQuaW5pdGlhbGl6ZSgpKTsgICAvLyBwYXNzcG9ydCBpbml0aWFsaXplIG1pZGRsZXdhcmVcbiAgICBhcHAudXNlKHBhc3Nwb3J0LnNlc3Npb24oKSk7ICAgICAgLy8gcGFzc3BvcnQgc2Vzc2lvbiBtaWRkbGV3YXJlXG5cbiAgICAvL1BhcnJhaW5hZ2VcbiAgICAvKmFwcC51c2UoYXN5bmMgKHJlcSwgcmVzOiBFeHByZXNzLlJlc3BvbnNlLCBkb25lKSA9PiB7XG5cbiAgICAgICAgaWYgKHJlcS5xdWVyeS5wYXJyYWluX2lkICE9IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgcmVxLnNlc3Npb24ucGFycmFpbl9pZCA9IHJlcS5xdWVyeS5wYXJyYWluX2lkO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHJlcS5pc0F1dGhlbnRpY2F0ZWQoKSAmJiByZXEuc2Vzc2lvbi5wYXJyYWluX2lkICE9IHVuZGVmaW5lZCAmJiByZXEudXNlci5wYXJyYWluID09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgcmVxLnVzZXIucGFycmFpbiA9IGF3YWl0IFVzZXIuZmluZE9uZSh7d2hlcmU6IHtwYXJyYWluYWdlX2lkOiByZXEuc2Vzc2lvbi5wYXJyYWluX2lkfX0pO1xuICAgICAgICAgICAgYXdhaXQgcmVxLnVzZXIuc2F2ZSgpO1xuICAgICAgICB9XG5cbiAgICAgICAgZG9uZSgpO1xuXG4gICAgfSk7Ki9cblxuICAgIC8vU3RyZWFtUXVldWVcbiAgICAvKiBhc3luYyBmdW5jdGlvbiB1cGRhdGUoKSB7XG4gICAgICAgICBhd2FpdCB1cGRhdGVTdHJlYW1RdWV1ZSgpLmNhdGNoKHJlYXNvbiA9PiB7XG4gICAgICAgICAgICAgY29uc29sZS5sb2cocmVhc29uKTtcbiAgICAgICAgIH0pO1xuICAgICAgICAgc2V0VGltZW91dCh1cGRhdGUsIDEwMDApO1xuICAgICB9XG5cbiAgICAgdXBkYXRlKCkuY2F0Y2gocmVhc29uID0+IGNvbnNvbGUubG9nKHJlYXNvbikpOyovXG4gICAgLyphcHAudXNlKGFzeW5jIChyZXEsIHJlczogRXhwcmVzcy5SZXNwb25zZSwgZG9uZSkgPT4ge1xuICAgICAgICBhd2FpdCB1cGRhdGVTdHJlYW1RdWV1ZSgpO1xuICAgICAgICBkb25lKCk7XG4gICAgfSk7Ki9cblxuICAgIC8vUm91dGVzXG4gICAgYXBwLnVzZSgnLycsIGluZGV4Um91dGVyKTtcbiAgICBhcHAudXNlKCcvY2FzZScsIGNhc2VSb3V0ZXIpO1xuICAgIGFwcC51c2UoJy9wYXJyYWluYWdlJywgcGFycmFpbmFnZVJvdXRlcik7XG4gICAgYXBwLnVzZSgnL2dpdmVhd2F5JywgZ2l2ZWF3YXlSb3V0ZXIpO1xuICAgIGFwcC51c2UoJy9jb3Vwb24nLCBjb3Vwb25Sb3V0ZXIpO1xuICAgIGFwcC51c2UoJy9wb2ludHMnLCBwb2ludHNSb3V0ZXIpO1xuICAgIGFwcC51c2UoJy93YXRjaCcsIHdhdGNoUm91dGVyKTtcbiAgICBhcHAudXNlKCcvc2hvcCcsIHNob3BSb3V0ZXIpO1xuICAgIGFwcC51c2UoJy9zdHVmZnNob3AnLCBzdHVmZnNob3BSb3V0ZXIpO1xuICAgIGFwcC51c2UoJy9hZG1pbicsIGFkbWluUm91dGVyKTtcblxuICAgIGFwcC5nZXQoXCIvYXV0aC90d2l0Y2hcIiwgcGFzc3BvcnQuYXV0aGVudGljYXRlKFwidHdpdGNoXCIpKTtcbiAgICBhcHAuZ2V0KFwiL2F1dGgvdHdpdGNoL2NhbGxiYWNrXCIsIHBhc3Nwb3J0LmF1dGhlbnRpY2F0ZShcInR3aXRjaFwiLCB7ZmFpbHVyZVJlZGlyZWN0OiBcIi9cIn0pLCBmdW5jdGlvbiAocmVxLCByZXMpIHtcbiAgICAgICAgcmVzLnJlZGlyZWN0KFwiL1wiKTtcbiAgICB9KTtcblxuXG4gICAgLy9TeW5jIGNhc2VzXG4gICAgYXdhaXQgc3luY0Nhc2VzKGNhc2VzQ29udGVudCk7XG4gICAgYXdhaXQgc3luY1Byb2R1Y3RzKCk7XG5cbn0pLmNhdGNoKGVycm9yID0+IGNvbnNvbGUubG9nKGVycm9yKSk7XG5cbm1vZHVsZS5leHBvcnRzID0gYXBwO1xuIl19