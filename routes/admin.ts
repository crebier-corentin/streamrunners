import {User} from "../database/entity/User";
import {Response, Request} from 'express';
import {SteamKey} from "../database/entity/SteamKey";
import {Raffle} from "../database/entity/Raffle";
import {DiscordBot} from "../other/DiscordBot";

var express = require('express');
var router = express.Router();

router.use((req: Request, res: Response, next) => {
    if (req.isUnauthenticated() || !req.user.moderator) return res.status(404).end();

    next();
});

router.get('/', async function (req: Express.Request, res: Response) {

    //Nombre d'utilisateur
    const users = (await User.find());
    const totalUsers = users.length;

    //Nombre de points
    const totalPoints = (await User.createQueryBuilder("user")
        .select("SUM(user.points)", "totalPoints")
        .getRawOne()).totalPoints;

    //Clé steamwatch
    const usedKey = await SteamKey.createQueryBuilder("key")
        .where("caseOwnedId IS NOT NULL")
        .getCount();

    const totalKey = await SteamKey.count();

    return res.render('admin', {
        req,
        title: "StreamRunners - Administration",
        totalUsers,
        totalPoints,
        usedKey,
        totalKey
    });
});

router.get('/raffle', async function (req: Request, res: Response) {

    const raffles = await Raffle.find({
        order: {createdAt: "DESC"},
        take: 50,
        relations: ["winner"],
        loadEagerRelations: false
    });

    return res.render('admin-raffle', {
        req,
        title: "StreamRunners - Administration Tombolas",
        raffles
    });
});

router.post('/raffle/add', async function (req: Request, res: Response) {

    const raffle = new Raffle();
    raffle.title = req.body.title;
    raffle.description = req.body.description ?? "";
    raffle.icon = req.body.icon;
    raffle.price = Number(req.body.price);
    raffle.maxTickets = Number(req.body.maxTickets);
    raffle.endingDate = new Date(Date.parse(req.body.endingDate));
    raffle.code = req.body.code;
    raffle.value = Number(req.body.value);

    await raffle.save();

    //Discord notification
    await DiscordBot.sendRaffleNotificationMessage(raffle);

    res.redirect("/admin/raffle");
});


module.exports = router;
