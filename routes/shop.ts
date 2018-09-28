import {gateway} from "../other/BraintreeGateway";

var express = require('express');
var router = express.Router();

// eslint-disable-next-line no-unused-vars
import {Response} from 'express';
import {products} from "../database/entity/Transaction";


router.get('/', async function (req: Express.Request, res: Response) {

    return res.redirect("/");

    if (req.isUnauthenticated()) {
        return res.redirect("/");
    }

    const clientToken = await gateway.clientToken.generate();

    if (!clientToken.success) {
        return res.status(500).send();
    }

    res.render("shop", {
        title: "TwitchRunner - Boutique",
        req,
        clientToken: clientToken.clientToken,
        sandbox: process.env.BRAINTREE_SANDBOX,
        products: products
    });

});

module.exports = router;
