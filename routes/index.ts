// eslint-disable-next-line no-undef
import {User} from "../database/entity/User";
import {getDBConnection} from "../database/connection";
import {SteamKey} from "../database/entity/SteamKey";

var express = require('express');
var router = express.Router();


router.get('/', async function (req: Express.Request, res) {


    //Si connecter afficher le stream, sinon afficher la page d'acceuil
    if (req.isAuthenticated()) {
        res.render("./watch", {title: 'StreamRunners - Accueil', req});

    }
    else {
        res.render('./index', {title: 'StreamRunners - Accueil', req, viewers: (await User.viewers())});
    }
});

router.get('/admin', async function (req: Express.Request, res) {

    if (req.isUnauthenticated() || !req.user.moderator) {
        return res.status(404).end();
    }

    //Nombre d'utilisateur
    const users = (await User.find());
    const totalUsers = users.length;

    //Nombre de points
    let totalPoints = 0;

    for (const user of users) {
        totalPoints += user.points;
    }

    //Clé steam
    const usedKey = (await SteamKey.createQueryBuilder("key")
        .where("caseOwnedId IS NOT NULL")
        .getMany()).length;

    const totalKey = (await SteamKey.find()).length;

    return res.render('admin', {req, totalUsers, totalPoints, usedKey, totalKey});

});

router.get("/logout", (req: Express.Request, res) => {

    if (req.isAuthenticated()) {
        req.logOut();
    }

    res.redirect("/");

});

module.exports = router;