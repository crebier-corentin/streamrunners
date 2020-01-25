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

router.get('/', async function (req: Request, res: Response) {

    const rafflesEnded = await Raffle.ended();
    const rafflesActive = await Promise.all((await Raffle.actives()).map(async (raffle: Raffle & { ticketCount: number; total: number }) => {

        raffle.ticketCount = (await RaffleParticipation.findForUserAndRaffle(req.user, raffle))?.tickets ?? 0;
        raffle.total = (await raffle.totalTickets()) ?? 0;

        return raffle;
    }));

    res.render("giveaway", {title: "StreamRunners - Giveaway", req, rafflesActive, rafflesEnded});

});

router.post('/buy', async function (req: Request, res: Response) {

    const raffle = await Raffle.findOne(Number(req.body.raffleId), {relations: ["winner"]});

    //Ignore if the raffle is over or doesn't exist
    if (!raffle?.active()) return res.redirect("/giveaway");

    //Ignore if not enough money
    if (req.user.points < raffle.price) return res.redirect("/giveaway");

    const rp = await RaffleParticipation.findOrCreate(req.user, raffle);

    //Ignore if max
    if (raffle.maxTickets > 0 && rp.tickets === raffle.maxTickets) return res.redirect("/giveaway");

    //Pay and add ticket
    req.user.changePoints(-raffle.price);
    rp.tickets++;

    await rp.save();

    res.redirect("/giveaway");

});

module.exports = router;
