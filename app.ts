//.env
require("dotenv").config();

import {Announcement} from "./database/entity/Announcement";
import "reflect-metadata";
import {createConnection} from "typeorm";
import {User} from "./database/entity/User";
import {syncCases} from "./database/entity/Case";
import {casesContent} from "./other/CaseContent";

import "reflect-metadata";
import {syncProducts} from "./database/entity/Product";
import {Raffle} from "./database/entity/Raffle";
import {DiscordBot} from "./other/DiscordBot";
import {BannerDrawer} from "./other/BannerDrawer";
import {intervalWait} from "./other/utils";
import {updateStreamQueue} from "./database/entity/StreamQueue";

const moment = require("moment");

const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const cookieSession = require('cookie-session');
const logger = require('morgan');
const nunjucks = require('nunjucks');
const passport = require('passport');
const twitchStrategy = require("passport-twitch-new").Strategy;
const compression = require('compression');
const helmet = require('helmet');


//Load routes
var indexRouter = require('./routes/index');
var caseRouter = require('./routes/case');
var shopRouter = require('./routes/shop');
var parrainageRouter = require('./routes/parrainage');
var giveawayRouter = require('./routes/giveaway');
var couponRouter = require('./routes/coupon');
var pointsRouter = require('./routes/points');
var watchRouter = require('./routes/watch');
var stuffshopRouter = require('./routes/stuffshop');
var adminRouter = require('./routes/admin');
var oldshopRouter = require('./routes/oldshop');

//App
var app = express();

//DB
createConnection().then(async () => {

    const isDev = app.get('env') === 'development';

    //Nunjucks
    app.set('views', __dirname + '/views');
    app.set("view engine", "nunj");
    nunjucks.configure("views/", {
        watch: isDev,
        noCache: isDev,
        express: app
    })
        .addGlobal("HOSTNAME", process.env.HOSTNAME)
        .addGlobal("LastAnnouncement", Announcement.LastAnnouncement)
        //Await nunjucks (https://www.npmjs.com/package/nunjucks-await-filter)
        .addFilter("await", async (functionPromise, callback) => {
            try {
                // The called function returns a Promise, which we
                // now `await` until its done
                const result = await functionPromise;

                // Then we call the Nunjucks async filter callback
                callback(null, result);
            }
            catch (error) {
                // And if the `functionPromise` throws an error
                // Nunjucks will pick it up here
                callback(error);
            }
        }, true);

    //Discord
    try {
        await DiscordBot.initializeDiscordClient({
            token: process.env.DISCORD_TOKEN,
            siteUserCountChannelId: process.env.SITE_USER_COUNT_CHANNEL_ID,
            discordMemberCountChannelId: process.env.DISCORD_MEMBER_COUNT_CHANNEL_ID,
            streamNotificationChannelId: process.env.STREAM_NOTIFICATION_CHANNEL_ID,
            streamNotificationRoleId: process.env.STREAM_NOTIFICATION_ROLE_ID,
            raffleNotificationChannelId: process.env.RAFFLE_NOTIFICATION_CHANNEL_ID,
            raffleNotificationRoleId: process.env.RAFFLE_NOTIFICATION_ROLE_ID
        });
    }
    catch (e) {
        console.error(e);
        console.log("Unable to start discord bot");
    }

    //Maintenance
    if (process.env.MAINTENANCE?.toLowerCase() === "true") {
        app.use("*", (req, res) => {
            return res.render("maintenance");
        });
    }

    app.use(logger('dev'));
    app.use(express.json());
    app.use(express.urlencoded({extended: false}));
    app.use(cookieParser());


    app.use(compression());
    app.use(helmet());

    app.use(express.static(path.join(__dirname, 'public')));

    app.use(cookieSession({keys: [process.env.COOKIE_KEY]})); // Express cookie session middleware

    //Passport
    passport.use(new twitchStrategy({
            clientID: process.env.TWITCH_CLIENT_ID,
            clientSecret: process.env.TWITCH_CLIENT_SECRET,
            callbackURL: process.env.HOSTNAME + "/auth/twitch/callback",
            scope: "user_read"
        },
        async function (accessToken, refreshToken, profile, done) {

            //Find or create
            let users = await User.find({twitchId: profile.id});

            if (users.length > 0) {
                //Met à jour
                let user = users[0];

                user.username = profile.login;
                user.display_name = profile.display_name;
                user.avatar = profile.profile_image_url;

                await user.save();

                done(null, user);
            }
            else {
                let newUser = new User();

                newUser.twitchId = profile.id;
                newUser.username = profile.login;
                newUser.display_name = profile.display_name;
                newUser.avatar = profile.profile_image_url;

                await newUser.save();

                await DiscordBot.updateSiteUserCount();

                done(null, newUser);

            }

        }));
    passport.serializeUser(function (user, done) {
        done(null, user.twitchId);
    });
    passport.deserializeUser(function (twitchId, done) {
        User.findOne({twitchId: twitchId}).then((user) => {
            let realUser = user == undefined ? false : user;
            done(null, realUser);
        });
    });

    app.use(passport.initialize());   // passport initialize middleware
    app.use(passport.session());      // passport session middleware

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

    //Banner, update every minute
    await BannerDrawer.loadDefaultBanner();
    intervalWait(1000 * 60, BannerDrawer.updateBanner);

    //Every minute, check for raffle winners
    intervalWait(1000 * 60, Raffle.pickWinners);

    //StreamQueue update every second
    intervalWait(1000, updateStreamQueue);

    //Sync users with twitch every hour
    intervalWait(1000 * 60 * 60, User.syncFromTwitch);

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
    app.use('/oldshop', oldshopRouter);

    app.get("/auth/twitch", passport.authenticate("twitch"));
    app.get("/auth/twitch/callback", passport.authenticate("twitch", {failureRedirect: "/"}), function (req, res) {
        res.redirect("/");
    });

    //Sync cases
    await syncCases(casesContent);
    await syncProducts();


}).catch(error => console.log(error));

module.exports = app;
