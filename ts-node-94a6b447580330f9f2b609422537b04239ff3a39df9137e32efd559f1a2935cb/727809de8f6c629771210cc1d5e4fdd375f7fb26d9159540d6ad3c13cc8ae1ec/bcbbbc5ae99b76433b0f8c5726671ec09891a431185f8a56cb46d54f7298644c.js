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
    //   app.use('/shop', shopRouter);
    app.use('/parrainage', parrainageRouter);
    app.use('/giveaway', giveawayRouter);
    app.use('/coupon', couponRouter);
    app.use('/points', pointsRouter);
    app.use('/watch', watchRouter);
    app.get("/auth/twitch", passport.authenticate("twitch"));
    app.get("/auth/twitch/callback", passport.authenticate("twitch", { failureRedirect: "/" }), function (req, res) {
        res.redirect("/");
    });
    //Sync cases
    yield Case_1.syncCases(CaseContent_1.casesContent);
    yield Product_1.syncProducts();
})).catch(error => console.log(error));
module.exports = app;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiL1N0cmVhbVJ1bm5lcnMvVHdpdGNoVmlldy9hcHAudHMiLCJzb3VyY2VzIjpbIi9TdHJlYW1SdW5uZXJzL1R3aXRjaFZpZXcvYXBwLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7O0FBQUEsNEJBQTBCO0FBQzFCLHFDQUF5QztBQUN6QyxpREFBNEM7QUFHNUMsaURBQWlEO0FBQ2pELHFEQUFpRDtBQUVqRCw0QkFBMEI7QUFFMUIsdURBQWdFO0FBQ2hFLE1BQU0sTUFBTSxHQUFHLE9BQU8sQ0FBQyxRQUFRLENBQUMsQ0FBQztBQUVqQyxNQUFNLE9BQU8sR0FBRyxPQUFPLENBQUMsU0FBUyxDQUFDLENBQUM7QUFDbkMsTUFBTSxJQUFJLEdBQUcsT0FBTyxDQUFDLE1BQU0sQ0FBQyxDQUFDO0FBQzdCLE1BQU0sWUFBWSxHQUFHLE9BQU8sQ0FBQyxlQUFlLENBQUMsQ0FBQztBQUM5QyxNQUFNLGFBQWEsR0FBRyxPQUFPLENBQUMsZ0JBQWdCLENBQUMsQ0FBQztBQUNoRCxNQUFNLE1BQU0sR0FBRyxPQUFPLENBQUMsUUFBUSxDQUFDLENBQUM7QUFDakMsTUFBTSxlQUFlLEdBQUcsT0FBTyxDQUFDLGtCQUFrQixDQUFDLENBQUM7QUFDcEQsTUFBTSxRQUFRLEdBQUcsT0FBTyxDQUFDLFVBQVUsQ0FBQyxDQUFDO0FBQ3JDLE1BQU0sY0FBYyxHQUFHLE9BQU8sQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDLFFBQVEsQ0FBQztBQUMzRCxNQUFNLFdBQVcsR0FBRyxPQUFPLENBQUMsYUFBYSxDQUFDLENBQUM7QUFDM0MsTUFBTSxNQUFNLEdBQUcsT0FBTyxDQUFDLFFBQVEsQ0FBQyxDQUFDO0FBQ2pDLE1BQU0sT0FBTyxHQUFHLE9BQU8sQ0FBQyxZQUFZLENBQUMsQ0FBQztBQUV0QyxNQUFNO0FBQ04sT0FBTyxDQUFDLFFBQVEsQ0FBQyxDQUFDLE1BQU0sRUFBRSxDQUFDO0FBRTNCLGFBQWE7QUFDYixJQUFJLFdBQVcsR0FBRyxPQUFPLENBQUMsZ0JBQWdCLENB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LEdBQUcsQ0FBQyxHQUFHLENBQUMsT0FBTyxFQUFFLFVBQVUsQ0FBQyxDQUFDO0lBQzdCLGtDQUFrQztJQUNsQyxHQUFHLENBQUMsR0FBRyxDQUFDLGFBQWEsRUFBRSxnQkFBZ0IsQ0FBQyxDQUFDO0lBQ3pDLEdBQUcsQ0FBQyxHQUFHLENBQUMsV0FBVyxFQUFFLGNBQWMsQ0FBQyxDQUFDO0lBQ3JDLEdBQUcsQ0FBQyxHQUFHLENBQUMsU0FBUyxFQUFFLFlBQVksQ0FBQyxDQUFDO0lBQ2pDLEdBQUcsQ0FBQyxHQUFHLENBQUMsU0FBUyxFQUFFLFlBQVksQ0FBQyxDQUFDO0lBQ2pDLEdBQUcsQ0FBQyxHQUFHLENBQUMsUUFBUSxFQUFFLFdBQVcsQ0FBQyxDQUFDO0lBRS9CLEdBQUcsQ0FBQyxHQUFHLENBQUMsY0FBYyxFQUFFLFFBQVEsQ0FBQyxZQUFZLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQztJQUN6RCxHQUFHLENBQUMsR0FBRyxDQUFDLHVCQUF1QixFQUFFLFFBQVEsQ0FBQyxZQUFZLENBQUMsUUFBUSxFQUFFLEVBQUMsZUFBZSxFQUFFLEdBQUcsRUFBQyxDQUFDLEVBQUUsVUFBVSxHQUFHLEVBQUUsR0FBRztRQUN4RyxHQUFHLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxDQUFDO0lBQ3RCLENBQUMsQ0FBQyxDQUFDO0lBR0gsWUFBWTtJQUNaLE1BQU0sZ0JBQVMsQ0FBQywwQkFBWSxDQUFDLENBQUM7SUFDOUIsTUFBTSxzQkFBWSxFQUFFLENBQUM7QUFFekIsQ0FBQyxDQUFBLENBQUMsQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUM7QUFFdEMsTUFBTSxDQUFDLE9BQU8sR0FBRyxHQUFHLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgXCJyZWZsZWN0LW1ldGFkYXRhXCI7XG5pbXBvcnQge2NyZWF0ZUNvbm5lY3Rpb259IGZyb20gXCJ0eXBlb3JtXCI7XG5pbXBvcnQge1VzZXJ9IGZyb20gXCIuL2RhdGFiYXNlL2VudGl0eS9Vc2VyXCI7XG5pbXBvcnQge3VwZGF0ZVN0cmVhbVF1ZXVlfSBmcm9tIFwiLi9kYXRhYmFzZS9lbnRpdHkvU3RyZWFtUXVldWVcIjtcbmltcG9ydCB7c3luY30gZnJvbSBcImdsb2JcIjtcbmltcG9ydCB7c3luY0Nhc2VzfSBmcm9tIFwiLi9kYXRhYmFzZS9lbnRpdHkvQ2FzZVwiO1xuaW1wb3J0IHtjYXNlc0NvbnRlbnR9IGZyb20gXCIuL290aGVyL0Nhc2VDb250ZW50XCI7XG5cbmltcG9ydCBcInJlZmxlY3QtbWV0YWRhdGFcIjtcbmltcG9ydCAqIGFzIGNoaWxkX3Byb2Nlc3MgZnJvbSBcImNoaWxkX3Byb2Nlc3NcIjtcbmltcG9ydCB7UHJvZHVjdCwgc3luY1Byb2R1Y3RzfSBmcm9tIFwiLi9kYXRhYmFzZS9lbnRpdHkvUHJvZHVjdFwiO1xuY29uc3QgbW9tZW50ID0gcmVxdWlyZShcIm1vbWVudFwiKTtcblxuY29uc3QgZXhwcmVzcyA9IHJlcXVpcmUoJ2V4cHJlc3MnKTtcbmNvbnN0IHBhdGggPSByZXF1aXJlKCdwYXRoJyk7XG5jb25zdCBjb29raWVQYXJzZXIgPSByZXF1aXJlKCdjb29raWUtcGFyc2VyJyk7XG5jb25zdCBjb29raWVTZXNzaW9uID0gcmVxdWlyZSgnY29va2llLXNlc3Npb24nKTtcbmNvbnN0IGxvZ2dlciA9IHJlcXVpcmUoJ21vcmdhbicpO1xuY29uc3QgZXhwcmVzc051bmp1Y2tzID0gcmVxdWlyZSgnZXhwcmVzcy1udW5qdWNrcycpO1xuY29uc3QgcGFzc3BvcnQgPSByZXF1aXJlKCdwYXNzcG9ydCcpO1xuY29uc3QgdHdpdGNoU3RyYXRlZ3kgPSByZXF1aXJlKFwicGFzc3BvcnQtdHdpdGNoXCIpLlN0cmF0ZWd5O1xuY29uc3QgY29tcHJlc3Npb24gPSByZXF1aXJlKCdjb21wcmVzc2lvbicpO1xuY29uc3QgaGVsbWV0ID0gcmVxdWlyZSgnaGVsbWV0Jyk7XG5jb25zdCBEaXNjb3JkID0gcmVxdWlyZShcImRpc2NvcmQuanNcIik7XG5cbi8vLmVudlxucmVxdWlyZShcImRvdGVudlwiKS5jb25maWcoKTtcblxuLy9Mb2FkIHJvdXRlc1xudmFyIGluZGV4Um91dGVyID0gcmVxdWlyZSgnLi9yb3V0ZXMvaW5kZXgnKTtcbnZhciBjYXNlUm91dGVyID0gcmVxdWlyZSgnLi9yb3V0ZXMvY2FzZScpO1xudmFyIHNob3BSb3V0ZXIgPSByZXF1aXJlKCcuL3JvdXRlcy9zaG9wJyk7XG52YXIgcGFycmFpbmFnZVJvdXRlciA9IHJlcXVpcmUoJy4vcm91dGVzL3BhcnJhaW5hZ2UnKTtcbnZhciBnaXZlYXdheVJvdXRlciA9IHJlcXVpcmUoJy4vcm91dGVzL2dpdmVhd2F5Jyk7XG52YXIgY291cG9uUm91dGVyID0gcmVxdWlyZSgnLi9yb3V0ZXMvY291cG9uJyk7XG52YXIgcG9pbnRzUm91dGVyID0gcmVxdWlyZSgnLi9yb3V0ZXMvcG9pbnRzJyk7XG52YXIgd2F0Y2hSb3V0ZXIgPSByZXF1aXJlKCcuL3JvdXRlcy93YXRjaCcpO1xuXG4vL0FwcFxudmFyIGFwcCA9IGV4cHJlc3MoKTtcblxuZ2xvYmFsWydkaXNjb3JkQW50aVNwYW1EYXRlJ10gPSBtb21lbnQoKS5zdWJ0cmFjdChcIjIwXCIsIFwiaG91cnNcIik7XG5cbi8vREJcbmNyZWF0ZUNvbm5lY3Rpb24oKS50aGVuKGFzeW5jICgpID0+IHtcblxuICAgIGNvbnN0IGlzRGV2ID0gYXBwLmdldCgnZW52JykgPT09ICdkZXZlbG9wbWVudCc7XG5cbiAgICAvL051bmp1Y2tzXG4gICAgYXBwLnNldCgndmlld3MnLCBfX2Rpcm5hbWUgKyAnL3ZpZXdzJyk7XG4gICAgYXBwLnNldChcInZpZXcgZW5naW5lXCIsIFwibnVualwiKTtcbiAgICBjb25zdCBuamsgPSBleHByZXNzTnVuanVja3MoYXBwLCB7XG4gICAgICAgIHdhdGNoOiBpc0RldixcbiAgICAgICAgbm9DYWNoZTogaXNEZXYsXG4gICAgICAgIGdsb2JhbHM6IHtcbiAgICAgICAgICAgIEhPU1ROQU1FOiBwcm9jZXNzLmVudi5IT1NUTkFNRVxuICAgICAgICB9XG4gICAgfSk7XG5cbiAgICAvL0Rpc2NvcmRcbiAgICBjb25zdCBjbGllbnQgPSBuZXcgRGlzY29yZC5DbGllbnQoKTtcbiAgICBhd2FpdCBjbGllbnQubG9naW4ocHJvY2Vzcy5lbnYuRElTQ09SRF9UT0tFTik7XG4gICAgYXBwLnVzZSgocmVxLCByZXMsIG5leHQpID0+IHtcbiAgICAgICAgcmVxLmRpc2NvcmQgPSBjbGllbnQ7XG4gICAgICAgIG5leHQoKTtcbiAgICB9KTtcblxuICAgIGFwcC51c2UobG9nZ2VyKCdkZXYnKSk7XG4gICAgYXBwLnVzZShleHByZXNzLmpzb24oKSk7XG4gICAgYXBwLnVzZShleHByZXNzLnVybGVuY29kZWQoe2V4dGVuZGVkOiBmYWxzZX0pKTtcbiAgICBhcHAudXNlKGNvb2tpZVBhcnNlcigpKTtcblxuXG4gICAgYXBwLnVzZShjb21wcmVzc2lvbigpKTtcbiAgICBhcHAudXNlKGhlbG1ldCgpKTtcblxuICAgIGFwcC51c2UoZXhwcmVzcy5zdGF0aWMocGF0aC5qb2luKF9fZGlybmFtZSwgJ3B1YmxpYycpKSk7XG5cbiAgICBhcHAudXNlKGNvb2tpZVNlc3Npb24oe2tleXM6IFtwcm9jZXNzLmVudi5DT09LSUVfS0VZXX0pKTsgLy8gRXhwcmVzcyBjb29raWUgc2Vzc2lvbiBtaWRkbGV3YXJlXG5cbiAgICAvL1Bhc3Nwb3J0XG4gICAgcGFzc3BvcnQudXNlKG5ldyB0d2l0Y2hTdHJhdGVneSh7XG4gICAgICAgICAgICBjbGllbnRJRDogcHJvY2Vzcy5lbnYuVFdJVENIX0NMSUVOVF9JRCxcbiAgICAgICAgICAgIGNsaWVudFNlY3JldDogcHJvY2Vzcy5lbnYuVFdJVENIX0NMSUVOVF9TRUNSRVQsXG4gICAgICAgICAgICBjYWxsYmFja1VSTDogcHJvY2Vzcy5lbnYuSE9TVE5BTUUgKyBcIi9hdXRoL3R3aXRjaC9jYWxsYmFja1wiLFxuICAgICAgICAgICAgc2NvcGU6IFwidXNlcl9yZWFkXCJcbiAgICAgICAgfSxcbiAgICAgICAgYXN5bmMgZnVuY3Rpb24gKGFjY2Vzc1Rva2VuLCByZWZyZXNoVG9rZW4sIHByb2ZpbGUsIGRvbmUpIHtcblxuICAgICAgICAgICAgLy9GaW5kIG9yIGNyZWF0ZVxuICAgICAgICAgICAgbGV0IHVzZXJzID0gYXdhaXQgVXNlci5maW5kKHt0d2l0Y2hJZDogcHJvZmlsZS5pZH0pO1xuXG4gICAgICAgICAgICBpZiAodXNlcnMubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgICAgIC8vTWV0IMOgIGpvdXJcbiAgICAgICAgICAgICAgICBsZXQgdXNlciA9IHVzZXJzWzBdO1xuXG4gICAgICAgICAgICAgICAgdXNlci51c2VybmFtZSA9IHByb2ZpbGUuX2pzb24ubmFtZTtcbiAgICAgICAgICAgICAgICB1c2VyLmRpc3BsYXlfbmFtZSA9IHByb2ZpbGUuX2pzb24uZGlzcGxheV9uYW1lO1xuICAgICAgICAgICAgICAgIHVzZXIuZW1haWwgPSBwcm9maWxlLl9qc29uLmVtYWlsO1xuICAgICAgICAgICAgICAgIHVzZXIuYXZhdGFyID0gcHJvZmlsZS5fanNvbi5sb2dvO1xuXG4gICAgICAgICAgICAgICAgYXdhaXQgdXNlci5zYXZlKCk7XG5cbiAgICAgICAgICAgICAgICBkb25lKG51bGwsIHVzZXIpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgbGV0IG5ld1VzZXIgPSBuZXcgVXNlcigpO1xuXG4gICAgICAgICAgICAgICAgbmV3VXNlci50d2l0Y2hJZCA9IHByb2ZpbGUuaWQ7XG4gICAgICAgICAgICAgICAgbmV3VXNlci51c2VybmFtZSA9IHByb2ZpbGUuX2pzb24ubmFtZTtcbiAgICAgICAgICAgICAgICBuZXdVc2VyLmRpc3BsYXlfbmFtZSA9IHByb2ZpbGUuX2pzb24uZGlzcGxheV9uYW1lO1xuICAgICAgICAgICAgICAgIG5ld1VzZXIuZW1haWwgPSBwcm9maWxlLl9qc29uLmVtYWlsO1xuICAgICAgICAgICAgICAgIG5ld1VzZXIuYXZhdGFyID0gcHJvZmlsZS5fanNvbi5sb2dvO1xuXG4gICAgICAgICAgICAgICAgYXdhaXQgbmV3VXNlci5zYXZlKCk7XG5cbiAgICAgICAgICAgICAgICBkb25lKG51bGwsIG5ld1VzZXIpO1xuXG4gICAgICAgICAgICB9XG5cbiAgICAgICAgfSkpO1xuICAgIHBhc3Nwb3J0LnNlcmlhbGl6ZVVzZXIoZnVuY3Rpb24gKHVzZXIsIGRvbmUpIHtcbiAgICAgICAgZG9uZShudWxsLCB1c2VyLnR3aXRjaElkKTtcbiAgICB9KTtcbiAgICBwYXNzcG9ydC5kZXNlcmlhbGl6ZVVzZXIoZnVuY3Rpb24gKHR3aXRjaElkLCBkb25lKSB7XG4gICAgICAgIFVzZXIuZmluZE9uZSh7dHdpdGNoSWQ6IHR3aXRjaElkfSkudGhlbigodXNlcikgPT4ge1xuICAgICAgICAgICAgbGV0IHJlYWxVc2VyID0gdXNlciA9PSB1bmRlZmluZWQgPyBmYWxzZSA6IHVzZXI7XG4gICAgICAgICAgICBkb25lKG51bGwsIHJlYWxVc2VyKTtcbiAgICAgICAgfSk7XG4gICAgfSk7XG5cbiAgICBhcHAudXNlKHBhc3Nwb3J0LmluaXRpYWxpemUoKSk7ICAgLy8gcGFzc3BvcnQgaW5pdGlhbGl6ZSBtaWRkbGV3YXJlXG4gICAgYXBwLnVzZShwYXNzcG9ydC5zZXNzaW9uKCkpOyAgICAgIC8vIHBhc3Nwb3J0IHNlc3Npb24gbWlkZGxld2FyZVxuXG4gICAgLy9QYXJyYWluYWdlXG4gICAgLyphcHAudXNlKGFzeW5jIChyZXEsIHJlczogRXhwcmVzcy5SZXNwb25zZSwgZG9uZSkgPT4ge1xuXG4gICAgICAgIGlmIChyZXEucXVlcnkucGFycmFpbl9pZCAhPSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgIHJlcS5zZXNzaW9uLnBhcnJhaW5faWQgPSByZXEucXVlcnkucGFycmFpbl9pZDtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChyZXEuaXNBdXRoZW50aWNhdGVkKCkgJiYgcmVxLnNlc3Npb24ucGFycmFpbl9pZCAhPSB1bmRlZmluZWQgJiYgcmVxLnVzZXIucGFycmFpbiA9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgIHJlcS51c2VyLnBhcnJhaW4gPSBhd2FpdCBVc2VyLmZpbmRPbmUoe3doZXJlOiB7cGFycmFpbmFnZV9pZDogcmVxLnNlc3Npb24ucGFycmFpbl9pZH19KTtcbiAgICAgICAgICAgIGF3YWl0IHJlcS51c2VyLnNhdmUoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGRvbmUoKTtcblxuICAgIH0pOyovXG5cbiAgICAvL1N0cmVhbVF1ZXVlXG4gICAgLyogYXN5bmMgZnVuY3Rpb24gdXBkYXRlKCkge1xuICAgICAgICAgYXdhaXQgdXBkYXRlU3RyZWFtUXVldWUoKS5jYXRjaChyZWFzb24gPT4ge1xuICAgICAgICAgICAgIGNvbnNvbGUubG9nKHJlYXNvbik7XG4gICAgICAgICB9KTtcbiAgICAgICAgIHNldFRpbWVvdXQodXBkYXRlLCAxMDAwKTtcbiAgICAgfVxuXG4gICAgIHVwZGF0ZSgpLmNhdGNoKHJlYXNvbiA9PiBjb25zb2xlLmxvZyhyZWFzb24pKTsqL1xuICAgIC8qYXBwLnVzZShhc3luYyAocmVxLCByZXM6IEV4cHJlc3MuUmVzcG9uc2UsIGRvbmUpID0+IHtcbiAgICAgICAgYXdhaXQgdXBkYXRlU3RyZWFtUXVldWUoKTtcbiAgICAgICAgZG9uZSgpO1xuICAgIH0pOyovXG5cbiAgICAvL1JvdXRlc1xuICAgIGFwcC51c2UoJy8nLCBpbmRleFJvdXRlcik7XG4gICAgYXBwLnVzZSgnL2Nhc2UnLCBjYXNlUm91dGVyKTtcbiAgICAvLyAgIGFwcC51c2UoJy9zaG9wJywgc2hvcFJvdXRlcik7XG4gICAgYXBwLnVzZSgnL3BhcnJhaW5hZ2UnLCBwYXJyYWluYWdlUm91dGVyKTtcbiAgICBhcHAudXNlKCcvZ2l2ZWF3YXknLCBnaXZlYXdheVJvdXRlcik7XG4gICAgYXBwLnVzZSgnL2NvdXBvbicsIGNvdXBvblJvdXRlcik7XG4gICAgYXBwLnVzZSgnL3BvaW50cycsIHBvaW50c1JvdXRlcik7XG4gICAgYXBwLnVzZSgnL3dhdGNoJywgd2F0Y2hSb3V0ZXIpO1xuXG4gICAgYXBwLmdldChcIi9hdXRoL3R3aXRjaFwiLCBwYXNzcG9ydC5hdXRoZW50aWNhdGUoXCJ0d2l0Y2hcIikpO1xuICAgIGFwcC5nZXQoXCIvYXV0aC90d2l0Y2gvY2FsbGJhY2tcIiwgcGFzc3BvcnQuYXV0aGVudGljYXRlKFwidHdpdGNoXCIsIHtmYWlsdXJlUmVkaXJlY3Q6IFwiL1wifSksIGZ1bmN0aW9uIChyZXEsIHJlcykge1xuICAgICAgICByZXMucmVkaXJlY3QoXCIvXCIpO1xuICAgIH0pO1xuXG5cbiAgICAvL1N5bmMgY2FzZXNcbiAgICBhd2FpdCBzeW5jQ2FzZXMoY2FzZXNDb250ZW50KTtcbiAgICBhd2FpdCBzeW5jUHJvZHVjdHMoKTtcblxufSkuY2F0Y2goZXJyb3IgPT4gY29uc29sZS5sb2coZXJyb3IpKTtcblxubW9kdWxlLmV4cG9ydHMgPSBhcHA7XG4iXX0=