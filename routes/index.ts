import e = require("express");

var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function (req, res, next) {

    res.render('./index', {title: 'express', name: "John"});
});

router.get("/logout", (req : Express.Request, res : e.Response) => {

    if(req.isAuthenticated()) {
        req.logOut();
    }

    res.redirect("/");

});

module.exports = router;
