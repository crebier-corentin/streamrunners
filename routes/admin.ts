import {User} from "../database/entity/User";
import {Response, Request} from 'express';
import {SteamKey} from "../database/entity/SteamKey";
import {Raffle} from "../database/entity/Raffle";

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

router.get('/raffles', async function (req: Express.Request, res: Response) {

    const raffles = await Raffle.find({order: {createdAt: "DESC"}});

    return res.render('admin-raffles', {
        req,
        title: "StreamRunners - Administration Tombolas",
        raffles
    });
});

module.exports = router;
