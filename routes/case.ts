import {Case} from "../database/entity/Case";
import {CaseOwned} from "../database/entity/CaseOwned";
import {CaseContent} from "../database/entity/CaseContent";
import {User} from "../database/entity/User";
import {getDBConnection, randomString} from "../database/connection";

var express = require('express');
var router = express.Router();

router.get('/open', async function (req: Express.Request, res) {

    if (req.isUnauthenticated()) {
        res.redirect("/");
        return;
    }

    //Find case
    const repository = getDBConnection().getRepository(CaseOwned);
    let caseOwned = await repository.createQueryBuilder("c")
        .leftJoinAndSelect("c.user", "user")
        .leftJoinAndSelect("c.case", "case")
        .where("user.id = :id", {id: req.user.id})
        .andWhere("c.uuid = :uuid", {uuid: req['query'].uuid})
        .getOne();

    if (caseOwned == undefined) {
        res.redirect('/case/inventory');
        return;
    }

    let spin = [];

    //Get Content
    let winning: CaseContent;
    for (let i = 0; i < 56; i++) {
        let item = await caseOwned.case.getRandomContent();
        spin.push({name: item.name, color: item.getRareColor(), image: item.image});

        if (i === 51) {
            winning = item;
        }
    }

    //Winning = 51
    caseOwned.content = winning;
    await repository.save(caseOwned);

    res.render('./case', {title: 'TwitchRunners - Accueil', req, spin: JSON.stringify(spin)});

});

router.get('/inventory', async function (req: Express.Request, res) {

    if (req.isUnauthenticated()) {
        res.redirect("/");
        return;
    }

    res.render("inventory", {title: 'TwitchRunners - Inventaire', req});

});

module.exports = router;