// eslint-disable-next-line no-undef
import {User} from "../database/entity/User";
import {BannerDrawer} from "../other/BannerDrawer";

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

router.get('/banner', async function (req: Express.Request, res) {
    res.set('Content-Type', 'image/png');
    return res.send(BannerDrawer.getBanner());

});

router.get("/logout", (req: Express.Request, res) => {

    if (req.isAuthenticated()) {
        req.logOut();
    }

    res.redirect("/");

});

module.exports = router;
