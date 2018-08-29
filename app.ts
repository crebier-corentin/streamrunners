import "reflect-metadata";
import {createConnection} from "typeorm";
import {User} from "./database/entity/User";
import {updateStreamSession} from "./database/entity/StreamSession";
import {updateStreamQueue} from "./database/entity/StreamQueue";

const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const cookieSession = require('cookie-session');
const logger = require('morgan');
const expressNunjucks = require('express-nunjucks');
const passport = require('passport');
const twitchStrategy = require("passport-twitch").Strategy;
const compression = require('compression');

//.env
require("dotenv").config();

//Load routes
var indexRouter = require('./routes/index');
var shopRouter = require('./routes/shop');
var parrainageRouter = require('./routes/parrainage');
var giveawayRouter = require('./routes/giveaway');
var pointsRouter = require('./routes/points');
var watchRouter = require('./routes/watch');

//App
var app = express();

//DB
createConnection().then(async () => {

    const isDev = app.get('env') === 'development';

    //Nunjucks
    app.set('views', __dirname + '/views');
    app.set("view engine", "nunj");
    const njk = expressNunjucks(app, {
        watch: isDev,
        noCache: isDev
    });

    app.use(logger('dev'));
    app.use(express.json());
    app.use(express.urlencoded({extended: false}));
    app.use(cookieParser());

    app.use(compression());
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

                user.username = profile._json.name;
                user.display_name = profile._json.display_name;
                user.email = profile._json.email;
                user.avatar = profile._json.logo;

                await user.save();

                done(null, user);
            }
            else {
                let newUser = new User();

                newUser.twitchId = profile.id;
                newUser.username = profile._json.name;
                newUser.display_name = profile._json.display_name;
                newUser.email = profile._json.email;
                newUser.avatar = profile._json.logo;

                await newUser.save();

                done(null, newUser);

            }

        }));
    passport.serializeUser(function (user, done) {
        done(null, user.twitchId);
    });
    passport.deserializeUser(function (twitchId, done) {
        User.findOne({twitchId: twitchId}).then((user) => {
            done(null, user);
        });
    });

    app.use(passport.initialize());   // passport initialize middleware
    app.use(passport.session());      // passport session middleware

    //Parrainage
    app.use(async (req, res: Express.Response, done) => {

        if (req.query.parrain_id != undefined) {
            req.session.parrain_id = req.query.parrain_id;
        }

        if (req.isAuthenticated() && req.session.parrain_id != undefined && req.user.parrain == undefined) {
            req.user.parrain = await User.findOne({where: {parrainage_id: req.session.parrain_id}});
            await req.user.save();
        }

        done();

    });


    //Routes
    app.use('/', indexRouter);
    app.use('/shop', shopRouter);
    app.use('/parrainage', parrainageRouter);
    app.use('/giveaway', giveawayRouter);
    app.use('/points', pointsRouter);
    app.use('/watch', watchRouter);

    app.get("/auth/twitch", passport.authenticate("twitch"));
    app.get("/auth/twitch/callback", passport.authenticate("twitch", {failureRedirect: "/"}), function (req, res) {
        res.redirect("/");
    });

    //Update StreamSession
    function streamSessionCallback() {
        updateStreamSession()
            .then(() => {
                setTimeout(streamSessionCallback, 3000);
            })
            .catch((error) => {
                setTimeout(streamSessionCallback, 3000);
            });
    }

    //Update StreamQueue
    function streamQueueCallback() {
        updateStreamQueue()
            .then(() => {
                setTimeout(streamQueueCallback, 1000);
            })
            .catch((error) => {
                setTimeout(streamQueueCallback, 1000);
            });
    }

    streamSessionCallback();
    streamQueueCallback();

}).catch(error => console.log(error));

module.exports = app;
