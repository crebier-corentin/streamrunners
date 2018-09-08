import e = require("express");
import {Case} from "../database/entity/Case";
import {CaseOwned} from "../database/entity/CaseOwned";
import {CaseContent} from "../database/entity/CaseContent";
import {User} from "../database/entity/User";

var express = require('express');
var router = express.Router();

router.get('/', async function (req: Express.Request, res) {

    if (req.isUnauthenticated()) {
        res.redirect("/");
        return;
    }

    let caseOwned = new CaseOwned();
    caseOwned.case = (await Case.findOne(1));

    let spin = [];

    //Get Content
    let winning: CaseContent;
    for (let i = 0; i < 56; i++) {
        let item = caseOwned.case.getRandomContent();
        spin.push({name: item.name, color: item.getRareColor(), image: item.image});

        if (i === 51) {
            winning = item;
        }
    }

    //Winning = 51
    caseOwned.content = winning;
    req.user.cases.push(caseOwned);

    await caseOwned.save();
    await req.user.save();

    res.render('./case', {title: 'TwitchRunners - Accueil', req, spin: JSON.stringify(spin)});

});

module.exports = router;