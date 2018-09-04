import e = require("express");

var express = require('express');
var router = express.Router();

router.get('/case', async function (req: Express.Request, res) {

    if (req.isAuthenticated()) {
        res.render('./case', {title: 'TwitchRunners - Accueil', req});
    }

    res.redirect("/");

});

module.exports = router;