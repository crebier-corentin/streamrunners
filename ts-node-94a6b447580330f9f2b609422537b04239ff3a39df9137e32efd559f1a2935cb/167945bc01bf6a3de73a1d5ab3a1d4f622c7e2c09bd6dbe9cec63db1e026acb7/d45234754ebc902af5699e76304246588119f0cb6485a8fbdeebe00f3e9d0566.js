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
    client.user.setActivity("TV", { type: "WATCHING" });
    app.use((req, res, next) => {
        req.discord = client;
        next();
    });
    //Maintenance
    if (process.env.MAINTENANCE.toLowerCase() === "true") {
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiL1N0cmVhbVJ1bm5lcnMvVHdpdGNoVmlldy9hcHAudHMiLCJzb3VyY2VzIjpbIi9TdHJlYW1SdW5uZXJzL1R3aXRjaFZpZXcvYXBwLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7O0FBQUEsNEJBQTBCO0FBQzFCLHFDQUF5QztBQUN6QyxpREFBNEM7QUFHNUMsaURBQWlEO0FBQ2pELHFEQUFpRDtBQUVqRCw0QkFBMEI7QUFFMUIsdURBQWdFO0FBRWhFLE1BQU0sTUFBTSxHQUFHLE9BQU8sQ0FBQyxRQUFRLENBQUMsQ0FBQztBQUVqQyxNQUFNLE9BQU8sR0FBRyxPQUFPLENBQUMsU0FBUyxDQUFDLENBQUM7QUFDbkMsTUFBTSxJQUFJLEdBQUcsT0FBTyxDQUFDLE1BQU0sQ0FBQyxDQUFDO0FBQzdCLE1BQU0sWUFBWSxHQUFHLE9BQU8sQ0FBQyxlQUFlLENBQUMsQ0FBQztBQUM5QyxNQUFNLGFBQWEsR0FBRyxPQUFPLENBQUMsZ0JBQWdCLENBQUMsQ0FBQztBQUNoRCxNQUFNLE1BQU0sR0FBRyxPQUFPLENBQUMsUUFBUSxDQUFDLENBQUM7QUFDakMsTUFBTSxlQUFlLEdBQUcsT0FBTyxDQUFDLGtCQUFrQixDQUFDLENBQUM7QUFDcEQsTUFBTSxRQUFRLEdBQUcsT0FBTyxDQUFDLFVBQVUsQ0FBQyxDQUFDO0FBQ3JDLE1BQU0sY0FBYyxHQUFHLE9BQU8sQ0FBQyxxQkFBcUIsQ0FBQyxDQUFDLFFBQVEsQ0FBQztBQUMvRCxNQUFNLFdBQVcsR0FBRyxPQUFPLENBQUMsYUFBYSxDQUFDLENBQUM7QUFDM0MsTUFBTSxNQUFNLEdBQUcsT0FBTyxDQUFDLFFBQVEsQ0FBQyxDQUFDO0FBQ2pDLE1BQU0sT0FBTyxHQUFHLE9BQU8sQ0FBQyxZQUFZLENBQUMsQ0FBQztBQUV0QyxNQUFNO0FBQ04sT0FBTyxDQUFDLFFBQVEsQ0FBQyxDQUFDLE1BQU0sRUFBRSxDQUFDO0FBRTNCLGFBQWE7QUFDYixJQUFJLFdBQVcsR0FBRyxPQUFPLENBQUMsZ0JBQWdCLENB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LFVBQVUsR0FBRyxFQUFFLEdBQUc7UUFDeEcsR0FBRyxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsQ0FBQztJQUN0QixDQUFDLENBQUMsQ0FBQztJQUdILFlBQVk7SUFDWixNQUFNLGdCQUFTLENBQUMsMEJBQVksQ0FBQyxDQUFDO0lBQzlCLE1BQU0sc0JBQVksRUFBRSxDQUFDO0FBRXpCLENBQUMsQ0FBQSxDQUFDLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxFQUFFLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDO0FBRXRDLE1BQU0sQ0FBQyxPQUFPLEdBQUcsR0FBRyxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IFwicmVmbGVjdC1tZXRhZGF0YVwiO1xuaW1wb3J0IHtjcmVhdGVDb25uZWN0aW9ufSBmcm9tIFwidHlwZW9ybVwiO1xuaW1wb3J0IHtVc2VyfSBmcm9tIFwiLi9kYXRhYmFzZS9lbnRpdHkvVXNlclwiO1xuaW1wb3J0IHt1cGRhdGVTdHJlYW1RdWV1ZX0gZnJvbSBcIi4vZGF0YWJhc2UvZW50aXR5L1N0cmVhbVF1ZXVlXCI7XG5pbXBvcnQge3N5bmN9IGZyb20gXCJnbG9iXCI7XG5pbXBvcnQge3N5bmNDYXNlc30gZnJvbSBcIi4vZGF0YWJhc2UvZW50aXR5L0Nhc2VcIjtcbmltcG9ydCB7Y2FzZXNDb250ZW50fSBmcm9tIFwiLi9vdGhlci9DYXNlQ29udGVudFwiO1xuXG5pbXBvcnQgXCJyZWZsZWN0LW1ldGFkYXRhXCI7XG5pbXBvcnQgKiBhcyBjaGlsZF9wcm9jZXNzIGZyb20gXCJjaGlsZF9wcm9jZXNzXCI7XG5pbXBvcnQge1Byb2R1Y3QsIHN5bmNQcm9kdWN0c30gZnJvbSBcIi4vZGF0YWJhc2UvZW50aXR5L1Byb2R1Y3RcIjtcblxuY29uc3QgbW9tZW50ID0gcmVxdWlyZShcIm1vbWVudFwiKTtcblxuY29uc3QgZXhwcmVzcyA9IHJlcXVpcmUoJ2V4cHJlc3MnKTtcbmNvbnN0IHBhdGggPSByZXF1aXJlKCdwYXRoJyk7XG5jb25zdCBjb29raWVQYXJzZXIgPSByZXF1aXJlKCdjb29raWUtcGFyc2VyJyk7XG5jb25zdCBjb29raWVTZXNzaW9uID0gcmVxdWlyZSgnY29va2llLXNlc3Npb24nKTtcbmNvbnN0IGxvZ2dlciA9IHJlcXVpcmUoJ21vcmdhbicpO1xuY29uc3QgZXhwcmVzc051bmp1Y2tzID0gcmVxdWlyZSgnZXhwcmVzcy1udW5qdWNrcycpO1xuY29uc3QgcGFzc3BvcnQgPSByZXF1aXJlKCdwYXNzcG9ydCcpO1xuY29uc3QgdHdpdGNoU3RyYXRlZ3kgPSByZXF1aXJlKFwicGFzc3BvcnQtdHdpdGNoLW5ld1wiKS5TdHJhdGVneTtcbmNvbnN0IGNvbXByZXNzaW9uID0gcmVxdWlyZSgnY29tcHJlc3Npb24nKTtcbmNvbnN0IGhlbG1ldCA9IHJlcXVpcmUoJ2hlbG1ldCcpO1xuY29uc3QgRGlzY29yZCA9IHJlcXVpcmUoXCJkaXNjb3JkLmpzXCIpO1xuXG4vLy5lbnZcbnJlcXVpcmUoXCJkb3RlbnZcIikuY29uZmlnKCk7XG5cbi8vTG9hZCByb3V0ZXNcbnZhciBpbmRleFJvdXRlciA9IHJlcXVpcmUoJy4vcm91dGVzL2luZGV4Jyk7XG52YXIgY2FzZVJvdXRlciA9IHJlcXVpcmUoJy4vcm91dGVzL2Nhc2UnKTtcbnZhciBzaG9wUm91dGVyID0gcmVxdWlyZSgnLi9yb3V0ZXMvc2hvcCcpO1xudmFyIHBhcnJhaW5hZ2VSb3V0ZXIgPSByZXF1aXJlKCcuL3JvdXRlcy9wYXJyYWluYWdlJyk7XG52YXIgZ2l2ZWF3YXlSb3V0ZXIgPSByZXF1aXJlKCcuL3JvdXRlcy9naXZlYXdheScpO1xudmFyIGNvdXBvblJvdXRlciA9IHJlcXVpcmUoJy4vcm91dGVzL2NvdXBvbicpO1xudmFyIHBvaW50c1JvdXRlciA9IHJlcXVpcmUoJy4vcm91dGVzL3BvaW50cycpO1xudmFyIHdhdGNoUm91dGVyID0gcmVxdWlyZSgnLi9yb3V0ZXMvd2F0Y2gnKTtcbnZhciBzaG9wUm91dGVyID0gcmVxdWlyZSgnLi9yb3V0ZXMvc2hvcCcpO1xudmFyIHN0dWZmc2hvcFJvdXRlciA9IHJlcXVpcmUoJy4vcm91dGVzL3N0dWZmc2hvcCcpO1xudmFyIGFkbWluUm91dGVyID0gcmVxdWlyZSgnLi9yb3V0ZXMvYWRtaW4nKTtcblxuLy9BcHBcbnZhciBhcHAgPSBleHByZXNzKCk7XG5cbmdsb2JhbFsnZGlzY29yZEFudGlTcGFtRGF0ZSddID0gbW9tZW50KCkuc3VidHJhY3QoXCIyMFwiLCBcImhvdXJzXCIpO1xuXG4vL0RCXG5jcmVhdGVDb25uZWN0aW9uKCkudGhlbihhc3luYyAoKSA9PiB7XG5cbiAgICBjb25zdCBpc0RldiA9IGFwcC5nZXQoJ2VudicpID09PSAnZGV2ZWxvcG1lbnQnO1xuXG4gICAgLy9OdW5qdWNrc1xuICAgIGFwcC5zZXQoJ3ZpZXdzJywgX19kaXJuYW1lICsgJy92aWV3cycpO1xuICAgIGFwcC5zZXQoXCJ2aWV3IGVuZ2luZVwiLCBcIm51bmpcIik7XG4gICAgY29uc3QgbmprID0gZXhwcmVzc051bmp1Y2tzKGFwcCwge1xuICAgICAgICB3YXRjaDogaXNEZXYsXG4gICAgICAgIG5vQ2FjaGU6IGlzRGV2LFxuICAgICAgICBnbG9iYWxzOiB7XG4gICAgICAgICAgICBIT1NUTkFNRTogcHJvY2Vzcy5lbnYuSE9TVE5BTUVcbiAgICAgICAgfVxuICAgIH0pO1xuXG4gICAgIC8vRGlzY29yZFxuICAgIGNvbnN0IGNsaWVudCA9IG5ldyBEaXNjb3JkLkNsaWVudCgpO1xuICAgIGF3YWl0IGNsaWVudC5sb2dpbihwcm9jZXNzLmVudi5ESVNDT1JEX1RPS0VOKTtcbiAgICBjbGllbnQudXNlci5zZXRBY3Rpdml0eShcIlRWXCIsIHt0eXBlOiBcIldBVENISU5HXCJ9KVxuICAgIGFwcC51c2UoKHJlcSwgcmVzLCBuZXh0KSA9PiB7XG4gICAgICAgIHJlcS5kaXNjb3JkID0gY2xpZW50O1xuICAgICAgICBuZXh0KCk7XG4gICAgfSk7XG5cblxuICAgIC8vTWFpbnRlbmFuY2VcbiAgICBpZiAocHJvY2Vzcy5lbnYuTUFJTlRFTkFOQ0UudG9Mb3dlckNhc2UoKSA9PT0gXCJ0cnVlXCIpIHtcbiAgICAgICAgYXBwLnVzZShcIipcIiwgKHJlcSwgcmVzKSA9PiB7XG4gICAgICAgICAgICByZXR1cm4gcmVzLnJlbmRlcihcIm1haW50ZW5hbmNlXCIpO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBhcHAudXNlKGxvZ2dlcignZGV2JykpO1xuICAgIGFwcC51c2UoZXhwcmVzcy5qc29uKCkpO1xuICAgIGFwcC51c2UoZXhwcmVzcy51cmxlbmNvZGVkKHtleHRlbmRlZDogZmFsc2V9KSk7XG4gICAgYXBwLnVzZShjb29raWVQYXJzZXIoKSk7XG5cblxuICAgIGFwcC51c2UoY29tcHJlc3Npb24oKSk7XG4gICAgYXBwLnVzZShoZWxtZXQoKSk7XG5cbiAgICBhcHAudXNlKGV4cHJlc3Muc3RhdGljKHBhdGguam9pbihfX2Rpcm5hbWUsICdwdWJsaWMnKSkpO1xuXG4gICAgYXBwLnVzZShjb29raWVTZXNzaW9uKHtrZXlzOiBbcHJvY2Vzcy5lbnYuQ09PS0lFX0tFWV19KSk7IC8vIEV4cHJlc3MgY29va2llIHNlc3Npb24gbWlkZGxld2FyZVxuXG4gICAgLy9QYXNzcG9ydFxuICAgIHBhc3Nwb3J0LnVzZShuZXcgdHdpdGNoU3RyYXRlZ3koe1xuICAgICAgICAgICAgY2xpZW50SUQ6IHByb2Nlc3MuZW52LlRXSVRDSF9DTElFTlRfSUQsXG4gICAgICAgICAgICBjbGllbnRTZWNyZXQ6IHByb2Nlc3MuZW52LlRXSVRDSF9DTElFTlRfU0VDUkVULFxuICAgICAgICAgICAgY2FsbGJhY2tVUkw6IHByb2Nlc3MuZW52LkhPU1ROQU1FICsgXCIvYXV0aC90d2l0Y2gvY2FsbGJhY2tcIixcbiAgICAgICAgICAgIHNjb3BlOiBcInVzZXJfcmVhZFwiXG4gICAgICAgIH0sXG4gICAgICAgIGFzeW5jIGZ1bmN0aW9uIChhY2Nlc3NUb2tlbiwgcmVmcmVzaFRva2VuLCBwcm9maWxlLCBkb25lKSB7XG5cbiAgICAgICAgICAgIC8vRmluZCBvciBjcmVhdGVcbiAgICAgICAgICAgIGxldCB1c2VycyA9IGF3YWl0IFVzZXIuZmluZCh7dHdpdGNoSWQ6IHByb2ZpbGUuaWR9KTtcblxuICAgICAgICAgICAgaWYgKHVzZXJzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgICAgICAvL01ldCDDoCBqb3VyXG4gICAgICAgICAgICAgICAgbGV0IHVzZXIgPSB1c2Vyc1swXTtcblxuICAgICAgICAgICAgICAgIHVzZXIudXNlcm5hbWUgPSBwcm9maWxlLmxvZ2luO1xuICAgICAgICAgICAgICAgIHVzZXIuZGlzcGxheV9uYW1lID0gcHJvZmlsZS5kaXNwbGF5X25hbWU7XG4gICAgICAgICAgICAgICAgdXNlci5hdmF0YXIgPSBwcm9maWxlLnByb2ZpbGVfaW1hZ2VfdXJsO1xuXG4gICAgICAgICAgICAgICAgYXdhaXQgdXNlci5zYXZlKCk7XG5cbiAgICAgICAgICAgICAgICBkb25lKG51bGwsIHVzZXIpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgbGV0IG5ld1VzZXIgPSBuZXcgVXNlcigpO1xuXG4gICAgICAgICAgICAgICAgbmV3VXNlci50d2l0Y2hJZCA9IHByb2ZpbGUuaWQ7XG4gICAgICAgICAgICAgICAgbmV3VXNlci51c2VybmFtZSA9IHByb2ZpbGUubG9naW47XG4gICAgICAgICAgICAgICAgbmV3VXNlci5kaXNwbGF5X25hbWUgPSBwcm9maWxlLmRpc3BsYXlfbmFtZTtcbiAgICAgICAgICAgICAgICBuZXdVc2VyLmF2YXRhciA9IHByb2ZpbGUucHJvZmlsZV9pbWFnZV91cmw7XG5cbiAgICAgICAgICAgICAgICBhd2FpdCBuZXdVc2VyLnNhdmUoKTtcblxuICAgICAgICAgICAgICAgIGRvbmUobnVsbCwgbmV3VXNlcik7XG5cbiAgICAgICAgICAgIH1cblxuICAgICAgICB9KSk7XG4gICAgcGFzc3BvcnQuc2VyaWFsaXplVXNlcihmdW5jdGlvbiAodXNlciwgZG9uZSkge1xuICAgICAgICBkb25lKG51bGwsIHVzZXIudHdpdGNoSWQpO1xuICAgIH0pO1xuICAgIHBhc3Nwb3J0LmRlc2VyaWFsaXplVXNlcihmdW5jdGlvbiAodHdpdGNoSWQsIGRvbmUpIHtcbiAgICAgICAgVXNlci5maW5kT25lKHt0d2l0Y2hJZDogdHdpdGNoSWR9KS50aGVuKCh1c2VyKSA9PiB7XG4gICAgICAgICAgICBsZXQgcmVhbFVzZXIgPSB1c2VyID09IHVuZGVmaW5lZCA/IGZhbHNlIDogdXNlcjtcbiAgICAgICAgICAgIGRvbmUobnVsbCwgcmVhbFVzZXIpO1xuICAgICAgICB9KTtcbiAgICB9KTtcblxuICAgIGFwcC51c2UocGFzc3BvcnQuaW5pdGlhbGl6ZSgpKTsgICAvLyBwYXNzcG9ydCBpbml0aWFsaXplIG1pZGRsZXdhcmVcbiAgICBhcHAudXNlKHBhc3Nwb3J0LnNlc3Npb24oKSk7ICAgICAgLy8gcGFzc3BvcnQgc2Vzc2lvbiBtaWRkbGV3YXJlXG5cbiAgICAvL1BhcnJhaW5hZ2VcbiAgICAvKmFwcC51c2UoYXN5bmMgKHJlcSwgcmVzOiBFeHByZXNzLlJlc3BvbnNlLCBkb25lKSA9PiB7XG5cbiAgICAgICAgaWYgKHJlcS5xdWVyeS5wYXJyYWluX2lkICE9IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgcmVxLnNlc3Npb24ucGFycmFpbl9pZCA9IHJlcS5xdWVyeS5wYXJyYWluX2lkO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHJlcS5pc0F1dGhlbnRpY2F0ZWQoKSAmJiByZXEuc2Vzc2lvbi5wYXJyYWluX2lkICE9IHVuZGVmaW5lZCAmJiByZXEudXNlci5wYXJyYWluID09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgcmVxLnVzZXIucGFycmFpbiA9IGF3YWl0IFVzZXIuZmluZE9uZSh7d2hlcmU6IHtwYXJyYWluYWdlX2lkOiByZXEuc2Vzc2lvbi5wYXJyYWluX2lkfX0pO1xuICAgICAgICAgICAgYXdhaXQgcmVxLnVzZXIuc2F2ZSgpO1xuICAgICAgICB9XG5cbiAgICAgICAgZG9uZSgpO1xuXG4gICAgfSk7Ki9cblxuICAgIC8vU3RyZWFtUXVldWVcbiAgICAvKiBhc3luYyBmdW5jdGlvbiB1cGRhdGUoKSB7XG4gICAgICAgICBhd2FpdCB1cGRhdGVTdHJlYW1RdWV1ZSgpLmNhdGNoKHJlYXNvbiA9PiB7XG4gICAgICAgICAgICAgY29uc29sZS5sb2cocmVhc29uKTtcbiAgICAgICAgIH0pO1xuICAgICAgICAgc2V0VGltZW91dCh1cGRhdGUsIDEwMDApO1xuICAgICB9XG5cbiAgICAgdXBkYXRlKCkuY2F0Y2gocmVhc29uID0+IGNvbnNvbGUubG9nKHJlYXNvbikpOyovXG4gICAgLyphcHAudXNlKGFzeW5jIChyZXEsIHJlczogRXhwcmVzcy5SZXNwb25zZSwgZG9uZSkgPT4ge1xuICAgICAgICBhd2FpdCB1cGRhdGVTdHJlYW1RdWV1ZSgpO1xuICAgICAgICBkb25lKCk7XG4gICAgfSk7Ki9cblxuICAgIC8vUm91dGVzXG4gICAgYXBwLnVzZSgnLycsIGluZGV4Um91dGVyKTtcbiAgICBhcHAudXNlKCcvY2FzZScsIGNhc2VSb3V0ZXIpO1xuICAgIGFwcC51c2UoJy9wYXJyYWluYWdlJywgcGFycmFpbmFnZVJvdXRlcik7XG4gICAgYXBwLnVzZSgnL2dpdmVhd2F5JywgZ2l2ZWF3YXlSb3V0ZXIpO1xuICAgIGFwcC51c2UoJy9jb3Vwb24nLCBjb3Vwb25Sb3V0ZXIpO1xuICAgIGFwcC51c2UoJy9wb2ludHMnLCBwb2ludHNSb3V0ZXIpO1xuICAgIGFwcC51c2UoJy93YXRjaCcsIHdhdGNoUm91dGVyKTtcbiAgICBhcHAudXNlKCcvc2hvcCcsIHNob3BSb3V0ZXIpO1xuICAgIGFwcC51c2UoJy9zdHVmZnNob3AnLCBzdHVmZnNob3BSb3V0ZXIpO1xuICAgIGFwcC51c2UoJy9hZG1pbicsIGFkbWluUm91dGVyKTtcblxuICAgIGFwcC5nZXQoXCIvYXV0aC90d2l0Y2hcIiwgcGFzc3BvcnQuYXV0aGVudGljYXRlKFwidHdpdGNoXCIpKTtcbiAgICBhcHAuZ2V0KFwiL2F1dGgvdHdpdGNoL2NhbGxiYWNrXCIsIHBhc3Nwb3J0LmF1dGhlbnRpY2F0ZShcInR3aXRjaFwiLCB7ZmFpbHVyZVJlZGlyZWN0OiBcIi9cIn0pLCBmdW5jdGlvbiAocmVxLCByZXMpIHtcbiAgICAgICAgcmVzLnJlZGlyZWN0KFwiL1wiKTtcbiAgICB9KTtcblxuXG4gICAgLy9TeW5jIGNhc2VzXG4gICAgYXdhaXQgc3luY0Nhc2VzKGNhc2VzQ29udGVudCk7XG4gICAgYXdhaXQgc3luY1Byb2R1Y3RzKCk7XG5cbn0pLmNhdGNoKGVycm9yID0+IGNvbnNvbGUubG9nKGVycm9yKSk7XG5cbm1vZHVsZS5leHBvcnRzID0gYXBwO1xuIl19