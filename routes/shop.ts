var express = require('express');
var router = express.Router();

// eslint-disable-next-line no-unused-vars
import {Response} from 'express';
import {Product} from "../database/entity/Product";


router.get('/', async function (req: Express.Request, res: Response) {

    if (req.isUnauthenticated()) {
        return res.redirect("/");
    }

    res.render("shop", {
        title: "TwitchRunner - Boutique",
        req,
        products: JSON.stringify(await Product.getAllProducts())
    });

});

module.exports = router;
