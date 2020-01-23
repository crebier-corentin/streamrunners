import {Raffle} from "../database/entity/Raffle";

var express = require('express');
var router = express.Router();

// eslint-disable-next-line no-unused-vars
import {Request, Response} from 'express';
import {RaffleParticipation} from "../database/entity/RaffleParticipation";

//Auth only
router.use((req, res, next) => {
    if (req.isUnauthenticated()) {
        res.redirect("/");
        return;
    }

    next();
});

const index = async function (req: Request, res: Response) {

    const rafflesEnded = await Raffle.ended();
    const rafflesActive = await Promise.all((await Raffle.actives()).map(async (raffle: Raffle & { ticketCount: number }) => {

        raffle.ticketCount = (await RaffleParticipation.findForUserAndRaffle(req.user, raffle))?.tickets ?? 0;

        return raffle;
    }));

    res.render("giveaway", {title: "StreamRunners - Giveaway", req, rafflesActive, rafflesEnded});

};

router.get('/', index);

router.post('/buy', async function (req: Request, res: Response, next) {

    const raffle = await Raffle.findOne(Number(req.body.raffleId));

    //Ignore if the raffle is over or doesn't exist
    if (!raffle?.active()) return next();

    const rp = await RaffleParticipation.findOrCreate(req.user, raffle);

    //Ignore if max
    if (raffle.maxTickets > 0 && rp.tickets >= raffle.maxTickets) return next();

    //Ignore if not enough money
    if (req.user.points < rp.raffle.price) return next();

    //Pay and add ticket
    req.user.changePoints(-raffle.price);
    rp.tickets++;

    await rp.save();

    next();

}, index);

module.exports = router;
