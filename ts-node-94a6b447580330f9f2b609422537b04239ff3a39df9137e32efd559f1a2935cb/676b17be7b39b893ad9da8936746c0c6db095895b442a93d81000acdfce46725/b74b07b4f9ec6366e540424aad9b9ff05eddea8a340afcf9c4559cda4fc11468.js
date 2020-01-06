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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiL1N0cmVhbVJ1bm5lcnMvVHdpdGNoVmlldy9hcHAudHMiLCJzb3VyY2VzIjpbIi9TdHJlYW1SdW5uZXJzL1R3aXRjaFZpZXcvYXBwLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7QUFBQSw0QkFBMEI7QUFDMUIscUNBQXlDO0FBQ3pDLGlEQUE0QztBQUc1QyxpREFBaUQ7QUFDakQscURBQWlEO0FBRWpELDRCQUEwQjtBQUUxQix1REFBZ0U7QUFFaEUsTUFBTSxNQUFNLEdBQUcsT0FBTyxDQUFDLFFBQVEsQ0FBQyxDQUFDO0FBRWpDLE1BQU0sT0FBTyxHQUFHLE9BQU8sQ0FBQyxTQUFTLENBQUMsQ0FBQztBQUNuQyxNQUFNLElBQUksR0FBRyxPQUFPLENBQUMsTUFBTSxDQUFDLENBQUM7QUFDN0IsTUFBTSxZQUFZLEdBQUcsT0FBTyxDQUFDLGVBQWUsQ0FBQyxDQUFDO0FBQzlDLE1BQU0sYUFBYSxHQUFHLE9BQU8sQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDO0FBQ2hELE1BQU0sTUFBTSxHQUFHLE9BQU8sQ0FBQyxRQUFRLENBQUMsQ0FBQztBQUNqQyxNQUFNLGVBQWUsR0FBRyxPQUFPLENBQUMsa0JBQWtCLENBQUMsQ0FBQztBQUNwRCxNQUFNLFFBQVEsR0FBRyxPQUFPLENBQUMsVUFBVSxDQUFDLENBQUM7QUFDckMsTUFBTSxjQUFjLEdBQUcsT0FBTyxDQUFDLHFCQUFxQixDQUFDLENBQUMsUUFBUSxDQUFDO0FBQy9ELE1BQU0sV0FBVyxHQUFHLE9BQU8sQ0FBQyxhQUFhLENBQUMsQ0FBQztBQUMzQyxNQUFNLE1BQU0sR0FBRyxPQUFPLENBQUMsUUFBUSxDQUFDLENBQUM7QUFFakMsTUFBTTtBQUNOLE9BQU8sQ0FBQyxRQUFRLENBQUMsQ0FBQyxNQUFNLEVBQUUsQ0FBQztBQUUzQixhQUFhO0FBQ2IsSUFBSSxXQUFXLEdBQUcsT0FBTyxDQUFDLGdCQUFnQixDQUFDLENBQUM7QUFDNUMsSUFBSSxVQUFVLEdBQUcsT0FBTyxDQUFDLGVBQWUsQ0FB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QUFFLGNBQWMsQ0FBQyxDQUFDO0lBQ3JDLEdBQUcsQ0FBQyxHQUFHLENBQUMsU0FBUyxFQUFFLFlBQVksQ0FBQyxDQUFDO0lBQ2pDLEdBQUcsQ0FBQyxHQUFHLENBQUMsU0FBUyxFQUFFLFlBQVksQ0FBQyxDQUFDO0lBQ2pDLEdBQUcsQ0FBQyxHQUFHLENBQUMsUUFBUSxFQUFFLFdBQVcsQ0FBQyxDQUFDO0lBQy9CLEdBQUcsQ0FBQyxHQUFHLENBQUMsT0FBTyxFQUFFLFVBQVUsQ0FBQyxDQUFDO0lBQzdCLEdBQUcsQ0FBQyxHQUFHLENBQUMsWUFBWSxFQUFFLGVBQWUsQ0FBQyxDQUFDO0lBQ3ZDLEdBQUcsQ0FBQyxHQUFHLENBQUMsUUFBUSxFQUFFLFdBQVcsQ0FBQyxDQUFDO0lBRS9CLEdBQUcsQ0FBQyxHQUFHLENBQUMsY0FBYyxFQUFFLFFBQVEsQ0FBQyxZQUFZLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQztJQUN6RCxHQUFHLENBQUMsR0FBRyxDQUFDLHVCQUF1QixFQUFFLFFBQVEsQ0FBQyxZQUFZLENBQUMsUUFBUSxFQUFFLEVBQUMsZUFBZSxFQUFFLEdBQUcsRUFBQyxDQUFDLEVBQUUsVUFBVSxHQUFHLEVBQUUsR0FBRztRQUN4RyxHQUFHLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxDQUFDO0lBQ3RCLENBQUMsQ0FBQyxDQUFDO0lBR0gsWUFBWTtJQUNaLE1BQU0sZ0JBQVMsQ0FBQywwQkFBWSxDQUFDLENBQUM7SUFDOUIsTUFBTSxzQkFBWSxFQUFFLENBQUM7QUFFekIsQ0FBQyxDQUFBLENBQUMsQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUM7QUFFdEMsTUFBTSxDQUFDLE9BQU8sR0FBRyxHQUFHLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgXCJyZWZsZWN0LW1ldGFkYXRhXCI7XG5pbXBvcnQge2NyZWF0ZUNvbm5lY3Rpb259IGZyb20gXCJ0eXBlb3JtXCI7XG5pbXBvcnQge1VzZXJ9IGZyb20gXCIuL2RhdGFiYXNlL2VudGl0eS9Vc2VyXCI7XG5pbXBvcnQge3VwZGF0ZVN0cmVhbVF1ZXVlfSBmcm9tIFwiLi9kYXRhYmFzZS9lbnRpdHkvU3RyZWFtUXVldWVcIjtcbmltcG9ydCB7c3luY30gZnJvbSBcImdsb2JcIjtcbmltcG9ydCB7c3luY0Nhc2VzfSBmcm9tIFwiLi9kYXRhYmFzZS9lbnRpdHkvQ2FzZVwiO1xuaW1wb3J0IHtjYXNlc0NvbnRlbnR9IGZyb20gXCIuL290aGVyL0Nhc2VDb250ZW50XCI7XG5cbmltcG9ydCBcInJlZmxlY3QtbWV0YWRhdGFcIjtcbmltcG9ydCAqIGFzIGNoaWxkX3Byb2Nlc3MgZnJvbSBcImNoaWxkX3Byb2Nlc3NcIjtcbmltcG9ydCB7UHJvZHVjdCwgc3luY1Byb2R1Y3RzfSBmcm9tIFwiLi9kYXRhYmFzZS9lbnRpdHkvUHJvZHVjdFwiO1xuXG5jb25zdCBtb21lbnQgPSByZXF1aXJlKFwibW9tZW50XCIpO1xuXG5jb25zdCBleHByZXNzID0gcmVxdWlyZSgnZXhwcmVzcycpO1xuY29uc3QgcGF0aCA9IHJlcXVpcmUoJ3BhdGgnKTtcbmNvbnN0IGNvb2tpZVBhcnNlciA9IHJlcXVpcmUoJ2Nvb2tpZS1wYXJzZXInKTtcbmNvbnN0IGNvb2tpZVNlc3Npb24gPSByZXF1aXJlKCdjb29raWUtc2Vzc2lvbicpO1xuY29uc3QgbG9nZ2VyID0gcmVxdWlyZSgnbW9yZ2FuJyk7XG5jb25zdCBleHByZXNzTnVuanVja3MgPSByZXF1aXJlKCdleHByZXNzLW51bmp1Y2tzJyk7XG5jb25zdCBwYXNzcG9ydCA9IHJlcXVpcmUoJ3Bhc3Nwb3J0Jyk7XG5jb25zdCB0d2l0Y2hTdHJhdGVneSA9IHJlcXVpcmUoXCJwYXNzcG9ydC10d2l0Y2gtbmV3XCIpLlN0cmF0ZWd5O1xuY29uc3QgY29tcHJlc3Npb24gPSByZXF1aXJlKCdjb21wcmVzc2lvbicpO1xuY29uc3QgaGVsbWV0ID0gcmVxdWlyZSgnaGVsbWV0Jyk7XG5cbi8vLmVudlxucmVxdWlyZShcImRvdGVudlwiKS5jb25maWcoKTtcblxuLy9Mb2FkIHJvdXRlc1xudmFyIGluZGV4Um91dGVyID0gcmVxdWlyZSgnLi9yb3V0ZXMvaW5kZXgnKTtcbnZhciBjYXNlUm91dGVyID0gcmVxdWlyZSgnLi9yb3V0ZXMvY2FzZScpO1xudmFyIHNob3BSb3V0ZXIgPSByZXF1aXJlKCcuL3JvdXRlcy9zaG9wJyk7XG52YXIgcGFycmFpbmFnZVJvdXRlciA9IHJlcXVpcmUoJy4vcm91dGVzL3BhcnJhaW5hZ2UnKTtcbnZhciBnaXZlYXdheVJvdXRlciA9IHJlcXVpcmUoJy4vcm91dGVzL2dpdmVhd2F5Jyk7XG52YXIgY291cG9uUm91dGVyID0gcmVxdWlyZSgnLi9yb3V0ZXMvY291cG9uJyk7XG52YXIgcG9pbnRzUm91dGVyID0gcmVxdWlyZSgnLi9yb3V0ZXMvcG9pbnRzJyk7XG52YXIgd2F0Y2hSb3V0ZXIgPSByZXF1aXJlKCcuL3JvdXRlcy93YXRjaCcpO1xudmFyIHNob3BSb3V0ZXIgPSByZXF1aXJlKCcuL3JvdXRlcy9zaG9wJyk7XG52YXIgc3R1ZmZzaG9wUm91dGVyID0gcmVxdWlyZSgnLi9yb3V0ZXMvc3R1ZmZzaG9wJyk7XG52YXIgYWRtaW5Sb3V0ZXIgPSByZXF1aXJlKCcuL3JvdXRlcy9hZG1pbicpO1xuXG4vL0FwcFxudmFyIGFwcCA9IGV4cHJlc3MoKTtcblxuZ2xvYmFsWydkaXNjb3JkQW50aVNwYW1EYXRlJ10gPSBtb21lbnQoKS5zdWJ0cmFjdChcIjIwXCIsIFwiaG91cnNcIik7XG5cbi8vREJcbmNyZWF0ZUNvbm5lY3Rpb24oKS50aGVuKGFzeW5jICgpID0+IHtcblxuICAgIGNvbnN0IGlzRGV2ID0gYXBwLmdldCgnZW52JykgPT09ICdkZXZlbG9wbWVudCc7XG5cbiAgICAvL051bmp1Y2tzXG4gICAgYXBwLnNldCgndmlld3MnLCBfX2Rpcm5hbWUgKyAnL3ZpZXdzJyk7XG4gICAgYXBwLnNldChcInZpZXcgZW5naW5lXCIsIFwibnVualwiKTtcbiAgICBjb25zdCBuamsgPSBleHByZXNzTnVuanVja3MoYXBwLCB7XG4gICAgICAgIHdhdGNoOiBpc0RldixcbiAgICAgICAgbm9DYWNoZTogaXNEZXYsXG4gICAgICAgIGdsb2JhbHM6IHtcbiAgICAgICAgICAgIEhPU1ROQU1FOiBwcm9jZXNzLmVudi5IT1NUTkFNRVxuICAgICAgICB9XG4gICAgfSk7XG5cbiAgICAvL01haW50ZW5hbmNlXG4gICAgaWYgKHByb2Nlc3MuZW52Lk1BSU5URU5BTkNFLnRvTG93ZXJDYXNlKCkgPT09IFwidHJ1ZVwiKSB7XG4gICAgICAgIGFwcC51c2UoXCIqXCIsIChyZXEsIHJlcykgPT4ge1xuICAgICAgICAgICAgcmV0dXJuIHJlcy5yZW5kZXIoXCJtYWludGVuYW5jZVwiKTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgYXBwLnVzZShsb2dnZXIoJ2RldicpKTtcbiAgICBhcHAudXNlKGV4cHJlc3MuanNvbigpKTtcbiAgICBhcHAudXNlKGV4cHJlc3MudXJsZW5jb2RlZCh7ZXh0ZW5kZWQ6IGZhbHNlfSkpO1xuICAgIGFwcC51c2UoY29va2llUGFyc2VyKCkpO1xuXG5cbiAgICBhcHAudXNlKGNvbXByZXNzaW9uKCkpO1xuICAgIGFwcC51c2UoaGVsbWV0KCkpO1xuXG4gICAgYXBwLnVzZShleHByZXNzLnN0YXRpYyhwYXRoLmpvaW4oX19kaXJuYW1lLCAncHVibGljJykpKTtcblxuICAgIGFwcC51c2UoY29va2llU2Vzc2lvbih7a2V5czogW3Byb2Nlc3MuZW52LkNPT0tJRV9LRVldfSkpOyAvLyBFeHByZXNzIGNvb2tpZSBzZXNzaW9uIG1pZGRsZXdhcmVcblxuICAgIC8vUGFzc3BvcnRcbiAgICBwYXNzcG9ydC51c2UobmV3IHR3aXRjaFN0cmF0ZWd5KHtcbiAgICAgICAgICAgIGNsaWVudElEOiBwcm9jZXNzLmVudi5UV0lUQ0hfQ0xJRU5UX0lELFxuICAgICAgICAgICAgY2xpZW50U2VjcmV0OiBwcm9jZXNzLmVudi5UV0lUQ0hfQ0xJRU5UX1NFQ1JFVCxcbiAgICAgICAgICAgIGNhbGxiYWNrVVJMOiBwcm9jZXNzLmVudi5IT1NUTkFNRSArIFwiL2F1dGgvdHdpdGNoL2NhbGxiYWNrXCIsXG4gICAgICAgICAgICBzY29wZTogXCJ1c2VyX3JlYWRcIlxuICAgICAgICB9LFxuICAgICAgICBhc3luYyBmdW5jdGlvbiAoYWNjZXNzVG9rZW4sIHJlZnJlc2hUb2tlbiwgcHJvZmlsZSwgZG9uZSkge1xuXG4gICAgICAgICAgICAvL0ZpbmQgb3IgY3JlYXRlXG4gICAgICAgICAgICBsZXQgdXNlcnMgPSBhd2FpdCBVc2VyLmZpbmQoe3R3aXRjaElkOiBwcm9maWxlLmlkfSk7XG5cbiAgICAgICAgICAgIGlmICh1c2Vycy5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICAgICAgLy9NZXQgw6Agam91clxuICAgICAgICAgICAgICAgIGxldCB1c2VyID0gdXNlcnNbMF07XG5cbiAgICAgICAgICAgICAgICB1c2VyLnVzZXJuYW1lID0gcHJvZmlsZS5sb2dpbjtcbiAgICAgICAgICAgICAgICB1c2VyLmRpc3BsYXlfbmFtZSA9IHByb2ZpbGUuZGlzcGxheV9uYW1lO1xuICAgICAgICAgICAgICAgIHVzZXIuYXZhdGFyID0gcHJvZmlsZS5wcm9maWxlX2ltYWdlX3VybDtcblxuICAgICAgICAgICAgICAgIGF3YWl0IHVzZXIuc2F2ZSgpO1xuXG4gICAgICAgICAgICAgICAgZG9uZShudWxsLCB1c2VyKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIGxldCBuZXdVc2VyID0gbmV3IFVzZXIoKTtcblxuICAgICAgICAgICAgICAgIG5ld1VzZXIudHdpdGNoSWQgPSBwcm9maWxlLmlkO1xuICAgICAgICAgICAgICAgIG5ld1VzZXIudXNlcm5hbWUgPSBwcm9maWxlLmxvZ2luO1xuICAgICAgICAgICAgICAgIG5ld1VzZXIuZGlzcGxheV9uYW1lID0gcHJvZmlsZS5kaXNwbGF5X25hbWU7XG4gICAgICAgICAgICAgICAgbmV3VXNlci5hdmF0YXIgPSBwcm9maWxlLnByb2ZpbGVfaW1hZ2VfdXJsO1xuXG4gICAgICAgICAgICAgICAgYXdhaXQgbmV3VXNlci5zYXZlKCk7XG5cbiAgICAgICAgICAgICAgICBkb25lKG51bGwsIG5ld1VzZXIpO1xuXG4gICAgICAgICAgICB9XG5cbiAgICAgICAgfSkpO1xuICAgIHBhc3Nwb3J0LnNlcmlhbGl6ZVVzZXIoZnVuY3Rpb24gKHVzZXIsIGRvbmUpIHtcbiAgICAgICAgZG9uZShudWxsLCB1c2VyLnR3aXRjaElkKTtcbiAgICB9KTtcbiAgICBwYXNzcG9ydC5kZXNlcmlhbGl6ZVVzZXIoZnVuY3Rpb24gKHR3aXRjaElkLCBkb25lKSB7XG4gICAgICAgIFVzZXIuZmluZE9uZSh7dHdpdGNoSWQ6IHR3aXRjaElkfSkudGhlbigodXNlcikgPT4ge1xuICAgICAgICAgICAgbGV0IHJlYWxVc2VyID0gdXNlciA9PSB1bmRlZmluZWQgPyBmYWxzZSA6IHVzZXI7XG4gICAgICAgICAgICBkb25lKG51bGwsIHJlYWxVc2VyKTtcbiAgICAgICAgfSk7XG4gICAgfSk7XG5cbiAgICBhcHAudXNlKHBhc3Nwb3J0LmluaXRpYWxpemUoKSk7ICAgLy8gcGFzc3BvcnQgaW5pdGlhbGl6ZSBtaWRkbGV3YXJlXG4gICAgYXBwLnVzZShwYXNzcG9ydC5zZXNzaW9uKCkpOyAgICAgIC8vIHBhc3Nwb3J0IHNlc3Npb24gbWlkZGxld2FyZVxuXG4gICAgLy9QYXJyYWluYWdlXG4gICAgLyphcHAudXNlKGFzeW5jIChyZXEsIHJlczogRXhwcmVzcy5SZXNwb25zZSwgZG9uZSkgPT4ge1xuXG4gICAgICAgIGlmIChyZXEucXVlcnkucGFycmFpbl9pZCAhPSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgIHJlcS5zZXNzaW9uLnBhcnJhaW5faWQgPSByZXEucXVlcnkucGFycmFpbl9pZDtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChyZXEuaXNBdXRoZW50aWNhdGVkKCkgJiYgcmVxLnNlc3Npb24ucGFycmFpbl9pZCAhPSB1bmRlZmluZWQgJiYgcmVxLnVzZXIucGFycmFpbiA9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgIHJlcS51c2VyLnBhcnJhaW4gPSBhd2FpdCBVc2VyLmZpbmRPbmUoe3doZXJlOiB7cGFycmFpbmFnZV9pZDogcmVxLnNlc3Npb24ucGFycmFpbl9pZH19KTtcbiAgICAgICAgICAgIGF3YWl0IHJlcS51c2VyLnNhdmUoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGRvbmUoKTtcblxuICAgIH0pOyovXG5cbiAgICAvL1N0cmVhbVF1ZXVlXG4gICAgLyogYXN5bmMgZnVuY3Rpb24gdXBkYXRlKCkge1xuICAgICAgICAgYXdhaXQgdXBkYXRlU3RyZWFtUXVldWUoKS5jYXRjaChyZWFzb24gPT4ge1xuICAgICAgICAgICAgIGNvbnNvbGUubG9nKHJlYXNvbik7XG4gICAgICAgICB9KTtcbiAgICAgICAgIHNldFRpbWVvdXQodXBkYXRlLCAxMDAwKTtcbiAgICAgfVxuXG4gICAgIHVwZGF0ZSgpLmNhdGNoKHJlYXNvbiA9PiBjb25zb2xlLmxvZyhyZWFzb24pKTsqL1xuICAgIC8qYXBwLnVzZShhc3luYyAocmVxLCByZXM6IEV4cHJlc3MuUmVzcG9uc2UsIGRvbmUpID0+IHtcbiAgICAgICAgYXdhaXQgdXBkYXRlU3RyZWFtUXVldWUoKTtcbiAgICAgICAgZG9uZSgpO1xuICAgIH0pOyovXG5cbiAgICAvL1JvdXRlc1xuICAgIGFwcC51c2UoJy8nLCBpbmRleFJvdXRlcik7XG4gICAgYXBwLnVzZSgnL2Nhc2UnLCBjYXNlUm91dGVyKTtcbiAgICBhcHAudXNlKCcvcGFycmFpbmFnZScsIHBhcnJhaW5hZ2VSb3V0ZXIpO1xuICAgIGFwcC51c2UoJy9naXZlYXdheScsIGdpdmVhd2F5Um91dGVyKTtcbiAgICBhcHAudXNlKCcvY291cG9uJywgY291cG9uUm91dGVyKTtcbiAgICBhcHAudXNlKCcvcG9pbnRzJywgcG9pbnRzUm91dGVyKTtcbiAgICBhcHAudXNlKCcvd2F0Y2gnLCB3YXRjaFJvdXRlcik7XG4gICAgYXBwLnVzZSgnL3Nob3AnLCBzaG9wUm91dGVyKTtcbiAgICBhcHAudXNlKCcvc3R1ZmZzaG9wJywgc3R1ZmZzaG9wUm91dGVyKTtcbiAgICBhcHAudXNlKCcvYWRtaW4nLCBhZG1pblJvdXRlcik7XG5cbiAgICBhcHAuZ2V0KFwiL2F1dGgvdHdpdGNoXCIsIHBhc3Nwb3J0LmF1dGhlbnRpY2F0ZShcInR3aXRjaFwiKSk7XG4gICAgYXBwLmdldChcIi9hdXRoL3R3aXRjaC9jYWxsYmFja1wiLCBwYXNzcG9ydC5hdXRoZW50aWNhdGUoXCJ0d2l0Y2hcIiwge2ZhaWx1cmVSZWRpcmVjdDogXCIvXCJ9KSwgZnVuY3Rpb24gKHJlcSwgcmVzKSB7XG4gICAgICAgIHJlcy5yZWRpcmVjdChcIi9cIik7XG4gICAgfSk7XG5cblxuICAgIC8vU3luYyBjYXNlc1xuICAgIGF3YWl0IHN5bmNDYXNlcyhjYXNlc0NvbnRlbnQpO1xuICAgIGF3YWl0IHN5bmNQcm9kdWN0cygpO1xuXG59KS5jYXRjaChlcnJvciA9PiBjb25zb2xlLmxvZyhlcnJvcikpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGFwcDtcbiJdfQ==