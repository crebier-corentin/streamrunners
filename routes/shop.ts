var express = require('express');
var router = express.Router();

// eslint-disable-next-line no-unused-vars
import { Response } from 'express';
import {User} from "../database/entity/User";


router.get('/', async function (req : Express.Request, res : Response) {

    res.render("shop");

});

module.exports = router;
