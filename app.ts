const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const cookieSession = require('cookie-session');
const logger = require('morgan');
const sassMiddleware = require('node-sass-middleware');
const expressNunjucks = require('express-nunjucks');
const passport = require('passport');
const twitchStrategy = require("passport-twitch").Strategy;

import "reflect-metadata";
import {createConnection} from "typeorm";
import {User} from "./src/entity/User";

require('dotenv').config();


var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');


//App
var app = express();

//DB
createConnection().then(async connection => {

    const isDev = app.get('env') === 'development';

    //Nunjuncks
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
    app.use(sassMiddleware({
        src: path.join(__dirname, 'public'),
        dest: path.join(__dirname, 'public'),
        indentedSyntax: false, // true = .sass and false = .scss
        sourceMap: true
    }));
    app.use(express.static(path.join(__dirname, 'public')));
    app.use(cookieSession({keys: [process.env.COOKIE_KEY]})); // Express cookie session middleware

    //Passport
    passport.use(new twitchStrategy({
            clientID: "70wavci67bshlaalwckyr8bwo74oqw",
            clientSecret: "tmogcsuksisvibm732sa5zmqngw21a",
            callbackURL: process.env.HOSTNAME + "/auth/twitch/callback",
            scope: "user_read"
        },
        async function (accessToken, refreshToken, profile, done) {

            //Find or create
            let users = await User.find({twitchId: profile.id});

            if (users.length > 0) {
                done(null, users[0]);
            }
            else {
                let newUser = new User();

                newUser.twitchId = profile.id;
                newUser.username = profile._json.display_name;
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

    //Routes
    app.use('/', indexRouter);
    app.use('/users', usersRouter);

    app.get("/auth/twitch", passport.authenticate("twitch"));
    app.get("/auth/twitch/callback", passport.authenticate("twitch", {failureRedirect: "/"}), function (req, res) {

        res.send(req.user);
    });

}).catch(error => console.log(error));

module.exports = app;
