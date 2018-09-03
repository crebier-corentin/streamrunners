var express = require('express');
var router = express.Router();

// eslint-disable-next-line no-unused-vars
import {Response} from 'express';


router.get('/', async function (req: Express.Request, res: Response) {

    if (req.isAuthenticated()) {

        res.render("parrainage", {title: "TwitchRunners - Parrainage", req, hostname: process.env.HOSTNAME});
    }
    else {
        res.redirect("/");
    }
});

module.exports = router;
