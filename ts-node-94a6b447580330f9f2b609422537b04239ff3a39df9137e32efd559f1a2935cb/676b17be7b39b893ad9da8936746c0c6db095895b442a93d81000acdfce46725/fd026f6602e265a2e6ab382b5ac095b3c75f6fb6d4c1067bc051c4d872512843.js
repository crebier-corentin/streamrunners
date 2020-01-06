"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
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
typeorm_1.createConnection().then(() => __awaiter(this, void 0, void 0, function* () {
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
    //Maintenance
    if (process.env.MAINTENANCE.toLowerCase() === "true") {
        app.use("*", (req, res) => {
            return res.render("maintenance");
        });
    }
    //Discord
    const client = new Discord.Client();
    yield client.login(process.env.DISCORD_TOKEN);
    client.user.setActivity("StreamRunners.fr", { type: "WATCHING" });
    app.use((req, res, next) => {
        req.discord = client;
        next();
    });
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiL1N0cmVhbVJ1bm5lcnMvVHdpdGNoVmlldy9hcHAudHMiLCJzb3VyY2VzIjpbIi9TdHJlYW1SdW5uZXJzL1R3aXRjaFZpZXcvYXBwLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7QUFBQSw0QkFBMEI7QUFDMUIscUNBQXlDO0FBQ3pDLGlEQUE0QztBQUc1QyxpREFBaUQ7QUFDakQscURBQWlEO0FBRWpELDRCQUEwQjtBQUUxQix1REFBZ0U7QUFFaEUsTUFBTSxNQUFNLEdBQUcsT0FBTyxDQUFDLFFBQVEsQ0FBQyxDQUFDO0FBRWpDLE1BQU0sT0FBTyxHQUFHLE9BQU8sQ0FBQyxTQUFTLENBQUMsQ0FBQztBQUNuQyxNQUFNLElBQUksR0FBRyxPQUFPLENBQUMsTUFBTSxDQUFDLENBQUM7QUFDN0IsTUFBTSxZQUFZLEdBQUcsT0FBTyxDQUFDLGVBQWUsQ0FBQyxDQUFDO0FBQzlDLE1BQU0sYUFBYSxHQUFHLE9BQU8sQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDO0FBQ2hELE1BQU0sTUFBTSxHQUFHLE9BQU8sQ0FBQyxRQUFRLENBQUMsQ0FBQztBQUNqQyxNQUFNLGVBQWUsR0FBRyxPQUFPLENBQUMsa0JBQWtCLENBQUMsQ0FBQztBQUNwRCxNQUFNLFFBQVEsR0FBRyxPQUFPLENBQUMsVUFBVSxDQUFDLENBQUM7QUFDckMsTUFBTSxjQUFjLEdBQUcsT0FBTyxDQUFDLHFCQUFxQixDQUFDLENBQUMsUUFBUSxDQUFDO0FBQy9ELE1BQU0sV0FBVyxHQUFHLE9BQU8sQ0FBQyxhQUFhLENBQUMsQ0FBQztBQUMzQyxNQUFNLE1BQU0sR0FBRyxPQUFPLENBQUMsUUFBUSxDQUFDLENBQUM7QUFDakMsTUFBTSxPQUFPLEdBQUcsT0FBTyxDQUFDLFlBQVksQ0FBQyxDQUFDO0FBRXRDLE1BQU07QUFDTixPQUFPLENBQUMsUUFBUSxDQUFDLENBQUMsTUFBTSxFQUFFLENBQUM7QUFFM0IsYUFBYTtBQUNiLElBQUksV0FBVyxHQUFHLE9BQU8sQ0FBQyxnQkFBZ0IsQ0FB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RSxVQUFVLEdBQUcsRUFBRSxHQUFHO1FBQ3hHLEdBQUcsQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLENBQUM7SUFDdEIsQ0FBQyxDQUFDLENBQUM7SUFHSCxZQUFZO0lBQ1osTUFBTSxnQkFBUyxDQUFDLDBCQUFZLENBQUMsQ0FBQztJQUM5QixNQUFNLHNCQUFZLEVBQUUsQ0FBQztBQUV6QixDQUFDLENBQUEsQ0FBQyxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsRUFBRSxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQztBQUV0QyxNQUFNLENBQUMsT0FBTyxHQUFHLEdBQUcsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBcInJlZmxlY3QtbWV0YWRhdGFcIjtcbmltcG9ydCB7Y3JlYXRlQ29ubmVjdGlvbn0gZnJvbSBcInR5cGVvcm1cIjtcbmltcG9ydCB7VXNlcn0gZnJvbSBcIi4vZGF0YWJhc2UvZW50aXR5L1VzZXJcIjtcbmltcG9ydCB7dXBkYXRlU3RyZWFtUXVldWV9IGZyb20gXCIuL2RhdGFiYXNlL2VudGl0eS9TdHJlYW1RdWV1ZVwiO1xuaW1wb3J0IHtzeW5jfSBmcm9tIFwiZ2xvYlwiO1xuaW1wb3J0IHtzeW5jQ2FzZXN9IGZyb20gXCIuL2RhdGFiYXNlL2VudGl0eS9DYXNlXCI7XG5pbXBvcnQge2Nhc2VzQ29udGVudH0gZnJvbSBcIi4vb3RoZXIvQ2FzZUNvbnRlbnRcIjtcblxuaW1wb3J0IFwicmVmbGVjdC1tZXRhZGF0YVwiO1xuaW1wb3J0ICogYXMgY2hpbGRfcHJvY2VzcyBmcm9tIFwiY2hpbGRfcHJvY2Vzc1wiO1xuaW1wb3J0IHtQcm9kdWN0LCBzeW5jUHJvZHVjdHN9IGZyb20gXCIuL2RhdGFiYXNlL2VudGl0eS9Qcm9kdWN0XCI7XG5cbmNvbnN0IG1vbWVudCA9IHJlcXVpcmUoXCJtb21lbnRcIik7XG5cbmNvbnN0IGV4cHJlc3MgPSByZXF1aXJlKCdleHByZXNzJyk7XG5jb25zdCBwYXRoID0gcmVxdWlyZSgncGF0aCcpO1xuY29uc3QgY29va2llUGFyc2VyID0gcmVxdWlyZSgnY29va2llLXBhcnNlcicpO1xuY29uc3QgY29va2llU2Vzc2lvbiA9IHJlcXVpcmUoJ2Nvb2tpZS1zZXNzaW9uJyk7XG5jb25zdCBsb2dnZXIgPSByZXF1aXJlKCdtb3JnYW4nKTtcbmNvbnN0IGV4cHJlc3NOdW5qdWNrcyA9IHJlcXVpcmUoJ2V4cHJlc3MtbnVuanVja3MnKTtcbmNvbnN0IHBhc3Nwb3J0ID0gcmVxdWlyZSgncGFzc3BvcnQnKTtcbmNvbnN0IHR3aXRjaFN0cmF0ZWd5ID0gcmVxdWlyZShcInBhc3Nwb3J0LXR3aXRjaC1uZXdcIikuU3RyYXRlZ3k7XG5jb25zdCBjb21wcmVzc2lvbiA9IHJlcXVpcmUoJ2NvbXByZXNzaW9uJyk7XG5jb25zdCBoZWxtZXQgPSByZXF1aXJlKCdoZWxtZXQnKTtcbmNvbnN0IERpc2NvcmQgPSByZXF1aXJlKFwiZGlzY29yZC5qc1wiKTtcblxuLy8uZW52XG5yZXF1aXJlKFwiZG90ZW52XCIpLmNvbmZpZygpO1xuXG4vL0xvYWQgcm91dGVzXG52YXIgaW5kZXhSb3V0ZXIgPSByZXF1aXJlKCcuL3JvdXRlcy9pbmRleCcpO1xudmFyIGNhc2VSb3V0ZXIgPSByZXF1aXJlKCcuL3JvdXRlcy9jYXNlJyk7XG52YXIgc2hvcFJvdXRlciA9IHJlcXVpcmUoJy4vcm91dGVzL3Nob3AnKTtcbnZhciBwYXJyYWluYWdlUm91dGVyID0gcmVxdWlyZSgnLi9yb3V0ZXMvcGFycmFpbmFnZScpO1xudmFyIGdpdmVhd2F5Um91dGVyID0gcmVxdWlyZSgnLi9yb3V0ZXMvZ2l2ZWF3YXknKTtcbnZhciBjb3Vwb25Sb3V0ZXIgPSByZXF1aXJlKCcuL3JvdXRlcy9jb3Vwb24nKTtcbnZhciBwb2ludHNSb3V0ZXIgPSByZXF1aXJlKCcuL3JvdXRlcy9wb2ludHMnKTtcbnZhciB3YXRjaFJvdXRlciA9IHJlcXVpcmUoJy4vcm91dGVzL3dhdGNoJyk7XG52YXIgc2hvcFJvdXRlciA9IHJlcXVpcmUoJy4vcm91dGVzL3Nob3AnKTtcbnZhciBzdHVmZnNob3BSb3V0ZXIgPSByZXF1aXJlKCcuL3JvdXRlcy9zdHVmZnNob3AnKTtcbnZhciBhZG1pblJvdXRlciA9IHJlcXVpcmUoJy4vcm91dGVzL2FkbWluJyk7XG5cbi8vQXBwXG52YXIgYXBwID0gZXhwcmVzcygpO1xuXG5nbG9iYWxbJ2Rpc2NvcmRBbnRpU3BhbURhdGUnXSA9IG1vbWVudCgpLnN1YnRyYWN0KFwiMjBcIiwgXCJob3Vyc1wiKTtcblxuLy9EQlxuY3JlYXRlQ29ubmVjdGlvbigpLnRoZW4oYXN5bmMgKCkgPT4ge1xuXG4gICAgY29uc3QgaXNEZXYgPSBhcHAuZ2V0KCdlbnYnKSA9PT0gJ2RldmVsb3BtZW50JztcblxuICAgIC8vTnVuanVja3NcbiAgICBhcHAuc2V0KCd2aWV3cycsIF9fZGlybmFtZSArICcvdmlld3MnKTtcbiAgICBhcHAuc2V0KFwidmlldyBlbmdpbmVcIiwgXCJudW5qXCIpO1xuICAgIGNvbnN0IG5qayA9IGV4cHJlc3NOdW5qdWNrcyhhcHAsIHtcbiAgICAgICAgd2F0Y2g6IGlzRGV2LFxuICAgICAgICBub0NhY2hlOiBpc0RldixcbiAgICAgICAgZ2xvYmFsczoge1xuICAgICAgICAgICAgSE9TVE5BTUU6IHByb2Nlc3MuZW52LkhPU1ROQU1FXG4gICAgICAgIH1cbiAgICB9KTtcblxuICAgIC8vTWFpbnRlbmFuY2VcbiAgICBpZiAocHJvY2Vzcy5lbnYuTUFJTlRFTkFOQ0UudG9Mb3dlckNhc2UoKSA9PT0gXCJ0cnVlXCIpIHtcbiAgICAgICAgYXBwLnVzZShcIipcIiwgKHJlcSwgcmVzKSA9PiB7XG4gICAgICAgICAgICByZXR1cm4gcmVzLnJlbmRlcihcIm1haW50ZW5hbmNlXCIpO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICAvL0Rpc2NvcmRcbiAgICBjb25zdCBjbGllbnQgPSBuZXcgRGlzY29yZC5DbGllbnQoKTtcbiAgICBhd2FpdCBjbGllbnQubG9naW4ocHJvY2Vzcy5lbnYuRElTQ09SRF9UT0tFTik7XG4gICAgY2xpZW50LnVzZXIuc2V0QWN0aXZpdHkoXCJTdHJlYW1SdW5uZXJzLmZyXCIsIHt0eXBlOiBcIldBVENISU5HXCJ9KTtcbiAgICBhcHAudXNlKChyZXEsIHJlcywgbmV4dCkgPT4ge1xuICAgICAgICByZXEuZGlzY29yZCA9IGNsaWVudDtcbiAgICAgICAgbmV4dCgpO1xuICAgIH0pO1xuXG4gICAgYXBwLnVzZShsb2dnZXIoJ2RldicpKTtcbiAgICBhcHAudXNlKGV4cHJlc3MuanNvbigpKTtcbiAgICBhcHAudXNlKGV4cHJlc3MudXJsZW5jb2RlZCh7ZXh0ZW5kZWQ6IGZhbHNlfSkpO1xuICAgIGFwcC51c2UoY29va2llUGFyc2VyKCkpO1xuXG5cbiAgICBhcHAudXNlKGNvbXByZXNzaW9uKCkpO1xuICAgIGFwcC51c2UoaGVsbWV0KCkpO1xuXG4gICAgYXBwLnVzZShleHByZXNzLnN0YXRpYyhwYXRoLmpvaW4oX19kaXJuYW1lLCAncHVibGljJykpKTtcblxuICAgIGFwcC51c2UoY29va2llU2Vzc2lvbih7a2V5czogW3Byb2Nlc3MuZW52LkNPT0tJRV9LRVldfSkpOyAvLyBFeHByZXNzIGNvb2tpZSBzZXNzaW9uIG1pZGRsZXdhcmVcblxuICAgIC8vUGFzc3BvcnRcbiAgICBwYXNzcG9ydC51c2UobmV3IHR3aXRjaFN0cmF0ZWd5KHtcbiAgICAgICAgICAgIGNsaWVudElEOiBwcm9jZXNzLmVudi5UV0lUQ0hfQ0xJRU5UX0lELFxuICAgICAgICAgICAgY2xpZW50U2VjcmV0OiBwcm9jZXNzLmVudi5UV0lUQ0hfQ0xJRU5UX1NFQ1JFVCxcbiAgICAgICAgICAgIGNhbGxiYWNrVVJMOiBwcm9jZXNzLmVudi5IT1NUTkFNRSArIFwiL2F1dGgvdHdpdGNoL2NhbGxiYWNrXCIsXG4gICAgICAgICAgICBzY29wZTogXCJ1c2VyX3JlYWRcIlxuICAgICAgICB9LFxuICAgICAgICBhc3luYyBmdW5jdGlvbiAoYWNjZXNzVG9rZW4sIHJlZnJlc2hUb2tlbiwgcHJvZmlsZSwgZG9uZSkge1xuXG4gICAgICAgICAgICAvL0ZpbmQgb3IgY3JlYXRlXG4gICAgICAgICAgICBsZXQgdXNlcnMgPSBhd2FpdCBVc2VyLmZpbmQoe3R3aXRjaElkOiBwcm9maWxlLmlkfSk7XG5cbiAgICAgICAgICAgIGlmICh1c2Vycy5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICAgICAgLy9NZXQgw6Agam91clxuICAgICAgICAgICAgICAgIGxldCB1c2VyID0gdXNlcnNbMF07XG5cbiAgICAgICAgICAgICAgICB1c2VyLnVzZXJuYW1lID0gcHJvZmlsZS5sb2dpbjtcbiAgICAgICAgICAgICAgICB1c2VyLmRpc3BsYXlfbmFtZSA9IHByb2ZpbGUuZGlzcGxheV9uYW1lO1xuICAgICAgICAgICAgICAgIHVzZXIuYXZhdGFyID0gcHJvZmlsZS5wcm9maWxlX2ltYWdlX3VybDtcblxuICAgICAgICAgICAgICAgIGF3YWl0IHVzZXIuc2F2ZSgpO1xuXG4gICAgICAgICAgICAgICAgZG9uZShudWxsLCB1c2VyKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIGxldCBuZXdVc2VyID0gbmV3IFVzZXIoKTtcblxuICAgICAgICAgICAgICAgIG5ld1VzZXIudHdpdGNoSWQgPSBwcm9maWxlLmlkO1xuICAgICAgICAgICAgICAgIG5ld1VzZXIudXNlcm5hbWUgPSBwcm9maWxlLmxvZ2luO1xuICAgICAgICAgICAgICAgIG5ld1VzZXIuZGlzcGxheV9uYW1lID0gcHJvZmlsZS5kaXNwbGF5X25hbWU7XG4gICAgICAgICAgICAgICAgbmV3VXNlci5hdmF0YXIgPSBwcm9maWxlLnByb2ZpbGVfaW1hZ2VfdXJsO1xuXG4gICAgICAgICAgICAgICAgYXdhaXQgbmV3VXNlci5zYXZlKCk7XG5cbiAgICAgICAgICAgICAgICBkb25lKG51bGwsIG5ld1VzZXIpO1xuXG4gICAgICAgICAgICB9XG5cbiAgICAgICAgfSkpO1xuICAgIHBhc3Nwb3J0LnNlcmlhbGl6ZVVzZXIoZnVuY3Rpb24gKHVzZXIsIGRvbmUpIHtcbiAgICAgICAgZG9uZShudWxsLCB1c2VyLnR3aXRjaElkKTtcbiAgICB9KTtcbiAgICBwYXNzcG9ydC5kZXNlcmlhbGl6ZVVzZXIoZnVuY3Rpb24gKHR3aXRjaElkLCBkb25lKSB7XG4gICAgICAgIFVzZXIuZmluZE9uZSh7dHdpdGNoSWQ6IHR3aXRjaElkfSkudGhlbigodXNlcikgPT4ge1xuICAgICAgICAgICAgbGV0IHJlYWxVc2VyID0gdXNlciA9PSB1bmRlZmluZWQgPyBmYWxzZSA6IHVzZXI7XG4gICAgICAgICAgICBkb25lKG51bGwsIHJlYWxVc2VyKTtcbiAgICAgICAgfSk7XG4gICAgfSk7XG5cbiAgICBhcHAudXNlKHBhc3Nwb3J0LmluaXRpYWxpemUoKSk7ICAgLy8gcGFzc3BvcnQgaW5pdGlhbGl6ZSBtaWRkbGV3YXJlXG4gICAgYXBwLnVzZShwYXNzcG9ydC5zZXNzaW9uKCkpOyAgICAgIC8vIHBhc3Nwb3J0IHNlc3Npb24gbWlkZGxld2FyZVxuXG4gICAgLy9QYXJyYWluYWdlXG4gICAgLyphcHAudXNlKGFzeW5jIChyZXEsIHJlczogRXhwcmVzcy5SZXNwb25zZSwgZG9uZSkgPT4ge1xuXG4gICAgICAgIGlmIChyZXEucXVlcnkucGFycmFpbl9pZCAhPSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgIHJlcS5zZXNzaW9uLnBhcnJhaW5faWQgPSByZXEucXVlcnkucGFycmFpbl9pZDtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChyZXEuaXNBdXRoZW50aWNhdGVkKCkgJiYgcmVxLnNlc3Npb24ucGFycmFpbl9pZCAhPSB1bmRlZmluZWQgJiYgcmVxLnVzZXIucGFycmFpbiA9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgIHJlcS51c2VyLnBhcnJhaW4gPSBhd2FpdCBVc2VyLmZpbmRPbmUoe3doZXJlOiB7cGFycmFpbmFnZV9pZDogcmVxLnNlc3Npb24ucGFycmFpbl9pZH19KTtcbiAgICAgICAgICAgIGF3YWl0IHJlcS51c2VyLnNhdmUoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGRvbmUoKTtcblxuICAgIH0pOyovXG5cbiAgICAvL1N0cmVhbVF1ZXVlXG4gICAgLyogYXN5bmMgZnVuY3Rpb24gdXBkYXRlKCkge1xuICAgICAgICAgYXdhaXQgdXBkYXRlU3RyZWFtUXVldWUoKS5jYXRjaChyZWFzb24gPT4ge1xuICAgICAgICAgICAgIGNvbnNvbGUubG9nKHJlYXNvbik7XG4gICAgICAgICB9KTtcbiAgICAgICAgIHNldFRpbWVvdXQodXBkYXRlLCAxMDAwKTtcbiAgICAgfVxuXG4gICAgIHVwZGF0ZSgpLmNhdGNoKHJlYXNvbiA9PiBjb25zb2xlLmxvZyhyZWFzb24pKTsqL1xuICAgIC8qYXBwLnVzZShhc3luYyAocmVxLCByZXM6IEV4cHJlc3MuUmVzcG9uc2UsIGRvbmUpID0+IHtcbiAgICAgICAgYXdhaXQgdXBkYXRlU3RyZWFtUXVldWUoKTtcbiAgICAgICAgZG9uZSgpO1xuICAgIH0pOyovXG5cbiAgICAvL1JvdXRlc1xuICAgIGFwcC51c2UoJy8nLCBpbmRleFJvdXRlcik7XG4gICAgYXBwLnVzZSgnL2Nhc2UnLCBjYXNlUm91dGVyKTtcbiAgICBhcHAudXNlKCcvcGFycmFpbmFnZScsIHBhcnJhaW5hZ2VSb3V0ZXIpO1xuICAgIGFwcC51c2UoJy9naXZlYXdheScsIGdpdmVhd2F5Um91dGVyKTtcbiAgICBhcHAudXNlKCcvY291cG9uJywgY291cG9uUm91dGVyKTtcbiAgICBhcHAudXNlKCcvcG9pbnRzJywgcG9pbnRzUm91dGVyKTtcbiAgICBhcHAudXNlKCcvd2F0Y2gnLCB3YXRjaFJvdXRlcik7XG4gICAgYXBwLnVzZSgnL3Nob3AnLCBzaG9wUm91dGVyKTtcbiAgICBhcHAudXNlKCcvc3R1ZmZzaG9wJywgc3R1ZmZzaG9wUm91dGVyKTtcbiAgICBhcHAudXNlKCcvYWRtaW4nLCBhZG1pblJvdXRlcik7XG5cbiAgICBhcHAuZ2V0KFwiL2F1dGgvdHdpdGNoXCIsIHBhc3Nwb3J0LmF1dGhlbnRpY2F0ZShcInR3aXRjaFwiKSk7XG4gICAgYXBwLmdldChcIi9hdXRoL3R3aXRjaC9jYWxsYmFja1wiLCBwYXNzcG9ydC5hdXRoZW50aWNhdGUoXCJ0d2l0Y2hcIiwge2ZhaWx1cmVSZWRpcmVjdDogXCIvXCJ9KSwgZnVuY3Rpb24gKHJlcSwgcmVzKSB7XG4gICAgICAgIHJlcy5yZWRpcmVjdChcIi9cIik7XG4gICAgfSk7XG5cblxuICAgIC8vU3luYyBjYXNlc1xuICAgIGF3YWl0IHN5bmNDYXNlcyhjYXNlc0NvbnRlbnQpO1xuICAgIGF3YWl0IHN5bmNQcm9kdWN0cygpO1xuXG59KS5jYXRjaChlcnJvciA9PiBjb25zb2xlLmxvZyhlcnJvcikpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGFwcDtcbiJdfQ==