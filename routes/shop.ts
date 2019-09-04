var express = require('express');
var router = express.Router();

// eslint-disable-next-line no-unused-vars
import {Response} from 'express';
import {Product} from "../database/entity/Product";


router.get('/', async function (req: Express.Request, res: Response) {

    if (req.isAuthenticated()) {

        res.render("shop", {title: "StreamRunners - Boutique", req, hostname: process.env.HOSTNAME});
    }
    else {
        res.redirect("/");
    }
});

module.exports = router;
