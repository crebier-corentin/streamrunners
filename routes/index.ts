// eslint-disable-next-line no-undef
import {User} from "../database/entity/User";
import {getDBConnection} from "../database/connection";
import {SteamKey} from "../database/entity/SteamKey";
import {createCanvas, loadImage, Image} from "canvas";
import {shuffledArray} from "../other/utils";

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

router.get('/banner', async function (req: Express.Request, res) {

    //Get 18 avatars
    const avatars: Image[] = [];
    outer:
        while (avatars.length < 18) {
            const avatarUrls = (await getDBConnection().getRepository(User).find({select: ["avatar"]})).map(u => u.avatar);
            const shuffled = shuffledArray(avatarUrls);

            for (const url of shuffled) {
                try {
                    avatars.push(await loadImage(url));
                }
                catch {
                    //Ignore
                }
                if (avatars.length > 18) break outer;
            }

        }

    //Build banner
    const canvas = createCanvas(600, 300);
    const ctx = canvas.getContext("2d");

    for (let x = 0; x < 6; x++) {
        for (let y = 0; y < 3; y++) {

            var image = avatars[y * 6 + x];
            ctx.drawImage(image, x * 100, y * 100, 100, 100)
        }
    }

    //Return image
    res.set('Content-Type', 'image/png');
    return res.send(canvas.toBuffer('image/png'));

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
