import {CaseOwned} from "../database/entity/CaseOwned";
import {CaseContent} from "../database/entity/CaseContent";
import {getDBConnection} from "../database/connection";
import {SteamKey} from "../database/entity/SteamKey";

var express = require('express');
var router = express.Router();

//Check if user has case, else return undefined
async function hasCase(req): Promise<CaseOwned | undefined> {
    if (req.isUnauthenticated()) {
        return undefined;
    }

    //Get uuid Post or Get
    let uuid = req['query'].uuid == undefined ? req['body'].uuid : req['query'].uuid;

    if (uuid == undefined) {
        return undefined;
    }

    //Find unopened case
    const repository = getDBConnection().getRepository(CaseOwned);
    return await repository.createQueryBuilder("c")
        .leftJoinAndSelect("c.user", "user")
        .leftJoinAndSelect("c.case", "case")
        .leftJoinAndSelect("case.content", "content")
        .where("user.id = :id", {id: req.user.id})
        .andWhere("c.uuid = :uuid", {uuid})
        .andWhere("contentId IS NULL")
        .getOne();
}

router.post('/open', async function (req: Express.Request, res) {

    const repository = getDBConnection().getRepository(CaseOwned);

    let caseOwned = await hasCase(req);
    if (caseOwned == undefined) {
        return res.status(403).send('Bad Request');
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

    //Give prize
    await winning.applyContent(req.user);
    return res.json(spin);

});

router.get('/show', async function (req: Express.Request, res) {

    let caseOwned = await hasCase(req);
    if (caseOwned == undefined) {
        res.redirect('/case/inventory');
        return;
    }

    res.render('./case', {
        title: 'TwitchRunners - Caisse',
        req,
        uuid: req['query'].uuid,
        caseContent: caseOwned.case.content,
        steamKeyAvailable: SteamKey.isAvailable()
    });

});

router.get('/inventory', async function (req: Express.Request, res) {

    if (req.isUnauthenticated()) {
        res.redirect("/");
        return;
    }

    res.render("inventory", {title: 'TwitchRunners - Inventaire', req});

});

module.exports = router;