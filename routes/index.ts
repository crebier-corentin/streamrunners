import e = require("express");

import moment = require("moment");
import {WatchSession} from "../database/entity/WatchSession";

var express = require('express');
var router = express.Router();

var csrf = require('csurf');
var csrfProtection = csrf();

/* GET home page. */
router.get('/', csrfProtection, async function (req, res, next) {

    res.render('./index', {title: 'express', csrfToken: req.csrfToken()});
});

router.post('/update/watch', csrfProtection, (req: Express.Request, res: e.Response) => {

    if (req.isAuthenticated()) {
        let newDate = moment();

        //Get last Watch session
        let watchSessionArr = req.user.watchSession;
        let watchSession = watchSessionArr[watchSessionArr.length - 1];

        //Compare if less than 5 minutes since last update update last watchSession
        if (moment(watchSession.last).add(5, "minutes") >= newDate) {
            //Its been less than 5 minutes since last update
            watchSession.last = newDate.toDate();
            watchSession.save();

            res.send({auth: true, points: req.user.points()});

        }
        else {
            //Its been more than 5 minutes since last update, start new watchSession
            let newWatchSession = new WatchSession();
            newWatchSession.user = req.user;

            res.send({auth: true, points: req.user.points()});

        }

    }
    else {
        //Not auth
        return res.send({auth: false});
    }

});

router.get("/logout", (req: Express.Request, res: e.Response) => {

    if (req.isAuthenticated()) {
        req.logOut();
    }

    res.redirect("/");

});

module.exports = router;
