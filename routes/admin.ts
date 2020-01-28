import {User} from "../database/entity/User";
import {Response, Request} from 'express';
import {SteamKey} from "../database/entity/SteamKey";

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

    //Clé steam
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

module.exports = router;
