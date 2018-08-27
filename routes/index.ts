// eslint-disable-next-line no-undef
import e = require("express");

var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', async function (req: Express.Request, res) {


    //Si connecter afficher le stream, sinon afficher la page d'acceuil
    if (req.isAuthenticated()) {
        res.render("./watch", {title: 'TwitchRunner', req});
    }
    else {
        res.render('./index', {title: 'TwitchRunner', req});
    }
});



router.get("/logout", (req: Express.Request, res: e.Response) => {

    if (req.isAuthenticated()) {
        req.logOut();
    }

    res.redirect("/");

});

module.exports = router;
