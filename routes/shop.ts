import {gateway} from "../other/BraintreeGateway";

var express = require('express');
var router = express.Router();

// eslint-disable-next-line no-unused-vars
import {Response} from 'express';


router.get('/', async function (req: Express.Request, res: Response) {

    if (req.isUnauthenticated()) {
        return res.redirect("/");
    }

    const clientToken = await gateway.clientToken.generate();

    if (!clientToken.success) {
        return res.status(500).send();
    }

    res.render("shop", {title: "TwitchRunner - Boutique", req, clientToken: clientToken.clientToken});

});

module.exports = router;
