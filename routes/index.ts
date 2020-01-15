// eslint-disable-next-line no-undef
import {User} from "../database/entity/User";
import {getDBConnection} from "../database/connection";
import {SteamKey} from "../database/entity/SteamKey";
import {createCanvas, loadImage, Image} from "canvas";
import {shuffledArray} from "../other/utils";
import CacheService from "../other/CacheService";

var express = require('express');
var router = express.Router();


router.get('/', async function (req: Express.Request, res) {


    //Si connecter afficher le stream, sinon afficher la page d'acceuil
    if (req.isAuthenticated()) {
        res.render("./watch", {title: 'StreamRunners - Accueil', req});

    }
    else {
        res.render('./index', {title: 'StreamRunners - Accueil', req, viewers: (await User.viewers()).length});
    }
});

const pickAvatars = async (count: number): Promise<Image[]> => {
    const avatars: Image[] = [];
    while (avatars.length < count) {
        const avatarUrls = (await getDBConnection().getRepository(User).find({select: ["avatar"]})).map(u => u.avatar);
        const shuffled = shuffledArray(avatarUrls);

        for (const url of shuffled) {
            try {
                avatars.push(await loadImage(url));
            }
            catch {
                //Ignore
            }
            if (avatars.length > count) return avatars;
        }

    }
    return avatars;
};
const drawBanner = async (columns: number, rows: number): Promise<Buffer> => {

    const avatars = await pickAvatars(columns * rows);

    const canvas = createCanvas(columns * 100, rows * 100);
    const ctx = canvas.getContext("2d");

    for (let x = 0; x < columns; x++) {
        for (let y = 0; y < rows; y++) {

            var image = avatars[y * columns + x];
            ctx.drawImage(image, x * 100, y * 100, 100, 100)
        }
    }

    return canvas.toBuffer('image/png');
};

const bannerCache = new CacheService(60); //1 minute cache
router.get('/banner', async function (req: Express.Request, res) {

    var banner = await bannerCache.get("banner", drawBanner.bind(null, 10, 5));

    res.set('Content-Type', 'image/png');
    return res.send(banner);

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
