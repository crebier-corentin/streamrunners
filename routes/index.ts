// eslint-disable-next-line no-undef
import e = require("express");

const moment = require("moment");
import {WatchSession} from "../database/entity/WatchSession";

var express = require('express');
var router = express.Router();

var csrf = require('csurf');
var csrfProtection = csrf();

/* GET home page. */
router.get('/', csrfProtection, async function (req, res) {

    res.render('./index', {title: 'express', csrfToken: req.csrfToken()});
});

router.post('/update/watch', csrfProtection, (req: Express.Request, res: e.Response) => {

    if (req.isAuthenticated()) {
        let newDate = moment();

        let watchSessionArr = req.user.watchSession;

        if (watchSessionArr.length > 0) {
            //Get last Watch session
            let watchSession = watchSessionArr[watchSessionArr.length - 1];

            //Compare if less than 5 minutes since last update update last watchSession
            if (moment(watchSession.last).add(5, "minutes") >= newDate) {
                //Its been less than 5 minutes since last update
                watchSession.last = newDate.toDate();
                watchSession.save();

                res.send({auth: true, points: req.user.points()});
                return;

            }

        }
        //Its been more than 5 minutes since last update, start new watchSession
        //or
        //First watchSession
        let newWatchSession = new WatchSession();
        newWatchSession.user = req.user;

        res.send({auth: true, points: req.user.points()});
        return;


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
