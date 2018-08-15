var express = require('express');
var router = express.Router();

import { Response } from 'express';
import {User} from "../src/entity/User"


/* GET users listing. */
router.get('/', async function (req : Express.Request, res : Response, next) {

    let result = await User.find();

    res.send(result);

});

module.exports = router;
