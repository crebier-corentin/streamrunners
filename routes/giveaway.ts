import {Raffle} from "../database/entity/Raffle";

var express = require('express');
var router = express.Router();

// eslint-disable-next-line no-unused-vars
import {Response} from 'express';

//Auth only
router.use((req, res, next) => {
    if (req.isUnauthenticated()) {
        res.redirect("/");
        return;
    }

    next();
});

router.get('/', async function (req: Express.Request, res: Response) {

    const rafflesActive = await Raffle.actives();
    const rafflesEnded = await Raffle.ended();

    res.render("giveaway", {title: "StreamRunners - Giveaway", req, rafflesActive, rafflesEnded});

});

module.exports = router;
