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
const twitchStrategy = require("passport-twitch").Strategy;
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
                user.username = profile._json.name;
                user.display_name = profile._json.display_name;
                user.email = profile._json.email;
                user.avatar = profile._json.logo;
                yield user.save();
                done(null, user);
            }
            else {
                let newUser = new User_1.User();
                newUser.twitchId = profile.id;
                newUser.username = profile._json.name;
                newUser.display_name = profile._json.display_name;
                newUser.email = profile._json.email;
                newUser.avatar = profile._json.logo;
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiL1N0cmVhbVJ1bm5lcnMvVHdpdGNoVmlldy9hcHAudHMiLCJzb3VyY2VzIjpbIi9TdHJlYW1SdW5uZXJzL1R3aXRjaFZpZXcvYXBwLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7QUFBQSw0QkFBMEI7QUFDMUIscUNBQXlDO0FBQ3pDLGlEQUE0QztBQUc1QyxpREFBaUQ7QUFDakQscURBQWlEO0FBRWpELDRCQUEwQjtBQUUxQix1REFBZ0U7QUFDaEUsTUFBTSxNQUFNLEdBQUcsT0FBTyxDQUFDLFFBQVEsQ0FBQyxDQUFDO0FBRWpDLE1BQU0sT0FBTyxHQUFHLE9BQU8sQ0FBQyxTQUFTLENBQUMsQ0FBQztBQUNuQyxNQUFNLElBQUksR0FBRyxPQUFPLENBQUMsTUFBTSxDQUFDLENBQUM7QUFDN0IsTUFBTSxZQUFZLEdBQUcsT0FBTyxDQUFDLGVBQWUsQ0FBQyxDQUFDO0FBQzlDLE1BQU0sYUFBYSxHQUFHLE9BQU8sQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDO0FBQ2hELE1BQU0sTUFBTSxHQUFHLE9BQU8sQ0FBQyxRQUFRLENBQUMsQ0FBQztBQUNqQyxNQUFNLGVBQWUsR0FBRyxPQUFPLENBQUMsa0JBQWtCLENBQUMsQ0FBQztBQUNwRCxNQUFNLFFBQVEsR0FBRyxPQUFPLENBQUMsVUFBVSxDQUFDLENBQUM7QUFDckMsTUFBTSxjQUFjLEdBQUcsT0FBTyxDQUFDLGlCQUFpQixDQUFDLENBQUMsUUFBUSxDQUFDO0FBQzNELE1BQU0sV0FBVyxHQUFHLE9BQU8sQ0FBQyxhQUFhLENBQUMsQ0FBQztBQUMzQyxNQUFNLE1BQU0sR0FBRyxPQUFPLENBQUMsUUFBUSxDQUFDLENBQUM7QUFDakMsTUFBTSxPQUFPLEdBQUcsT0FBTyxDQUFDLFlBQVksQ0FBQyxDQUFDO0FBRXRDLE1BQU07QUFDTixPQUFPLENBQUMsUUFBUSxDQUFDLENBQUMsTUFBTSxFQUFFLENBQUM7QUFFM0IsYUFBYTtBQUNiLElBQUksV0FBVyxHQUFHLE9BQU8sQ0FBQyxnQkFBZ0IsQ0FB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QUMsQ0FBQyxDQUFDO0FBRXRDLE1BQU0sQ0FBQyxPQUFPLEdBQUcsR0FBRyxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IFwicmVmbGVjdC1tZXRhZGF0YVwiO1xuaW1wb3J0IHtjcmVhdGVDb25uZWN0aW9ufSBmcm9tIFwidHlwZW9ybVwiO1xuaW1wb3J0IHtVc2VyfSBmcm9tIFwiLi9kYXRhYmFzZS9lbnRpdHkvVXNlclwiO1xuaW1wb3J0IHt1cGRhdGVTdHJlYW1RdWV1ZX0gZnJvbSBcIi4vZGF0YWJhc2UvZW50aXR5L1N0cmVhbVF1ZXVlXCI7XG5pbXBvcnQge3N5bmN9IGZyb20gXCJnbG9iXCI7XG5pbXBvcnQge3N5bmNDYXNlc30gZnJvbSBcIi4vZGF0YWJhc2UvZW50aXR5L0Nhc2VcIjtcbmltcG9ydCB7Y2FzZXNDb250ZW50fSBmcm9tIFwiLi9vdGhlci9DYXNlQ29udGVudFwiO1xuXG5pbXBvcnQgXCJyZWZsZWN0LW1ldGFkYXRhXCI7XG5pbXBvcnQgKiBhcyBjaGlsZF9wcm9jZXNzIGZyb20gXCJjaGlsZF9wcm9jZXNzXCI7XG5pbXBvcnQge1Byb2R1Y3QsIHN5bmNQcm9kdWN0c30gZnJvbSBcIi4vZGF0YWJhc2UvZW50aXR5L1Byb2R1Y3RcIjtcbmNvbnN0IG1vbWVudCA9IHJlcXVpcmUoXCJtb21lbnRcIik7XG5cbmNvbnN0IGV4cHJlc3MgPSByZXF1aXJlKCdleHByZXNzJyk7XG5jb25zdCBwYXRoID0gcmVxdWlyZSgncGF0aCcpO1xuY29uc3QgY29va2llUGFyc2VyID0gcmVxdWlyZSgnY29va2llLXBhcnNlcicpO1xuY29uc3QgY29va2llU2Vzc2lvbiA9IHJlcXVpcmUoJ2Nvb2tpZS1zZXNzaW9uJyk7XG5jb25zdCBsb2dnZXIgPSByZXF1aXJlKCdtb3JnYW4nKTtcbmNvbnN0IGV4cHJlc3NOdW5qdWNrcyA9IHJlcXVpcmUoJ2V4cHJlc3MtbnVuanVja3MnKTtcbmNvbnN0IHBhc3Nwb3J0ID0gcmVxdWlyZSgncGFzc3BvcnQnKTtcbmNvbnN0IHR3aXRjaFN0cmF0ZWd5ID0gcmVxdWlyZShcInBhc3Nwb3J0LXR3aXRjaFwiKS5TdHJhdGVneTtcbmNvbnN0IGNvbXByZXNzaW9uID0gcmVxdWlyZSgnY29tcHJlc3Npb24nKTtcbmNvbnN0IGhlbG1ldCA9IHJlcXVpcmUoJ2hlbG1ldCcpO1xuY29uc3QgRGlzY29yZCA9IHJlcXVpcmUoXCJkaXNjb3JkLmpzXCIpO1xuXG4vLy5lbnZcbnJlcXVpcmUoXCJkb3RlbnZcIikuY29uZmlnKCk7XG5cbi8vTG9hZCByb3V0ZXNcbnZhciBpbmRleFJvdXRlciA9IHJlcXVpcmUoJy4vcm91dGVzL2luZGV4Jyk7XG52YXIgY2FzZVJvdXRlciA9IHJlcXVpcmUoJy4vcm91dGVzL2Nhc2UnKTtcbnZhciBzaG9wUm91dGVyID0gcmVxdWlyZSgnLi9yb3V0ZXMvc2hvcCcpO1xudmFyIHBhcnJhaW5hZ2VSb3V0ZXIgPSByZXF1aXJlKCcuL3JvdXRlcy9wYXJyYWluYWdlJyk7XG52YXIgZ2l2ZWF3YXlSb3V0ZXIgPSByZXF1aXJlKCcuL3JvdXRlcy9naXZlYXdheScpO1xudmFyIGNvdXBvblJvdXRlciA9IHJlcXVpcmUoJy4vcm91dGVzL2NvdXBvbicpO1xudmFyIHBvaW50c1JvdXRlciA9IHJlcXVpcmUoJy4vcm91dGVzL3BvaW50cycpO1xudmFyIHdhdGNoUm91dGVyID0gcmVxdWlyZSgnLi9yb3V0ZXMvd2F0Y2gnKTtcbnZhciBzaG9wUm91dGVyID0gcmVxdWlyZSgnLi9yb3V0ZXMvc2hvcCcpO1xuXG4vL0FwcFxudmFyIGFwcCA9IGV4cHJlc3MoKTtcblxuZ2xvYmFsWydkaXNjb3JkQW50aVNwYW1EYXRlJ10gPSBtb21lbnQoKS5zdWJ0cmFjdChcIjIwXCIsIFwiaG91cnNcIik7XG5cbi8vREJcbmNyZWF0ZUNvbm5lY3Rpb24oKS50aGVuKGFzeW5jICgpID0+IHtcblxuICAgIGNvbnN0IGlzRGV2ID0gYXBwLmdldCgnZW52JykgPT09ICdkZXZlbG9wbWVudCc7XG5cbiAgICAvL051bmp1Y2tzXG4gICAgYXBwLnNldCgndmlld3MnLCBfX2Rpcm5hbWUgKyAnL3ZpZXdzJyk7XG4gICAgYXBwLnNldChcInZpZXcgZW5naW5lXCIsIFwibnVualwiKTtcbiAgICBjb25zdCBuamsgPSBleHByZXNzTnVuanVja3MoYXBwLCB7XG4gICAgICAgIHdhdGNoOiBpc0RldixcbiAgICAgICAgbm9DYWNoZTogaXNEZXYsXG4gICAgICAgIGdsb2JhbHM6IHtcbiAgICAgICAgICAgIEhPU1ROQU1FOiBwcm9jZXNzLmVudi5IT1NUTkFNRVxuICAgICAgICB9XG4gICAgfSk7XG5cbiAgICAvL0Rpc2NvcmRcbiAgICBjb25zdCBjbGllbnQgPSBuZXcgRGlzY29yZC5DbGllbnQoKTtcbiAgICBhd2FpdCBjbGllbnQubG9naW4ocHJvY2Vzcy5lbnYuRElTQ09SRF9UT0tFTik7XG4gICAgY2xpZW50LnVzZXIuc2V0QWN0aXZpdHkoXCJTdHJlYW1SdW5uZXJzLmZyXCIsIHt0eXBlOiBcIldBVENISU5HXCJ9KTtcbiAgICBhcHAudXNlKChyZXEsIHJlcywgbmV4dCkgPT4ge1xuICAgICAgICByZXEuZGlzY29yZCA9IGNsaWVudDtcbiAgICAgICAgbmV4dCgpO1xuICAgIH0pO1xuXG4gICAgYXBwLnVzZShsb2dnZXIoJ2RldicpKTtcbiAgICBhcHAudXNlKGV4cHJlc3MuanNvbigpKTtcbiAgICBhcHAudXNlKGV4cHJlc3MudXJsZW5jb2RlZCh7ZXh0ZW5kZWQ6IGZhbHNlfSkpO1xuICAgIGFwcC51c2UoY29va2llUGFyc2VyKCkpO1xuXG5cbiAgICBhcHAudXNlKGNvbXByZXNzaW9uKCkpO1xuICAgIGFwcC51c2UoaGVsbWV0KCkpO1xuXG4gICAgYXBwLnVzZShleHByZXNzLnN0YXRpYyhwYXRoLmpvaW4oX19kaXJuYW1lLCAncHVibGljJykpKTtcblxuICAgIGFwcC51c2UoY29va2llU2Vzc2lvbih7a2V5czogW3Byb2Nlc3MuZW52LkNPT0tJRV9LRVldfSkpOyAvLyBFeHByZXNzIGNvb2tpZSBzZXNzaW9uIG1pZGRsZXdhcmVcblxuICAgIC8vUGFzc3BvcnRcbiAgICBwYXNzcG9ydC51c2UobmV3IHR3aXRjaFN0cmF0ZWd5KHtcbiAgICAgICAgICAgIGNsaWVudElEOiBwcm9jZXNzLmVudi5UV0lUQ0hfQ0xJRU5UX0lELFxuICAgICAgICAgICAgY2xpZW50U2VjcmV0OiBwcm9jZXNzLmVudi5UV0lUQ0hfQ0xJRU5UX1NFQ1JFVCxcbiAgICAgICAgICAgIGNhbGxiYWNrVVJMOiBwcm9jZXNzLmVudi5IT1NUTkFNRSArIFwiL2F1dGgvdHdpdGNoL2NhbGxiYWNrXCIsXG4gICAgICAgICAgICBzY29wZTogXCJ1c2VyX3JlYWRcIlxuICAgICAgICB9LFxuICAgICAgICBhc3luYyBmdW5jdGlvbiAoYWNjZXNzVG9rZW4sIHJlZnJlc2hUb2tlbiwgcHJvZmlsZSwgZG9uZSkge1xuXG4gICAgICAgICAgICAvL0ZpbmQgb3IgY3JlYXRlXG4gICAgICAgICAgICBsZXQgdXNlcnMgPSBhd2FpdCBVc2VyLmZpbmQoe3R3aXRjaElkOiBwcm9maWxlLmlkfSk7XG5cbiAgICAgICAgICAgIGlmICh1c2Vycy5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICAgICAgLy9NZXQgw6Agam91clxuICAgICAgICAgICAgICAgIGxldCB1c2VyID0gdXNlcnNbMF07XG5cbiAgICAgICAgICAgICAgICB1c2VyLnVzZXJuYW1lID0gcHJvZmlsZS5fanNvbi5uYW1lO1xuICAgICAgICAgICAgICAgIHVzZXIuZGlzcGxheV9uYW1lID0gcHJvZmlsZS5fanNvbi5kaXNwbGF5X25hbWU7XG4gICAgICAgICAgICAgICAgdXNlci5lbWFpbCA9IHByb2ZpbGUuX2pzb24uZW1haWw7XG4gICAgICAgICAgICAgICAgdXNlci5hdmF0YXIgPSBwcm9maWxlLl9qc29uLmxvZ287XG5cbiAgICAgICAgICAgICAgICBhd2FpdCB1c2VyLnNhdmUoKTtcblxuICAgICAgICAgICAgICAgIGRvbmUobnVsbCwgdXNlcik7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICBsZXQgbmV3VXNlciA9IG5ldyBVc2VyKCk7XG5cbiAgICAgICAgICAgICAgICBuZXdVc2VyLnR3aXRjaElkID0gcHJvZmlsZS5pZDtcbiAgICAgICAgICAgICAgICBuZXdVc2VyLnVzZXJuYW1lID0gcHJvZmlsZS5fanNvbi5uYW1lO1xuICAgICAgICAgICAgICAgIG5ld1VzZXIuZGlzcGxheV9uYW1lID0gcHJvZmlsZS5fanNvbi5kaXNwbGF5X25hbWU7XG4gICAgICAgICAgICAgICAgbmV3VXNlci5lbWFpbCA9IHByb2ZpbGUuX2pzb24uZW1haWw7XG4gICAgICAgICAgICAgICAgbmV3VXNlci5hdmF0YXIgPSBwcm9maWxlLl9qc29uLmxvZ287XG5cbiAgICAgICAgICAgICAgICBhd2FpdCBuZXdVc2VyLnNhdmUoKTtcblxuICAgICAgICAgICAgICAgIGRvbmUobnVsbCwgbmV3VXNlcik7XG5cbiAgICAgICAgICAgIH1cblxuICAgICAgICB9KSk7XG4gICAgcGFzc3BvcnQuc2VyaWFsaXplVXNlcihmdW5jdGlvbiAodXNlciwgZG9uZSkge1xuICAgICAgICBkb25lKG51bGwsIHVzZXIudHdpdGNoSWQpO1xuICAgIH0pO1xuICAgIHBhc3Nwb3J0LmRlc2VyaWFsaXplVXNlcihmdW5jdGlvbiAodHdpdGNoSWQsIGRvbmUpIHtcbiAgICAgICAgVXNlci5maW5kT25lKHt0d2l0Y2hJZDogdHdpdGNoSWR9KS50aGVuKCh1c2VyKSA9PiB7XG4gICAgICAgICAgICBsZXQgcmVhbFVzZXIgPSB1c2VyID09IHVuZGVmaW5lZCA/IGZhbHNlIDogdXNlcjtcbiAgICAgICAgICAgIGRvbmUobnVsbCwgcmVhbFVzZXIpO1xuICAgICAgICB9KTtcbiAgICB9KTtcblxuICAgIGFwcC51c2UocGFzc3BvcnQuaW5pdGlhbGl6ZSgpKTsgICAvLyBwYXNzcG9ydCBpbml0aWFsaXplIG1pZGRsZXdhcmVcbiAgICBhcHAudXNlKHBhc3Nwb3J0LnNlc3Npb24oKSk7ICAgICAgLy8gcGFzc3BvcnQgc2Vzc2lvbiBtaWRkbGV3YXJlXG5cbiAgICAvL1BhcnJhaW5hZ2VcbiAgICAvKmFwcC51c2UoYXN5bmMgKHJlcSwgcmVzOiBFeHByZXNzLlJlc3BvbnNlLCBkb25lKSA9PiB7XG5cbiAgICAgICAgaWYgKHJlcS5xdWVyeS5wYXJyYWluX2lkICE9IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgcmVxLnNlc3Npb24ucGFycmFpbl9pZCA9IHJlcS5xdWVyeS5wYXJyYWluX2lkO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHJlcS5pc0F1dGhlbnRpY2F0ZWQoKSAmJiByZXEuc2Vzc2lvbi5wYXJyYWluX2lkICE9IHVuZGVmaW5lZCAmJiByZXEudXNlci5wYXJyYWluID09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgcmVxLnVzZXIucGFycmFpbiA9IGF3YWl0IFVzZXIuZmluZE9uZSh7d2hlcmU6IHtwYXJyYWluYWdlX2lkOiByZXEuc2Vzc2lvbi5wYXJyYWluX2lkfX0pO1xuICAgICAgICAgICAgYXdhaXQgcmVxLnVzZXIuc2F2ZSgpO1xuICAgICAgICB9XG5cbiAgICAgICAgZG9uZSgpO1xuXG4gICAgfSk7Ki9cblxuICAgIC8vU3RyZWFtUXVldWVcbiAgICAvKiBhc3luYyBmdW5jdGlvbiB1cGRhdGUoKSB7XG4gICAgICAgICBhd2FpdCB1cGRhdGVTdHJlYW1RdWV1ZSgpLmNhdGNoKHJlYXNvbiA9PiB7XG4gICAgICAgICAgICAgY29uc29sZS5sb2cocmVhc29uKTtcbiAgICAgICAgIH0pO1xuICAgICAgICAgc2V0VGltZW91dCh1cGRhdGUsIDEwMDApO1xuICAgICB9XG5cbiAgICAgdXBkYXRlKCkuY2F0Y2gocmVhc29uID0+IGNvbnNvbGUubG9nKHJlYXNvbikpOyovXG4gICAgLyphcHAudXNlKGFzeW5jIChyZXEsIHJlczogRXhwcmVzcy5SZXNwb25zZSwgZG9uZSkgPT4ge1xuICAgICAgICBhd2FpdCB1cGRhdGVTdHJlYW1RdWV1ZSgpO1xuICAgICAgICBkb25lKCk7XG4gICAgfSk7Ki9cblxuICAgIC8vUm91dGVzXG4gICAgYXBwLnVzZSgnLycsIGluZGV4Um91dGVyKTtcbiAgICBhcHAudXNlKCcvY2FzZScsIGNhc2VSb3V0ZXIpO1xuICAgIGFwcC51c2UoJy9wYXJyYWluYWdlJywgcGFycmFpbmFnZVJvdXRlcik7XG4gICAgYXBwLnVzZSgnL2dpdmVhd2F5JywgZ2l2ZWF3YXlSb3V0ZXIpO1xuICAgIGFwcC51c2UoJy9jb3Vwb24nLCBjb3Vwb25Sb3V0ZXIpO1xuICAgIGFwcC51c2UoJy9wb2ludHMnLCBwb2ludHNSb3V0ZXIpO1xuICAgIGFwcC51c2UoJy93YXRjaCcsIHdhdGNoUm91dGVyKTtcbiAgICBhcHAudXNlKCcvc2hvcCcsIHNob3BSb3V0ZXIpO1xuXG4gICAgYXBwLmdldChcIi9hdXRoL3R3aXRjaFwiLCBwYXNzcG9ydC5hdXRoZW50aWNhdGUoXCJ0d2l0Y2hcIikpO1xuICAgIGFwcC5nZXQoXCIvYXV0aC90d2l0Y2gvY2FsbGJhY2tcIiwgcGFzc3BvcnQuYXV0aGVudGljYXRlKFwidHdpdGNoXCIsIHtmYWlsdXJlUmVkaXJlY3Q6IFwiL1wifSksIGZ1bmN0aW9uIChyZXEsIHJlcykge1xuICAgICAgICByZXMucmVkaXJlY3QoXCIvXCIpO1xuICAgIH0pO1xuXG5cbiAgICAvL1N5bmMgY2FzZXNcbiAgICBhd2FpdCBzeW5jQ2FzZXMoY2FzZXNDb250ZW50KTtcbiAgICBhd2FpdCBzeW5jUHJvZHVjdHMoKTtcblxufSkuY2F0Y2goZXJyb3IgPT4gY29uc29sZS5sb2coZXJyb3IpKTtcblxubW9kdWxlLmV4cG9ydHMgPSBhcHA7XG4iXX0=