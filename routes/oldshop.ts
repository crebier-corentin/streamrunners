var express = require('express');
var router = express.Router();

// eslint-disable-next-line no-unused-vars
import {Response} from 'express';


router.get('/', async function (req: Express.Request, res: Response) {

    res.render("oldshop", {title: "StreamRunners - Abonnements", req});

});

module.exports = router;