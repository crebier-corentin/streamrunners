// eslint-disable-next-line no-undef
import e = require("express");
import {User} from "../database/entity/User";

var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', async function (req: Express.Request, res) {


    //Si connecter afficher le stream, sinon afficher la page d'acceuil
    if (req.isAuthenticated()) {
        res.render("./watch", {title: 'TwitchRunners - Accueil', req});

    }
    else {
        res.render('./index', {title: 'TwitchRunners - Accueil', req, viewers: (await User.viewers())});
    }
});

router.get("/logout", (req: Express.Request, res: e.Response) => {

    if (req.isAuthenticated()) {
        req.logOut();
    }

    res.redirect("/");

});

module.exports = router;
