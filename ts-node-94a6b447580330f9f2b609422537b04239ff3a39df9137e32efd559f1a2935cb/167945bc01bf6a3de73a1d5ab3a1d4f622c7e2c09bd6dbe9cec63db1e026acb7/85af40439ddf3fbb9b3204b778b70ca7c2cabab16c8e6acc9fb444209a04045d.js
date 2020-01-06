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
            message.channel.send(new Date().getTime() - message.createdTimestamp + " ms");
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiL1N0cmVhbVJ1bm5lcnMvVHdpdGNoVmlldy9hcHAudHMiLCJzb3VyY2VzIjpbIi9TdHJlYW1SdW5uZXJzL1R3aXRjaFZpZXcvYXBwLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7O0FBQUEsNEJBQTBCO0FBQzFCLHFDQUF5QztBQUN6QyxpREFBNEM7QUFHNUMsaURBQWlEO0FBQ2pELHFEQUFpRDtBQUVqRCw0QkFBMEI7QUFFMUIsdURBQWdFO0FBRWhFLE1BQU0sTUFBTSxHQUFHLE9BQU8sQ0FBQyxRQUFRLENBQUMsQ0FBQztBQUVqQyxNQUFNLE9BQU8sR0FBRyxPQUFPLENBQUMsU0FBUyxDQUFDLENBQUM7QUFDbkMsTUFBTSxJQUFJLEdBQUcsT0FBTyxDQUFDLE1BQU0sQ0FBQyxDQUFDO0FBQzdCLE1BQU0sWUFBWSxHQUFHLE9BQU8sQ0FBQyxlQUFlLENBQUMsQ0FBQztBQUM5QyxNQUFNLGFBQWEsR0FBRyxPQUFPLENBQUMsZ0JBQWdCLENBQUMsQ0FBQztBQUNoRCxNQUFNLE1BQU0sR0FBRyxPQUFPLENBQUMsUUFBUSxDQUFDLENBQUM7QUFDakMsTUFBTSxlQUFlLEdBQUcsT0FBTyxDQUFDLGtCQUFrQixDQUFDLENBQUM7QUFDcEQsTUFBTSxRQUFRLEdBQUcsT0FBTyxDQUFDLFVBQVUsQ0FBQyxDQUFDO0FBQ3JDLE1BQU0sY0FBYyxHQUFHLE9BQU8sQ0FBQyxxQkFBcUIsQ0FBQyxDQUFDLFFBQVEsQ0FBQztBQUMvRCxNQUFNLFdBQVcsR0FBRyxPQUFPLENBQUMsYUFBYSxDQUFDLENBQUM7QUFDM0MsTUFBTSxNQUFNLEdBQUcsT0FBTyxDQUFDLFFBQVEsQ0FBQyxDQUFDO0FBQ2pDLE1BQU0sT0FBTyxHQUFHLE9BQU8sQ0FBQyxZQUFZLENBQUMsQ0FBQztBQUV0QyxNQUFNO0FBQ04sT0FBTyxDQUFDLFFBQVEsQ0FBQyxDQUFDLE1BQU0sRUFBRSxDQUFDO0FBRTNCLGFBQWE7QUFDYixJQUFJLFdBQVcsR0FBRyxPQUFPLENBQUMsZ0JBQWdCLENB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SUFFL0IsR0FBRyxDQUFDLEdBQUcsQ0FBQyxjQUFjLEVBQUUsUUFBUSxDQUFDLFlBQVksQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDO0lBQ3pELEdBQUcsQ0FBQyxHQUFHLENBQUMsdUJBQXVCLEVBQUUsUUFBUSxDQUFDLFlBQVksQ0FBQyxRQUFRLEVBQUUsRUFBQyxlQUFlLEVBQUUsR0FBRyxFQUFDLENBQUMsRUFBRSxVQUFVLEdBQUcsRUFBRSxHQUFHO1FBQ3hHLEdBQUcsQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLENBQUM7SUFDdEIsQ0FBQyxDQUFDLENBQUM7SUFHSCxZQUFZO0lBQ1osTUFBTSxnQkFBUyxDQUFDLDBCQUFZLENBQUMsQ0FBQztJQUM5QixNQUFNLHNCQUFZLEVBQUUsQ0FBQztBQUV6QixDQUFDLENBQUEsQ0FBQyxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsRUFBRSxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQztBQUV0QyxNQUFNLENBQUMsT0FBTyxHQUFHLEdBQUcsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBcInJlZmxlY3QtbWV0YWRhdGFcIjtcbmltcG9ydCB7Y3JlYXRlQ29ubmVjdGlvbn0gZnJvbSBcInR5cGVvcm1cIjtcbmltcG9ydCB7VXNlcn0gZnJvbSBcIi4vZGF0YWJhc2UvZW50aXR5L1VzZXJcIjtcbmltcG9ydCB7dXBkYXRlU3RyZWFtUXVldWV9IGZyb20gXCIuL2RhdGFiYXNlL2VudGl0eS9TdHJlYW1RdWV1ZVwiO1xuaW1wb3J0IHtzeW5jfSBmcm9tIFwiZ2xvYlwiO1xuaW1wb3J0IHtzeW5jQ2FzZXN9IGZyb20gXCIuL2RhdGFiYXNlL2VudGl0eS9DYXNlXCI7XG5pbXBvcnQge2Nhc2VzQ29udGVudH0gZnJvbSBcIi4vb3RoZXIvQ2FzZUNvbnRlbnRcIjtcblxuaW1wb3J0IFwicmVmbGVjdC1tZXRhZGF0YVwiO1xuaW1wb3J0ICogYXMgY2hpbGRfcHJvY2VzcyBmcm9tIFwiY2hpbGRfcHJvY2Vzc1wiO1xuaW1wb3J0IHtQcm9kdWN0LCBzeW5jUHJvZHVjdHN9IGZyb20gXCIuL2RhdGFiYXNlL2VudGl0eS9Qcm9kdWN0XCI7XG5cbmNvbnN0IG1vbWVudCA9IHJlcXVpcmUoXCJtb21lbnRcIik7XG5cbmNvbnN0IGV4cHJlc3MgPSByZXF1aXJlKCdleHByZXNzJyk7XG5jb25zdCBwYXRoID0gcmVxdWlyZSgncGF0aCcpO1xuY29uc3QgY29va2llUGFyc2VyID0gcmVxdWlyZSgnY29va2llLXBhcnNlcicpO1xuY29uc3QgY29va2llU2Vzc2lvbiA9IHJlcXVpcmUoJ2Nvb2tpZS1zZXNzaW9uJyk7XG5jb25zdCBsb2dnZXIgPSByZXF1aXJlKCdtb3JnYW4nKTtcbmNvbnN0IGV4cHJlc3NOdW5qdWNrcyA9IHJlcXVpcmUoJ2V4cHJlc3MtbnVuanVja3MnKTtcbmNvbnN0IHBhc3Nwb3J0ID0gcmVxdWlyZSgncGFzc3BvcnQnKTtcbmNvbnN0IHR3aXRjaFN0cmF0ZWd5ID0gcmVxdWlyZShcInBhc3Nwb3J0LXR3aXRjaC1uZXdcIikuU3RyYXRlZ3k7XG5jb25zdCBjb21wcmVzc2lvbiA9IHJlcXVpcmUoJ2NvbXByZXNzaW9uJyk7XG5jb25zdCBoZWxtZXQgPSByZXF1aXJlKCdoZWxtZXQnKTtcbmNvbnN0IERpc2NvcmQgPSByZXF1aXJlKFwiZGlzY29yZC5qc1wiKTtcblxuLy8uZW52XG5yZXF1aXJlKFwiZG90ZW52XCIpLmNvbmZpZygpO1xuXG4vL0xvYWQgcm91dGVzXG52YXIgaW5kZXhSb3V0ZXIgPSByZXF1aXJlKCcuL3JvdXRlcy9pbmRleCcpO1xudmFyIGNhc2VSb3V0ZXIgPSByZXF1aXJlKCcuL3JvdXRlcy9jYXNlJyk7XG52YXIgc2hvcFJvdXRlciA9IHJlcXVpcmUoJy4vcm91dGVzL3Nob3AnKTtcbnZhciBwYXJyYWluYWdlUm91dGVyID0gcmVxdWlyZSgnLi9yb3V0ZXMvcGFycmFpbmFnZScpO1xudmFyIGdpdmVhd2F5Um91dGVyID0gcmVxdWlyZSgnLi9yb3V0ZXMvZ2l2ZWF3YXknKTtcbnZhciBjb3Vwb25Sb3V0ZXIgPSByZXF1aXJlKCcuL3JvdXRlcy9jb3Vwb24nKTtcbnZhciBwb2ludHNSb3V0ZXIgPSByZXF1aXJlKCcuL3JvdXRlcy9wb2ludHMnKTtcbnZhciB3YXRjaFJvdXRlciA9IHJlcXVpcmUoJy4vcm91dGVzL3dhdGNoJyk7XG52YXIgc2hvcFJvdXRlciA9IHJlcXVpcmUoJy4vcm91dGVzL3Nob3AnKTtcbnZhciBzdHVmZnNob3BSb3V0ZXIgPSByZXF1aXJlKCcuL3JvdXRlcy9zdHVmZnNob3AnKTtcbnZhciBhZG1pblJvdXRlciA9IHJlcXVpcmUoJy4vcm91dGVzL2FkbWluJyk7XG5cbi8vQXBwXG52YXIgYXBwID0gZXhwcmVzcygpO1xuXG5nbG9iYWxbJ2Rpc2NvcmRBbnRpU3BhbURhdGUnXSA9IG1vbWVudCgpLnN1YnRyYWN0KFwiMjBcIiwgXCJob3Vyc1wiKTtcblxuLy9EQlxuY3JlYXRlQ29ubmVjdGlvbigpLnRoZW4oYXN5bmMgKCkgPT4ge1xuXG4gICAgY29uc3QgaXNEZXYgPSBhcHAuZ2V0KCdlbnYnKSA9PT0gJ2RldmVsb3BtZW50JztcblxuICAgIC8vTnVuanVja3NcbiAgICBhcHAuc2V0KCd2aWV3cycsIF9fZGlybmFtZSArICcvdmlld3MnKTtcbiAgICBhcHAuc2V0KFwidmlldyBlbmdpbmVcIiwgXCJudW5qXCIpO1xuICAgIGNvbnN0IG5qayA9IGV4cHJlc3NOdW5qdWNrcyhhcHAsIHtcbiAgICAgICAgd2F0Y2g6IGlzRGV2LFxuICAgICAgICBub0NhY2hlOiBpc0RldixcbiAgICAgICAgZ2xvYmFsczoge1xuICAgICAgICAgICAgSE9TVE5BTUU6IHByb2Nlc3MuZW52LkhPU1ROQU1FXG4gICAgICAgIH1cbiAgICB9KTtcblxuICAgIC8vRGlzY29yZFxuICAgIGNvbnN0IGNsaWVudCA9IG5ldyBEaXNjb3JkLkNsaWVudCgpO1xuICAgIGF3YWl0IGNsaWVudC5sb2dpbihwcm9jZXNzLmVudi5ESVNDT1JEX1RPS0VOKTtcbiAgICBjbGllbnQudXNlci5zZXRBY3Rpdml0eShcImh0dHBzOi8vc3RyZWFtcnVubmVycy5mclwiLCB7dHlwZTogXCJXQVRDSElOR1wifSk7XG4gICAgYXBwLnVzZSgocmVxLCByZXMsIG5leHQpID0+IHtcbiAgICAgICAgcmVxLmRpc2NvcmQgPSBjbGllbnQ7XG4gICAgICAgIG5leHQoKTtcbiAgICB9KTtcblxuICAgIC8vcGluZ1xuICAgIGNsaWVudC5vbignbWVzc2FnZScsIG1lc3NhZ2UgPT4ge1xuICAgIGlmKG1lc3NhZ2UuY29udGVudC5zdGFydHNXaXRoKFwiIXBpbmdcIikpIHtcbiAgICAgICAgICAgIG1lc3NhZ2UuY2hhbm5lbC5zZW5kKG5ldyBEYXRlKCkuZ2V0VGltZSgpIC0gbWVzc2FnZS5jcmVhdGVkVGltZXN0YW1wICsgXCIgbXNcIik7ICAgICAgICBcbiAgICB9XG5cdH0pO1xuXG4gICAgLy9MZWFkZXJib2FyZFxuICAgIGNsaWVudC5vbihcIm1lc3NhZ2VcIiwgYXN5bmMgbXNnID0+IHtcbiAgICAgICAgaWYgKCFtc2cuYXV0aG9yLmJvdCAmJiBtc2cuY29udGVudCA9PT0gXCIhbGVhZGVyYm9hcmRcIikge1xuXG4gICAgICAgICAgICAvL01vc3QgcG9pbnRzXG4gICAgICAgICAgICBjb25zdCBtb3N0UG9pbnRzID0gYXdhaXQgVXNlci5tb3N0UG9pbnRzKCk7XG5cbiAgICAgICAgICAgIGxldCBwb2ludHNSZXNwb25zZSA9IFwiUG9pbnRzYGBgXCI7XG4gICAgICAgICAgICBsZXQgcGxhY2VtZW50ID0gMDtcbiAgICAgICAgICAgIGZvciAoY29uc3QgdXNlciBvZiBtb3N0UG9pbnRzKSB7XG4gICAgICAgICAgICAgICAgcG9pbnRzUmVzcG9uc2UgKz0gYCR7KytwbGFjZW1lbnR9IyAke3VzZXIuZGlzcGxheV9uYW1lfVxcblxcdCR7dXNlci5wb2ludHN9XFxuYFxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcG9pbnRzUmVzcG9uc2UgKz0gXCJgYGBcIjtcblxuICAgICAgICAgICAgLy9Nb3N0IHBsYWNlXG4gICAgICAgICAgICBjb25zdCBtb3N0UGxhY2UgPSBhd2FpdCBVc2VyLm1vc3RQbGFjZSgpO1xuXG4gICAgICAgICAgICBsZXQgcGxhY2VSZXNwb25zZSA9IFwiU2Vjb25kZSBzdHJlYW3DqWBgYFwiO1xuICAgICAgICAgICAgcGxhY2VtZW50ID0gMDtcbiAgICAgICAgICAgIGZvciAoY29uc3QgdXNlciBvZiBtb3N0UGxhY2UpIHtcbiAgICAgICAgICAgICAgICBwbGFjZVJlc3BvbnNlICs9IGAkeysrcGxhY2VtZW50fSMgJHt1c2VyLmRpc3BsYXlfbmFtZX1cXG5cXHQke3VzZXIudGltZX1cXG5gXG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBwbGFjZVJlc3BvbnNlICs9IFwiYGBgXCI7XG5cblxuICAgICAgICAgICAgYXdhaXQgbXNnLmNoYW5uZWwuc2VuZChwb2ludHNSZXNwb25zZSk7XG4gICAgICAgICAgICBhd2FpdCBtc2cuY2hhbm5lbC5zZW5kKHBsYWNlUmVzcG9uc2UpO1xuXG4gICAgICAgIH1cbiAgICB9KTtcblxuXG4gICAgLy9NYWludGVuYW5jZVxuICAgIGlmIChwcm9jZXNzLmVudi5NQUlOVEVOQU5DRT8udG9Mb3dlckNhc2UoKSA9PT0gXCJ0cnVlXCIpIHtcbiAgICAgICAgYXBwLnVzZShcIipcIiwgKHJlcSwgcmVzKSA9PiB7XG4gICAgICAgICAgICByZXR1cm4gcmVzLnJlbmRlcihcIm1haW50ZW5hbmNlXCIpO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBhcHAudXNlKGxvZ2dlcignZGV2JykpO1xuICAgIGFwcC51c2UoZXhwcmVzcy5qc29uKCkpO1xuICAgIGFwcC51c2UoZXhwcmVzcy51cmxlbmNvZGVkKHtleHRlbmRlZDogZmFsc2V9KSk7XG4gICAgYXBwLnVzZShjb29raWVQYXJzZXIoKSk7XG5cblxuICAgIGFwcC51c2UoY29tcHJlc3Npb24oKSk7XG4gICAgYXBwLnVzZShoZWxtZXQoKSk7XG5cbiAgICBhcHAudXNlKGV4cHJlc3Muc3RhdGljKHBhdGguam9pbihfX2Rpcm5hbWUsICdwdWJsaWMnKSkpO1xuXG4gICAgYXBwLnVzZShjb29raWVTZXNzaW9uKHtrZXlzOiBbcHJvY2Vzcy5lbnYuQ09PS0lFX0tFWV19KSk7IC8vIEV4cHJlc3MgY29va2llIHNlc3Npb24gbWlkZGxld2FyZVxuXG4gICAgLy9QYXNzcG9ydFxuICAgIHBhc3Nwb3J0LnVzZShuZXcgdHdpdGNoU3RyYXRlZ3koe1xuICAgICAgICAgICAgY2xpZW50SUQ6IHByb2Nlc3MuZW52LlRXSVRDSF9DTElFTlRfSUQsXG4gICAgICAgICAgICBjbGllbnRTZWNyZXQ6IHByb2Nlc3MuZW52LlRXSVRDSF9DTElFTlRfU0VDUkVULFxuICAgICAgICAgICAgY2FsbGJhY2tVUkw6IHByb2Nlc3MuZW52LkhPU1ROQU1FICsgXCIvYXV0aC90d2l0Y2gvY2FsbGJhY2tcIixcbiAgICAgICAgICAgIHNjb3BlOiBcInVzZXJfcmVhZFwiXG4gICAgICAgIH0sXG4gICAgICAgIGFzeW5jIGZ1bmN0aW9uIChhY2Nlc3NUb2tlbiwgcmVmcmVzaFRva2VuLCBwcm9maWxlLCBkb25lKSB7XG5cbiAgICAgICAgICAgIC8vRmluZCBvciBjcmVhdGVcbiAgICAgICAgICAgIGxldCB1c2VycyA9IGF3YWl0IFVzZXIuZmluZCh7dHdpdGNoSWQ6IHByb2ZpbGUuaWR9KTtcblxuICAgICAgICAgICAgaWYgKHVzZXJzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgICAgICAvL01ldCDDoCBqb3VyXG4gICAgICAgICAgICAgICAgbGV0IHVzZXIgPSB1c2Vyc1swXTtcblxuICAgICAgICAgICAgICAgIHVzZXIudXNlcm5hbWUgPSBwcm9maWxlLmxvZ2luO1xuICAgICAgICAgICAgICAgIHVzZXIuZGlzcGxheV9uYW1lID0gcHJvZmlsZS5kaXNwbGF5X25hbWU7XG4gICAgICAgICAgICAgICAgdXNlci5hdmF0YXIgPSBwcm9maWxlLnByb2ZpbGVfaW1hZ2VfdXJsO1xuXG4gICAgICAgICAgICAgICAgYXdhaXQgdXNlci5zYXZlKCk7XG5cbiAgICAgICAgICAgICAgICBkb25lKG51bGwsIHVzZXIpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgbGV0IG5ld1VzZXIgPSBuZXcgVXNlcigpO1xuXG4gICAgICAgICAgICAgICAgbmV3VXNlci50d2l0Y2hJZCA9IHByb2ZpbGUuaWQ7XG4gICAgICAgICAgICAgICAgbmV3VXNlci51c2VybmFtZSA9IHByb2ZpbGUubG9naW47XG4gICAgICAgICAgICAgICAgbmV3VXNlci5kaXNwbGF5X25hbWUgPSBwcm9maWxlLmRpc3BsYXlfbmFtZTtcbiAgICAgICAgICAgICAgICBuZXdVc2VyLmF2YXRhciA9IHByb2ZpbGUucHJvZmlsZV9pbWFnZV91cmw7XG5cbiAgICAgICAgICAgICAgICBhd2FpdCBuZXdVc2VyLnNhdmUoKTtcblxuICAgICAgICAgICAgICAgIGRvbmUobnVsbCwgbmV3VXNlcik7XG5cbiAgICAgICAgICAgIH1cblxuICAgICAgICB9KSk7XG4gICAgcGFzc3BvcnQuc2VyaWFsaXplVXNlcihmdW5jdGlvbiAodXNlciwgZG9uZSkge1xuICAgICAgICBkb25lKG51bGwsIHVzZXIudHdpdGNoSWQpO1xuICAgIH0pO1xuICAgIHBhc3Nwb3J0LmRlc2VyaWFsaXplVXNlcihmdW5jdGlvbiAodHdpdGNoSWQsIGRvbmUpIHtcbiAgICAgICAgVXNlci5maW5kT25lKHt0d2l0Y2hJZDogdHdpdGNoSWR9KS50aGVuKCh1c2VyKSA9PiB7XG4gICAgICAgICAgICBsZXQgcmVhbFVzZXIgPSB1c2VyID09IHVuZGVmaW5lZCA/IGZhbHNlIDogdXNlcjtcbiAgICAgICAgICAgIGRvbmUobnVsbCwgcmVhbFVzZXIpO1xuICAgICAgICB9KTtcbiAgICB9KTtcblxuICAgIGFwcC51c2UocGFzc3BvcnQuaW5pdGlhbGl6ZSgpKTsgICAvLyBwYXNzcG9ydCBpbml0aWFsaXplIG1pZGRsZXdhcmVcbiAgICBhcHAudXNlKHBhc3Nwb3J0LnNlc3Npb24oKSk7ICAgICAgLy8gcGFzc3BvcnQgc2Vzc2lvbiBtaWRkbGV3YXJlXG5cbiAgICAvL1BhcnJhaW5hZ2VcbiAgICAvKmFwcC51c2UoYXN5bmMgKHJlcSwgcmVzOiBFeHByZXNzLlJlc3BvbnNlLCBkb25lKSA9PiB7XG5cbiAgICAgICAgaWYgKHJlcS5xdWVyeS5wYXJyYWluX2lkICE9IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgcmVxLnNlc3Npb24ucGFycmFpbl9pZCA9IHJlcS5xdWVyeS5wYXJyYWluX2lkO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHJlcS5pc0F1dGhlbnRpY2F0ZWQoKSAmJiByZXEuc2Vzc2lvbi5wYXJyYWluX2lkICE9IHVuZGVmaW5lZCAmJiByZXEudXNlci5wYXJyYWluID09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgcmVxLnVzZXIucGFycmFpbiA9IGF3YWl0IFVzZXIuZmluZE9uZSh7d2hlcmU6IHtwYXJyYWluYWdlX2lkOiByZXEuc2Vzc2lvbi5wYXJyYWluX2lkfX0pO1xuICAgICAgICAgICAgYXdhaXQgcmVxLnVzZXIuc2F2ZSgpO1xuICAgICAgICB9XG5cbiAgICAgICAgZG9uZSgpO1xuXG4gICAgfSk7Ki9cblxuICAgIC8vU3RyZWFtUXVldWVcbiAgICAvKiBhc3luYyBmdW5jdGlvbiB1cGRhdGUoKSB7XG4gICAgICAgICBhd2FpdCB1cGRhdGVTdHJlYW1RdWV1ZSgpLmNhdGNoKHJlYXNvbiA9PiB7XG4gICAgICAgICAgICAgY29uc29sZS5sb2cocmVhc29uKTtcbiAgICAgICAgIH0pO1xuICAgICAgICAgc2V0VGltZW91dCh1cGRhdGUsIDEwMDApO1xuICAgICB9XG5cbiAgICAgdXBkYXRlKCkuY2F0Y2gocmVhc29uID0+IGNvbnNvbGUubG9nKHJlYXNvbikpOyovXG4gICAgLyphcHAudXNlKGFzeW5jIChyZXEsIHJlczogRXhwcmVzcy5SZXNwb25zZSwgZG9uZSkgPT4ge1xuICAgICAgICBhd2FpdCB1cGRhdGVTdHJlYW1RdWV1ZSgpO1xuICAgICAgICBkb25lKCk7XG4gICAgfSk7Ki9cblxuICAgIC8vUm91dGVzXG4gICAgYXBwLnVzZSgnLycsIGluZGV4Um91dGVyKTtcbiAgICBhcHAudXNlKCcvY2FzZScsIGNhc2VSb3V0ZXIpO1xuICAgIGFwcC51c2UoJy9wYXJyYWluYWdlJywgcGFycmFpbmFnZVJvdXRlcik7XG4gICAgYXBwLnVzZSgnL2dpdmVhd2F5JywgZ2l2ZWF3YXlSb3V0ZXIpO1xuICAgIGFwcC51c2UoJy9jb3Vwb24nLCBjb3Vwb25Sb3V0ZXIpO1xuICAgIGFwcC51c2UoJy9wb2ludHMnLCBwb2ludHNSb3V0ZXIpO1xuICAgIGFwcC51c2UoJy93YXRjaCcsIHdhdGNoUm91dGVyKTtcbiAgICBhcHAudXNlKCcvc2hvcCcsIHNob3BSb3V0ZXIpO1xuICAgIGFwcC51c2UoJy9zdHVmZnNob3AnLCBzdHVmZnNob3BSb3V0ZXIpO1xuICAgIGFwcC51c2UoJy9hZG1pbicsIGFkbWluUm91dGVyKTtcblxuICAgIGFwcC5nZXQoXCIvYXV0aC90d2l0Y2hcIiwgcGFzc3BvcnQuYXV0aGVudGljYXRlKFwidHdpdGNoXCIpKTtcbiAgICBhcHAuZ2V0KFwiL2F1dGgvdHdpdGNoL2NhbGxiYWNrXCIsIHBhc3Nwb3J0LmF1dGhlbnRpY2F0ZShcInR3aXRjaFwiLCB7ZmFpbHVyZVJlZGlyZWN0OiBcIi9cIn0pLCBmdW5jdGlvbiAocmVxLCByZXMpIHtcbiAgICAgICAgcmVzLnJlZGlyZWN0KFwiL1wiKTtcbiAgICB9KTtcblxuXG4gICAgLy9TeW5jIGNhc2VzXG4gICAgYXdhaXQgc3luY0Nhc2VzKGNhc2VzQ29udGVudCk7XG4gICAgYXdhaXQgc3luY1Byb2R1Y3RzKCk7XG5cbn0pLmNhdGNoKGVycm9yID0+IGNvbnNvbGUubG9nKGVycm9yKSk7XG5cbm1vZHVsZS5leHBvcnRzID0gYXBwO1xuIl19