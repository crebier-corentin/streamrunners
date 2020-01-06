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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiL1N0cmVhbVJ1bm5lcnMvVHdpdGNoVmlldy9hcHAudHMiLCJzb3VyY2VzIjpbIi9TdHJlYW1SdW5uZXJzL1R3aXRjaFZpZXcvYXBwLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7O0FBQUEsNEJBQTBCO0FBQzFCLHFDQUF5QztBQUN6QyxpREFBNEM7QUFHNUMsaURBQWlEO0FBQ2pELHFEQUFpRDtBQUVqRCw0QkFBMEI7QUFFMUIsdURBQWdFO0FBRWhFLE1BQU0sTUFBTSxHQUFHLE9BQU8sQ0FBQyxRQUFRLENBQUMsQ0FBQztBQUVqQyxNQUFNLE9BQU8sR0FBRyxPQUFPLENBQUMsU0FBUyxDQUFDLENBQUM7QUFDbkMsTUFBTSxJQUFJLEdBQUcsT0FBTyxDQUFDLE1BQU0sQ0FBQyxDQUFDO0FBQzdCLE1BQU0sWUFBWSxHQUFHLE9BQU8sQ0FBQyxlQUFlLENBQUMsQ0FBQztBQUM5QyxNQUFNLGFBQWEsR0FBRyxPQUFPLENBQUMsZ0JBQWdCLENBQUMsQ0FBQztBQUNoRCxNQUFNLE1BQU0sR0FBRyxPQUFPLENBQUMsUUFBUSxDQUFDLENBQUM7QUFDakMsTUFBTSxlQUFlLEdBQUcsT0FBTyxDQUFDLGtCQUFrQixDQUFDLENBQUM7QUFDcEQsTUFBTSxRQUFRLEdBQUcsT0FBTyxDQUFDLFVBQVUsQ0FBQyxDQUFDO0FBQ3JDLE1BQU0sY0FBYyxHQUFHLE9BQU8sQ0FBQyxxQkFBcUIsQ0FBQyxDQUFDLFFBQVEsQ0FBQztBQUMvRCxNQUFNLFdBQVcsR0FBRyxPQUFPLENBQUMsYUFBYSxDQUFDLENBQUM7QUFDM0MsTUFBTSxNQUFNLEdBQUcsT0FBTyxDQUFDLFFBQVEsQ0FBQyxDQUFDO0FBRWpDLE1BQU07QUFDTixPQUFPLENBQUMsUUFBUSxDQUFDLENBQUMsTUFBTSxFQUFFLENBQUM7QUFFM0IsYUFBYTtBQUNiLElBQUksV0FBVyxHQUFHLE9BQU8sQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDO0FBQzVDLElBQUksVUFBVSxHQUFHLE9BQU8sQ0FBQyxlQUFlLENB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RUFBRSxjQUFjLENBQUMsQ0FBQztJQUNyQyxHQUFHLENBQUMsR0FBRyxDQUFDLFNBQVMsRUFBRSxZQUFZLENBQUMsQ0FBQztJQUNqQyxHQUFHLENBQUMsR0FBRyxDQUFDLFNBQVMsRUFBRSxZQUFZLENBQUMsQ0FBQztJQUNqQyxHQUFHLENBQUMsR0FBRyxDQUFDLFFBQVEsRUFBRSxXQUFXLENBQUMsQ0FBQztJQUMvQixHQUFHLENBQUMsR0FBRyxDQUFDLE9BQU8sRUFBRSxVQUFVLENBQUMsQ0FBQztJQUM3QixHQUFHLENBQUMsR0FBRyxDQUFDLFlBQVksRUFBRSxlQUFlLENBQUMsQ0FBQztJQUN2QyxHQUFHLENBQUMsR0FBRyxDQUFDLFFBQVEsRUFBRSxXQUFXLENBQUMsQ0FBQztJQUUvQixHQUFHLENBQUMsR0FBRyxDQUFDLGNBQWMsRUFBRSxRQUFRLENBQUMsWUFBWSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUM7SUFDekQsR0FBRyxDQUFDLEdBQUcsQ0FBQyx1QkFBdUIsRUFBRSxRQUFRLENBQUMsWUFBWSxDQUFDLFFBQVEsRUFBRSxFQUFDLGVBQWUsRUFBRSxHQUFHLEVBQUMsQ0FBQyxFQUFFLFVBQVUsR0FBRyxFQUFFLEdBQUc7UUFDeEcsR0FBRyxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsQ0FBQztJQUN0QixDQUFDLENBQUMsQ0FBQztJQUdILFlBQVk7SUFDWixNQUFNLGdCQUFTLENBQUMsMEJBQVksQ0FBQyxDQUFDO0lBQzlCLE1BQU0sc0JBQVksRUFBRSxDQUFDO0FBRXpCLENBQUMsQ0FBQSxDQUFDLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxFQUFFLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDO0FBRXRDLE1BQU0sQ0FBQyxPQUFPLEdBQUcsR0FBRyxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IFwicmVmbGVjdC1tZXRhZGF0YVwiO1xuaW1wb3J0IHtjcmVhdGVDb25uZWN0aW9ufSBmcm9tIFwidHlwZW9ybVwiO1xuaW1wb3J0IHtVc2VyfSBmcm9tIFwiLi9kYXRhYmFzZS9lbnRpdHkvVXNlclwiO1xuaW1wb3J0IHt1cGRhdGVTdHJlYW1RdWV1ZX0gZnJvbSBcIi4vZGF0YWJhc2UvZW50aXR5L1N0cmVhbVF1ZXVlXCI7XG5pbXBvcnQge3N5bmN9IGZyb20gXCJnbG9iXCI7XG5pbXBvcnQge3N5bmNDYXNlc30gZnJvbSBcIi4vZGF0YWJhc2UvZW50aXR5L0Nhc2VcIjtcbmltcG9ydCB7Y2FzZXNDb250ZW50fSBmcm9tIFwiLi9vdGhlci9DYXNlQ29udGVudFwiO1xuXG5pbXBvcnQgXCJyZWZsZWN0LW1ldGFkYXRhXCI7XG5pbXBvcnQgKiBhcyBjaGlsZF9wcm9jZXNzIGZyb20gXCJjaGlsZF9wcm9jZXNzXCI7XG5pbXBvcnQge1Byb2R1Y3QsIHN5bmNQcm9kdWN0c30gZnJvbSBcIi4vZGF0YWJhc2UvZW50aXR5L1Byb2R1Y3RcIjtcblxuY29uc3QgbW9tZW50ID0gcmVxdWlyZShcIm1vbWVudFwiKTtcblxuY29uc3QgZXhwcmVzcyA9IHJlcXVpcmUoJ2V4cHJlc3MnKTtcbmNvbnN0IHBhdGggPSByZXF1aXJlKCdwYXRoJyk7XG5jb25zdCBjb29raWVQYXJzZXIgPSByZXF1aXJlKCdjb29raWUtcGFyc2VyJyk7XG5jb25zdCBjb29raWVTZXNzaW9uID0gcmVxdWlyZSgnY29va2llLXNlc3Npb24nKTtcbmNvbnN0IGxvZ2dlciA9IHJlcXVpcmUoJ21vcmdhbicpO1xuY29uc3QgZXhwcmVzc051bmp1Y2tzID0gcmVxdWlyZSgnZXhwcmVzcy1udW5qdWNrcycpO1xuY29uc3QgcGFzc3BvcnQgPSByZXF1aXJlKCdwYXNzcG9ydCcpO1xuY29uc3QgdHdpdGNoU3RyYXRlZ3kgPSByZXF1aXJlKFwicGFzc3BvcnQtdHdpdGNoLW5ld1wiKS5TdHJhdGVneTtcbmNvbnN0IGNvbXByZXNzaW9uID0gcmVxdWlyZSgnY29tcHJlc3Npb24nKTtcbmNvbnN0IGhlbG1ldCA9IHJlcXVpcmUoJ2hlbG1ldCcpO1xuXG4vLy5lbnZcbnJlcXVpcmUoXCJkb3RlbnZcIikuY29uZmlnKCk7XG5cbi8vTG9hZCByb3V0ZXNcbnZhciBpbmRleFJvdXRlciA9IHJlcXVpcmUoJy4vcm91dGVzL2luZGV4Jyk7XG52YXIgY2FzZVJvdXRlciA9IHJlcXVpcmUoJy4vcm91dGVzL2Nhc2UnKTtcbnZhciBzaG9wUm91dGVyID0gcmVxdWlyZSgnLi9yb3V0ZXMvc2hvcCcpO1xudmFyIHBhcnJhaW5hZ2VSb3V0ZXIgPSByZXF1aXJlKCcuL3JvdXRlcy9wYXJyYWluYWdlJyk7XG52YXIgZ2l2ZWF3YXlSb3V0ZXIgPSByZXF1aXJlKCcuL3JvdXRlcy9naXZlYXdheScpO1xudmFyIGNvdXBvblJvdXRlciA9IHJlcXVpcmUoJy4vcm91dGVzL2NvdXBvbicpO1xudmFyIHBvaW50c1JvdXRlciA9IHJlcXVpcmUoJy4vcm91dGVzL3BvaW50cycpO1xudmFyIHdhdGNoUm91dGVyID0gcmVxdWlyZSgnLi9yb3V0ZXMvd2F0Y2gnKTtcbnZhciBzaG9wUm91dGVyID0gcmVxdWlyZSgnLi9yb3V0ZXMvc2hvcCcpO1xudmFyIHN0dWZmc2hvcFJvdXRlciA9IHJlcXVpcmUoJy4vcm91dGVzL3N0dWZmc2hvcCcpO1xudmFyIGFkbWluUm91dGVyID0gcmVxdWlyZSgnLi9yb3V0ZXMvYWRtaW4nKTtcblxuLy9BcHBcbnZhciBhcHAgPSBleHByZXNzKCk7XG5cbmdsb2JhbFsnZGlzY29yZEFudGlTcGFtRGF0ZSddID0gbW9tZW50KCkuc3VidHJhY3QoXCIyMFwiLCBcImhvdXJzXCIpO1xuXG4vL0RCXG5jcmVhdGVDb25uZWN0aW9uKCkudGhlbihhc3luYyAoKSA9PiB7XG5cbiAgICBjb25zdCBpc0RldiA9IGFwcC5nZXQoJ2VudicpID09PSAnZGV2ZWxvcG1lbnQnO1xuXG4gICAgLy9OdW5qdWNrc1xuICAgIGFwcC5zZXQoJ3ZpZXdzJywgX19kaXJuYW1lICsgJy92aWV3cycpO1xuICAgIGFwcC5zZXQoXCJ2aWV3IGVuZ2luZVwiLCBcIm51bmpcIik7XG4gICAgY29uc3QgbmprID0gZXhwcmVzc051bmp1Y2tzKGFwcCwge1xuICAgICAgICB3YXRjaDogaXNEZXYsXG4gICAgICAgIG5vQ2FjaGU6IGlzRGV2LFxuICAgICAgICBnbG9iYWxzOiB7XG4gICAgICAgICAgICBIT1NUTkFNRTogcHJvY2Vzcy5lbnYuSE9TVE5BTUVcbiAgICAgICAgfVxuICAgIH0pO1xuXG4gICAgLy9NYWludGVuYW5jZVxuICAgIGlmIChwcm9jZXNzLmVudi5NQUlOVEVOQU5DRS50b0xvd2VyQ2FzZSgpID09PSBcInRydWVcIikge1xuICAgICAgICBhcHAudXNlKFwiKlwiLCAocmVxLCByZXMpID0+IHtcbiAgICAgICAgICAgIHJldHVybiByZXMucmVuZGVyKFwibWFpbnRlbmFuY2VcIik7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIGFwcC51c2UobG9nZ2VyKCdkZXYnKSk7XG4gICAgYXBwLnVzZShleHByZXNzLmpzb24oKSk7XG4gICAgYXBwLnVzZShleHByZXNzLnVybGVuY29kZWQoe2V4dGVuZGVkOiBmYWxzZX0pKTtcbiAgICBhcHAudXNlKGNvb2tpZVBhcnNlcigpKTtcblxuXG4gICAgYXBwLnVzZShjb21wcmVzc2lvbigpKTtcbiAgICBhcHAudXNlKGhlbG1ldCgpKTtcblxuICAgIGFwcC51c2UoZXhwcmVzcy5zdGF0aWMocGF0aC5qb2luKF9fZGlybmFtZSwgJ3B1YmxpYycpKSk7XG5cbiAgICBhcHAudXNlKGNvb2tpZVNlc3Npb24oe2tleXM6IFtwcm9jZXNzLmVudi5DT09LSUVfS0VZXX0pKTsgLy8gRXhwcmVzcyBjb29raWUgc2Vzc2lvbiBtaWRkbGV3YXJlXG5cbiAgICAvL1Bhc3Nwb3J0XG4gICAgcGFzc3BvcnQudXNlKG5ldyB0d2l0Y2hTdHJhdGVneSh7XG4gICAgICAgICAgICBjbGllbnRJRDogcHJvY2Vzcy5lbnYuVFdJVENIX0NMSUVOVF9JRCxcbiAgICAgICAgICAgIGNsaWVudFNlY3JldDogcHJvY2Vzcy5lbnYuVFdJVENIX0NMSUVOVF9TRUNSRVQsXG4gICAgICAgICAgICBjYWxsYmFja1VSTDogcHJvY2Vzcy5lbnYuSE9TVE5BTUUgKyBcIi9hdXRoL3R3aXRjaC9jYWxsYmFja1wiLFxuICAgICAgICAgICAgc2NvcGU6IFwidXNlcl9yZWFkXCJcbiAgICAgICAgfSxcbiAgICAgICAgYXN5bmMgZnVuY3Rpb24gKGFjY2Vzc1Rva2VuLCByZWZyZXNoVG9rZW4sIHByb2ZpbGUsIGRvbmUpIHtcblxuICAgICAgICAgICAgLy9GaW5kIG9yIGNyZWF0ZVxuICAgICAgICAgICAgbGV0IHVzZXJzID0gYXdhaXQgVXNlci5maW5kKHt0d2l0Y2hJZDogcHJvZmlsZS5pZH0pO1xuXG4gICAgICAgICAgICBpZiAodXNlcnMubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgICAgIC8vTWV0IMOgIGpvdXJcbiAgICAgICAgICAgICAgICBsZXQgdXNlciA9IHVzZXJzWzBdO1xuXG4gICAgICAgICAgICAgICAgdXNlci51c2VybmFtZSA9IHByb2ZpbGUubG9naW47XG4gICAgICAgICAgICAgICAgdXNlci5kaXNwbGF5X25hbWUgPSBwcm9maWxlLmRpc3BsYXlfbmFtZTtcbiAgICAgICAgICAgICAgICB1c2VyLmF2YXRhciA9IHByb2ZpbGUucHJvZmlsZV9pbWFnZV91cmw7XG5cbiAgICAgICAgICAgICAgICBhd2FpdCB1c2VyLnNhdmUoKTtcblxuICAgICAgICAgICAgICAgIGRvbmUobnVsbCwgdXNlcik7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICBsZXQgbmV3VXNlciA9IG5ldyBVc2VyKCk7XG5cbiAgICAgICAgICAgICAgICBuZXdVc2VyLnR3aXRjaElkID0gcHJvZmlsZS5pZDtcbiAgICAgICAgICAgICAgICBuZXdVc2VyLnVzZXJuYW1lID0gcHJvZmlsZS5sb2dpbjtcbiAgICAgICAgICAgICAgICBuZXdVc2VyLmRpc3BsYXlfbmFtZSA9IHByb2ZpbGUuZGlzcGxheV9uYW1lO1xuICAgICAgICAgICAgICAgIG5ld1VzZXIuYXZhdGFyID0gcHJvZmlsZS5wcm9maWxlX2ltYWdlX3VybDtcblxuICAgICAgICAgICAgICAgIGF3YWl0IG5ld1VzZXIuc2F2ZSgpO1xuXG4gICAgICAgICAgICAgICAgZG9uZShudWxsLCBuZXdVc2VyKTtcblxuICAgICAgICAgICAgfVxuXG4gICAgICAgIH0pKTtcbiAgICBwYXNzcG9ydC5zZXJpYWxpemVVc2VyKGZ1bmN0aW9uICh1c2VyLCBkb25lKSB7XG4gICAgICAgIGRvbmUobnVsbCwgdXNlci50d2l0Y2hJZCk7XG4gICAgfSk7XG4gICAgcGFzc3BvcnQuZGVzZXJpYWxpemVVc2VyKGZ1bmN0aW9uICh0d2l0Y2hJZCwgZG9uZSkge1xuICAgICAgICBVc2VyLmZpbmRPbmUoe3R3aXRjaElkOiB0d2l0Y2hJZH0pLnRoZW4oKHVzZXIpID0+IHtcbiAgICAgICAgICAgIGxldCByZWFsVXNlciA9IHVzZXIgPT0gdW5kZWZpbmVkID8gZmFsc2UgOiB1c2VyO1xuICAgICAgICAgICAgZG9uZShudWxsLCByZWFsVXNlcik7XG4gICAgICAgIH0pO1xuICAgIH0pO1xuXG4gICAgYXBwLnVzZShwYXNzcG9ydC5pbml0aWFsaXplKCkpOyAgIC8vIHBhc3Nwb3J0IGluaXRpYWxpemUgbWlkZGxld2FyZVxuICAgIGFwcC51c2UocGFzc3BvcnQuc2Vzc2lvbigpKTsgICAgICAvLyBwYXNzcG9ydCBzZXNzaW9uIG1pZGRsZXdhcmVcblxuICAgIC8vUGFycmFpbmFnZVxuICAgIC8qYXBwLnVzZShhc3luYyAocmVxLCByZXM6IEV4cHJlc3MuUmVzcG9uc2UsIGRvbmUpID0+IHtcblxuICAgICAgICBpZiAocmVxLnF1ZXJ5LnBhcnJhaW5faWQgIT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICByZXEuc2Vzc2lvbi5wYXJyYWluX2lkID0gcmVxLnF1ZXJ5LnBhcnJhaW5faWQ7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAocmVxLmlzQXV0aGVudGljYXRlZCgpICYmIHJlcS5zZXNzaW9uLnBhcnJhaW5faWQgIT0gdW5kZWZpbmVkICYmIHJlcS51c2VyLnBhcnJhaW4gPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICByZXEudXNlci5wYXJyYWluID0gYXdhaXQgVXNlci5maW5kT25lKHt3aGVyZToge3BhcnJhaW5hZ2VfaWQ6IHJlcS5zZXNzaW9uLnBhcnJhaW5faWR9fSk7XG4gICAgICAgICAgICBhd2FpdCByZXEudXNlci5zYXZlKCk7XG4gICAgICAgIH1cblxuICAgICAgICBkb25lKCk7XG5cbiAgICB9KTsqL1xuXG4gICAgLy9TdHJlYW1RdWV1ZVxuICAgIC8qIGFzeW5jIGZ1bmN0aW9uIHVwZGF0ZSgpIHtcbiAgICAgICAgIGF3YWl0IHVwZGF0ZVN0cmVhbVF1ZXVlKCkuY2F0Y2gocmVhc29uID0+IHtcbiAgICAgICAgICAgICBjb25zb2xlLmxvZyhyZWFzb24pO1xuICAgICAgICAgfSk7XG4gICAgICAgICBzZXRUaW1lb3V0KHVwZGF0ZSwgMTAwMCk7XG4gICAgIH1cblxuICAgICB1cGRhdGUoKS5jYXRjaChyZWFzb24gPT4gY29uc29sZS5sb2cocmVhc29uKSk7Ki9cbiAgICAvKmFwcC51c2UoYXN5bmMgKHJlcSwgcmVzOiBFeHByZXNzLlJlc3BvbnNlLCBkb25lKSA9PiB7XG4gICAgICAgIGF3YWl0IHVwZGF0ZVN0cmVhbVF1ZXVlKCk7XG4gICAgICAgIGRvbmUoKTtcbiAgICB9KTsqL1xuXG4gICAgLy9Sb3V0ZXNcbiAgICBhcHAudXNlKCcvJywgaW5kZXhSb3V0ZXIpO1xuICAgIGFwcC51c2UoJy9jYXNlJywgY2FzZVJvdXRlcik7XG4gICAgYXBwLnVzZSgnL3BhcnJhaW5hZ2UnLCBwYXJyYWluYWdlUm91dGVyKTtcbiAgICBhcHAudXNlKCcvZ2l2ZWF3YXknLCBnaXZlYXdheVJvdXRlcik7XG4gICAgYXBwLnVzZSgnL2NvdXBvbicsIGNvdXBvblJvdXRlcik7XG4gICAgYXBwLnVzZSgnL3BvaW50cycsIHBvaW50c1JvdXRlcik7XG4gICAgYXBwLnVzZSgnL3dhdGNoJywgd2F0Y2hSb3V0ZXIpO1xuICAgIGFwcC51c2UoJy9zaG9wJywgc2hvcFJvdXRlcik7XG4gICAgYXBwLnVzZSgnL3N0dWZmc2hvcCcsIHN0dWZmc2hvcFJvdXRlcik7XG4gICAgYXBwLnVzZSgnL2FkbWluJywgYWRtaW5Sb3V0ZXIpO1xuXG4gICAgYXBwLmdldChcIi9hdXRoL3R3aXRjaFwiLCBwYXNzcG9ydC5hdXRoZW50aWNhdGUoXCJ0d2l0Y2hcIikpO1xuICAgIGFwcC5nZXQoXCIvYXV0aC90d2l0Y2gvY2FsbGJhY2tcIiwgcGFzc3BvcnQuYXV0aGVudGljYXRlKFwidHdpdGNoXCIsIHtmYWlsdXJlUmVkaXJlY3Q6IFwiL1wifSksIGZ1bmN0aW9uIChyZXEsIHJlcykge1xuICAgICAgICByZXMucmVkaXJlY3QoXCIvXCIpO1xuICAgIH0pO1xuXG5cbiAgICAvL1N5bmMgY2FzZXNcbiAgICBhd2FpdCBzeW5jQ2FzZXMoY2FzZXNDb250ZW50KTtcbiAgICBhd2FpdCBzeW5jUHJvZHVjdHMoKTtcblxufSkuY2F0Y2goZXJyb3IgPT4gY29uc29sZS5sb2coZXJyb3IpKTtcblxubW9kdWxlLmV4cG9ydHMgPSBhcHA7XG4iXX0=