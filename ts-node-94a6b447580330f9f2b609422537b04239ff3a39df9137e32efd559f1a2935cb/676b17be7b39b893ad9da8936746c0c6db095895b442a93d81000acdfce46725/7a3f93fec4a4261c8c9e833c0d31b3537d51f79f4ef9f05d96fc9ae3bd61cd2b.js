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
                //user.email = profile._json.email;
                user.avatar = profile.profile_image_url;
                yield user.save();
                done(null, user);
            }
            else {
                let newUser = new User_1.User();
                newUser.twitchId = profile.id;
                newUser.username = profile.login;
                newUser.display_name = profile.display_name;
                newUser.email = null;
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
    app.get("/auth/twitch", passport.authenticate("twitch"));
    app.get("/auth/twitch/callback", passport.authenticate("twitch", { failureRedirect: "/" }), function (req, res) {
        res.redirect("/");
    });
    //Sync cases
    yield Case_1.syncCases(CaseContent_1.casesContent);
    yield Product_1.syncProducts();
})).catch(error => console.log(error));
module.exports = app;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiL1N0cmVhbVJ1bm5lcnMvVHdpdGNoVmlldy9hcHAudHMiLCJzb3VyY2VzIjpbIi9TdHJlYW1SdW5uZXJzL1R3aXRjaFZpZXcvYXBwLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7QUFBQSw0QkFBMEI7QUFDMUIscUNBQXlDO0FBQ3pDLGlEQUE0QztBQUc1QyxpREFBaUQ7QUFDakQscURBQWlEO0FBRWpELDRCQUEwQjtBQUUxQix1REFBZ0U7QUFDaEUsTUFBTSxNQUFNLEdBQUcsT0FBTyxDQUFDLFFBQVEsQ0FBQyxDQUFDO0FBRWpDLE1BQU0sT0FBTyxHQUFHLE9BQU8sQ0FBQyxTQUFTLENBQUMsQ0FBQztBQUNuQyxNQUFNLElBQUksR0FBRyxPQUFPLENBQUMsTUFBTSxDQUFDLENBQUM7QUFDN0IsTUFBTSxZQUFZLEdBQUcsT0FBTyxDQUFDLGVBQWUsQ0FBQyxDQUFDO0FBQzlDLE1BQU0sYUFBYSxHQUFHLE9BQU8sQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDO0FBQ2hELE1BQU0sTUFBTSxHQUFHLE9BQU8sQ0FBQyxRQUFRLENBQUMsQ0FBQztBQUNqQyxNQUFNLGVBQWUsR0FBRyxPQUFPLENBQUMsa0JBQWtCLENBQUMsQ0FBQztBQUNwRCxNQUFNLFFBQVEsR0FBRyxPQUFPLENBQUMsVUFBVSxDQUFDLENBQUM7QUFDckMsTUFBTSxjQUFjLEdBQUcsT0FBTyxDQUFDLHFCQUFxQixDQUFDLENBQUMsUUFBUSxDQUFDO0FBQy9ELE1BQU0sV0FBVyxHQUFHLE9BQU8sQ0FBQyxhQUFhLENBQUMsQ0FBQztBQUMzQyxNQUFNLE1BQU0sR0FBRyxPQUFPLENBQUMsUUFBUSxDQUFDLENBQUM7QUFDakMsTUFBTSxPQUFPLEdBQUcsT0FBTyxDQUFDLFlBQVksQ0FBQyxDQUFDO0FBRXRDLE1BQU07QUFDTixPQUFPLENBQUMsUUFBUSxDQUFDLENBQUMsTUFBTSxFQUFFLENBQUM7QUFFM0IsYUFBYTtBQUNiLElBQUksV0FBVyxHQUFHLE9BQU8sQ0FBQyxnQkFBZ0IsQ0FB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QUFDO0lBQzFCLEdBQUcsQ0FBQyxHQUFHLENBQUMsT0FBTyxFQUFFLFVBQVUsQ0FBQyxDQUFDO0lBQzdCLEdBQUcsQ0FBQyxHQUFHLENBQUMsYUFBYSxFQUFFLGdCQUFnQixDQUFDLENBQUM7SUFDekMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxXQUFXLEVBQUUsY0FBYyxDQUFDLENBQUM7SUFDckMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxTQUFTLEVBQUUsWUFBWSxDQUFDLENBQUM7SUFDakMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxTQUFTLEVBQUUsWUFBWSxDQUFDLENBQUM7SUFDakMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxRQUFRLEVBQUUsV0FBVyxDQUFDLENBQUM7SUFDL0IsR0FBRyxDQUFDLEdBQUcsQ0FBQyxPQUFPLEVBQUUsVUFBVSxDQUFDLENBQUM7SUFFN0IsR0FBRyxDQUFDLEdBQUcsQ0FBQyxjQUFjLEVBQUUsUUFBUSxDQUFDLFlBQVksQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDO0lBQ3pELEdBQUcsQ0FBQyxHQUFHLENBQUMsdUJBQXVCLEVBQUUsUUFBUSxDQUFDLFlBQVksQ0FBQyxRQUFRLEVBQUUsRUFBQyxlQUFlLEVBQUUsR0FBRyxFQUFDLENBQUMsRUFBRSxVQUFVLEdBQUcsRUFBRSxHQUFHO1FBQ3hHLEdBQUcsQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLENBQUM7SUFDdEIsQ0FBQyxDQUFDLENBQUM7SUFHSCxZQUFZO0lBQ1osTUFBTSxnQkFBUyxDQUFDLDBCQUFZLENBQUMsQ0FBQztJQUM5QixNQUFNLHNCQUFZLEVBQUUsQ0FBQztBQUV6QixDQUFDLENBQUEsQ0FBQyxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsRUFBRSxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQztBQUV0QyxNQUFNLENBQUMsT0FBTyxHQUFHLEdBQUcsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBcInJlZmxlY3QtbWV0YWRhdGFcIjtcbmltcG9ydCB7Y3JlYXRlQ29ubmVjdGlvbn0gZnJvbSBcInR5cGVvcm1cIjtcbmltcG9ydCB7VXNlcn0gZnJvbSBcIi4vZGF0YWJhc2UvZW50aXR5L1VzZXJcIjtcbmltcG9ydCB7dXBkYXRlU3RyZWFtUXVldWV9IGZyb20gXCIuL2RhdGFiYXNlL2VudGl0eS9TdHJlYW1RdWV1ZVwiO1xuaW1wb3J0IHtzeW5jfSBmcm9tIFwiZ2xvYlwiO1xuaW1wb3J0IHtzeW5jQ2FzZXN9IGZyb20gXCIuL2RhdGFiYXNlL2VudGl0eS9DYXNlXCI7XG5pbXBvcnQge2Nhc2VzQ29udGVudH0gZnJvbSBcIi4vb3RoZXIvQ2FzZUNvbnRlbnRcIjtcblxuaW1wb3J0IFwicmVmbGVjdC1tZXRhZGF0YVwiO1xuaW1wb3J0ICogYXMgY2hpbGRfcHJvY2VzcyBmcm9tIFwiY2hpbGRfcHJvY2Vzc1wiO1xuaW1wb3J0IHtQcm9kdWN0LCBzeW5jUHJvZHVjdHN9IGZyb20gXCIuL2RhdGFiYXNlL2VudGl0eS9Qcm9kdWN0XCI7XG5jb25zdCBtb21lbnQgPSByZXF1aXJlKFwibW9tZW50XCIpO1xuXG5jb25zdCBleHByZXNzID0gcmVxdWlyZSgnZXhwcmVzcycpO1xuY29uc3QgcGF0aCA9IHJlcXVpcmUoJ3BhdGgnKTtcbmNvbnN0IGNvb2tpZVBhcnNlciA9IHJlcXVpcmUoJ2Nvb2tpZS1wYXJzZXInKTtcbmNvbnN0IGNvb2tpZVNlc3Npb24gPSByZXF1aXJlKCdjb29raWUtc2Vzc2lvbicpO1xuY29uc3QgbG9nZ2VyID0gcmVxdWlyZSgnbW9yZ2FuJyk7XG5jb25zdCBleHByZXNzTnVuanVja3MgPSByZXF1aXJlKCdleHByZXNzLW51bmp1Y2tzJyk7XG5jb25zdCBwYXNzcG9ydCA9IHJlcXVpcmUoJ3Bhc3Nwb3J0Jyk7XG5jb25zdCB0d2l0Y2hTdHJhdGVneSA9IHJlcXVpcmUoXCJwYXNzcG9ydC10d2l0Y2gtbmV3XCIpLlN0cmF0ZWd5O1xuY29uc3QgY29tcHJlc3Npb24gPSByZXF1aXJlKCdjb21wcmVzc2lvbicpO1xuY29uc3QgaGVsbWV0ID0gcmVxdWlyZSgnaGVsbWV0Jyk7XG5jb25zdCBEaXNjb3JkID0gcmVxdWlyZShcImRpc2NvcmQuanNcIik7XG5cbi8vLmVudlxucmVxdWlyZShcImRvdGVudlwiKS5jb25maWcoKTtcblxuLy9Mb2FkIHJvdXRlc1xudmFyIGluZGV4Um91dGVyID0gcmVxdWlyZSgnLi9yb3V0ZXMvaW5kZXgnKTtcbnZhciBjYXNlUm91dGVyID0gcmVxdWlyZSgnLi9yb3V0ZXMvY2FzZScpO1xudmFyIHNob3BSb3V0ZXIgPSByZXF1aXJlKCcuL3JvdXRlcy9zaG9wJyk7XG52YXIgcGFycmFpbmFnZVJvdXRlciA9IHJlcXVpcmUoJy4vcm91dGVzL3BhcnJhaW5hZ2UnKTtcbnZhciBnaXZlYXdheVJvdXRlciA9IHJlcXVpcmUoJy4vcm91dGVzL2dpdmVhd2F5Jyk7XG52YXIgY291cG9uUm91dGVyID0gcmVxdWlyZSgnLi9yb3V0ZXMvY291cG9uJyk7XG52YXIgcG9pbnRzUm91dGVyID0gcmVxdWlyZSgnLi9yb3V0ZXMvcG9pbnRzJyk7XG52YXIgd2F0Y2hSb3V0ZXIgPSByZXF1aXJlKCcuL3JvdXRlcy93YXRjaCcpO1xudmFyIHNob3BSb3V0ZXIgPSByZXF1aXJlKCcuL3JvdXRlcy9zaG9wJyk7XG5cbi8vQXBwXG52YXIgYXBwID0gZXhwcmVzcygpO1xuXG5nbG9iYWxbJ2Rpc2NvcmRBbnRpU3BhbURhdGUnXSA9IG1vbWVudCgpLnN1YnRyYWN0KFwiMjBcIiwgXCJob3Vyc1wiKTtcblxuLy9EQlxuY3JlYXRlQ29ubmVjdGlvbigpLnRoZW4oYXN5bmMgKCkgPT4ge1xuXG4gICAgY29uc3QgaXNEZXYgPSBhcHAuZ2V0KCdlbnYnKSA9PT0gJ2RldmVsb3BtZW50JztcblxuICAgIC8vTnVuanVja3NcbiAgICBhcHAuc2V0KCd2aWV3cycsIF9fZGlybmFtZSArICcvdmlld3MnKTtcbiAgICBhcHAuc2V0KFwidmlldyBlbmdpbmVcIiwgXCJudW5qXCIpO1xuICAgIGNvbnN0IG5qayA9IGV4cHJlc3NOdW5qdWNrcyhhcHAsIHtcbiAgICAgICAgd2F0Y2g6IGlzRGV2LFxuICAgICAgICBub0NhY2hlOiBpc0RldixcbiAgICAgICAgZ2xvYmFsczoge1xuICAgICAgICAgICAgSE9TVE5BTUU6IHByb2Nlc3MuZW52LkhPU1ROQU1FXG4gICAgICAgIH1cbiAgICB9KTtcblxuICAgIC8vRGlzY29yZFxuICAgIGNvbnN0IGNsaWVudCA9IG5ldyBEaXNjb3JkLkNsaWVudCgpO1xuICAgIGF3YWl0IGNsaWVudC5sb2dpbihwcm9jZXNzLmVudi5ESVNDT1JEX1RPS0VOKTtcbiAgICBjbGllbnQudXNlci5zZXRBY3Rpdml0eShcIlN0cmVhbVJ1bm5lcnMuZnJcIiwge3R5cGU6IFwiV0FUQ0hJTkdcIn0pO1xuICAgIGFwcC51c2UoKHJlcSwgcmVzLCBuZXh0KSA9PiB7XG4gICAgICAgIHJlcS5kaXNjb3JkID0gY2xpZW50O1xuICAgICAgICBuZXh0KCk7XG4gICAgfSk7XG5cbiAgICBhcHAudXNlKGxvZ2dlcignZGV2JykpO1xuICAgIGFwcC51c2UoZXhwcmVzcy5qc29uKCkpO1xuICAgIGFwcC51c2UoZXhwcmVzcy51cmxlbmNvZGVkKHtleHRlbmRlZDogZmFsc2V9KSk7XG4gICAgYXBwLnVzZShjb29raWVQYXJzZXIoKSk7XG5cblxuICAgIGFwcC51c2UoY29tcHJlc3Npb24oKSk7XG4gICAgYXBwLnVzZShoZWxtZXQoKSk7XG5cbiAgICBhcHAudXNlKGV4cHJlc3Muc3RhdGljKHBhdGguam9pbihfX2Rpcm5hbWUsICdwdWJsaWMnKSkpO1xuXG4gICAgYXBwLnVzZShjb29raWVTZXNzaW9uKHtrZXlzOiBbcHJvY2Vzcy5lbnYuQ09PS0lFX0tFWV19KSk7IC8vIEV4cHJlc3MgY29va2llIHNlc3Npb24gbWlkZGxld2FyZVxuXG4gICAgLy9QYXNzcG9ydFxuICAgIHBhc3Nwb3J0LnVzZShuZXcgdHdpdGNoU3RyYXRlZ3koe1xuICAgICAgICAgICAgY2xpZW50SUQ6IHByb2Nlc3MuZW52LlRXSVRDSF9DTElFTlRfSUQsXG4gICAgICAgICAgICBjbGllbnRTZWNyZXQ6IHByb2Nlc3MuZW52LlRXSVRDSF9DTElFTlRfU0VDUkVULFxuICAgICAgICAgICAgY2FsbGJhY2tVUkw6IHByb2Nlc3MuZW52LkhPU1ROQU1FICsgXCIvYXV0aC90d2l0Y2gvY2FsbGJhY2tcIixcbiAgICAgICAgICAgIHNjb3BlOiBcInVzZXJfcmVhZFwiXG4gICAgICAgIH0sXG4gICAgICAgIGFzeW5jIGZ1bmN0aW9uIChhY2Nlc3NUb2tlbiwgcmVmcmVzaFRva2VuLCBwcm9maWxlLCBkb25lKSB7XG5cbiAgICAgICAgICAgIC8vRmluZCBvciBjcmVhdGVcbiAgICAgICAgICAgIGxldCB1c2VycyA9IGF3YWl0IFVzZXIuZmluZCh7dHdpdGNoSWQ6IHByb2ZpbGUuaWR9KTtcblxuICAgICAgICAgICAgaWYgKHVzZXJzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgICAgICAvL01ldCDDoCBqb3VyXG4gICAgICAgICAgICAgICAgbGV0IHVzZXIgPSB1c2Vyc1swXTtcblxuICAgICAgICAgICAgICAgIHVzZXIudXNlcm5hbWUgPSBwcm9maWxlLmxvZ2luO1xuICAgICAgICAgICAgICAgIHVzZXIuZGlzcGxheV9uYW1lID0gcHJvZmlsZS5kaXNwbGF5X25hbWU7XG4gICAgICAgICAgICAgICAgLy91c2VyLmVtYWlsID0gcHJvZmlsZS5fanNvbi5lbWFpbDtcbiAgICAgICAgICAgICAgICB1c2VyLmF2YXRhciA9IHByb2ZpbGUucHJvZmlsZV9pbWFnZV91cmw7XG5cbiAgICAgICAgICAgICAgICBhd2FpdCB1c2VyLnNhdmUoKTtcblxuICAgICAgICAgICAgICAgIGRvbmUobnVsbCwgdXNlcik7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICBsZXQgbmV3VXNlciA9IG5ldyBVc2VyKCk7XG5cbiAgICAgICAgICAgICAgICBuZXdVc2VyLnR3aXRjaElkID0gcHJvZmlsZS5pZDtcbiAgICAgICAgICAgICAgICBuZXdVc2VyLnVzZXJuYW1lID0gcHJvZmlsZS5sb2dpbjtcbiAgICAgICAgICAgICAgICBuZXdVc2VyLmRpc3BsYXlfbmFtZSA9IHByb2ZpbGUuZGlzcGxheV9uYW1lO1xuICAgICAgICAgICAgICAgIG5ld1VzZXIuZW1haWwgPSBudWxsO1xuICAgICAgICAgICAgICAgIG5ld1VzZXIuYXZhdGFyID0gcHJvZmlsZS5wcm9maWxlX2ltYWdlX3VybDtcblxuICAgICAgICAgICAgICAgIGF3YWl0IG5ld1VzZXIuc2F2ZSgpO1xuXG4gICAgICAgICAgICAgICAgZG9uZShudWxsLCBuZXdVc2VyKTtcblxuICAgICAgICAgICAgfVxuXG4gICAgICAgIH0pKTtcbiAgICBwYXNzcG9ydC5zZXJpYWxpemVVc2VyKGZ1bmN0aW9uICh1c2VyLCBkb25lKSB7XG4gICAgICAgIGRvbmUobnVsbCwgdXNlci50d2l0Y2hJZCk7XG4gICAgfSk7XG4gICAgcGFzc3BvcnQuZGVzZXJpYWxpemVVc2VyKGZ1bmN0aW9uICh0d2l0Y2hJZCwgZG9uZSkge1xuICAgICAgICBVc2VyLmZpbmRPbmUoe3R3aXRjaElkOiB0d2l0Y2hJZH0pLnRoZW4oKHVzZXIpID0+IHtcbiAgICAgICAgICAgIGxldCByZWFsVXNlciA9IHVzZXIgPT0gdW5kZWZpbmVkID8gZmFsc2UgOiB1c2VyO1xuICAgICAgICAgICAgZG9uZShudWxsLCByZWFsVXNlcik7XG4gICAgICAgIH0pO1xuICAgIH0pO1xuXG4gICAgYXBwLnVzZShwYXNzcG9ydC5pbml0aWFsaXplKCkpOyAgIC8vIHBhc3Nwb3J0IGluaXRpYWxpemUgbWlkZGxld2FyZVxuICAgIGFwcC51c2UocGFzc3BvcnQuc2Vzc2lvbigpKTsgICAgICAvLyBwYXNzcG9ydCBzZXNzaW9uIG1pZGRsZXdhcmVcblxuICAgIC8vUGFycmFpbmFnZVxuICAgIC8qYXBwLnVzZShhc3luYyAocmVxLCByZXM6IEV4cHJlc3MuUmVzcG9uc2UsIGRvbmUpID0+IHtcblxuICAgICAgICBpZiAocmVxLnF1ZXJ5LnBhcnJhaW5faWQgIT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICByZXEuc2Vzc2lvbi5wYXJyYWluX2lkID0gcmVxLnF1ZXJ5LnBhcnJhaW5faWQ7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAocmVxLmlzQXV0aGVudGljYXRlZCgpICYmIHJlcS5zZXNzaW9uLnBhcnJhaW5faWQgIT0gdW5kZWZpbmVkICYmIHJlcS51c2VyLnBhcnJhaW4gPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICByZXEudXNlci5wYXJyYWluID0gYXdhaXQgVXNlci5maW5kT25lKHt3aGVyZToge3BhcnJhaW5hZ2VfaWQ6IHJlcS5zZXNzaW9uLnBhcnJhaW5faWR9fSk7XG4gICAgICAgICAgICBhd2FpdCByZXEudXNlci5zYXZlKCk7XG4gICAgICAgIH1cblxuICAgICAgICBkb25lKCk7XG5cbiAgICB9KTsqL1xuXG4gICAgLy9TdHJlYW1RdWV1ZVxuICAgIC8qIGFzeW5jIGZ1bmN0aW9uIHVwZGF0ZSgpIHtcbiAgICAgICAgIGF3YWl0IHVwZGF0ZVN0cmVhbVF1ZXVlKCkuY2F0Y2gocmVhc29uID0+IHtcbiAgICAgICAgICAgICBjb25zb2xlLmxvZyhyZWFzb24pO1xuICAgICAgICAgfSk7XG4gICAgICAgICBzZXRUaW1lb3V0KHVwZGF0ZSwgMTAwMCk7XG4gICAgIH1cblxuICAgICB1cGRhdGUoKS5jYXRjaChyZWFzb24gPT4gY29uc29sZS5sb2cocmVhc29uKSk7Ki9cbiAgICAvKmFwcC51c2UoYXN5bmMgKHJlcSwgcmVzOiBFeHByZXNzLlJlc3BvbnNlLCBkb25lKSA9PiB7XG4gICAgICAgIGF3YWl0IHVwZGF0ZVN0cmVhbVF1ZXVlKCk7XG4gICAgICAgIGRvbmUoKTtcbiAgICB9KTsqL1xuXG4gICAgLy9Sb3V0ZXNcbiAgICBhcHAudXNlKCcvJywgaW5kZXhSb3V0ZXIpO1xuICAgIGFwcC51c2UoJy9jYXNlJywgY2FzZVJvdXRlcik7XG4gICAgYXBwLnVzZSgnL3BhcnJhaW5hZ2UnLCBwYXJyYWluYWdlUm91dGVyKTtcbiAgICBhcHAudXNlKCcvZ2l2ZWF3YXknLCBnaXZlYXdheVJvdXRlcik7XG4gICAgYXBwLnVzZSgnL2NvdXBvbicsIGNvdXBvblJvdXRlcik7XG4gICAgYXBwLnVzZSgnL3BvaW50cycsIHBvaW50c1JvdXRlcik7XG4gICAgYXBwLnVzZSgnL3dhdGNoJywgd2F0Y2hSb3V0ZXIpO1xuICAgIGFwcC51c2UoJy9zaG9wJywgc2hvcFJvdXRlcik7XG5cbiAgICBhcHAuZ2V0KFwiL2F1dGgvdHdpdGNoXCIsIHBhc3Nwb3J0LmF1dGhlbnRpY2F0ZShcInR3aXRjaFwiKSk7XG4gICAgYXBwLmdldChcIi9hdXRoL3R3aXRjaC9jYWxsYmFja1wiLCBwYXNzcG9ydC5hdXRoZW50aWNhdGUoXCJ0d2l0Y2hcIiwge2ZhaWx1cmVSZWRpcmVjdDogXCIvXCJ9KSwgZnVuY3Rpb24gKHJlcSwgcmVzKSB7XG4gICAgICAgIHJlcy5yZWRpcmVjdChcIi9cIik7XG4gICAgfSk7XG5cblxuICAgIC8vU3luYyBjYXNlc1xuICAgIGF3YWl0IHN5bmNDYXNlcyhjYXNlc0NvbnRlbnQpO1xuICAgIGF3YWl0IHN5bmNQcm9kdWN0cygpO1xuXG59KS5jYXRjaChlcnJvciA9PiBjb25zb2xlLmxvZyhlcnJvcikpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGFwcDtcbiJdfQ==