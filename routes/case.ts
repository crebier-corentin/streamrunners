import {CaseOwned} from "../database/entity/CaseOwned";
import {CaseContent} from "../database/entity/CaseContent";
import {getDBConnection, randomString} from "../database/connection";
import {SteamKey} from "../database/entity/SteamKey";
import {StreamQueue} from "../database/entity/StreamQueue";
import {Repository} from "typeorm";
import {Case} from "../database/entity/Case";
import {User} from "../database/entity/User";
import {error} from "util";

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
    await winning.applyContent(req.user, caseOwned);
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
        steamKeyAvailable: await SteamKey.isAvailable()
    });

});

router.get('/inventory', async function (req: Express.Request, res) {

    if (req.isUnauthenticated()) {
        res.redirect("/");
        return;
    }

    res.render("inventory", {title: 'TwitchRunners - Inventaire', req});

});

router.post('/buy', async function (req: Express.Request, res) {

    if (req.isUnauthenticated()) {
        res.send({auth: false});
        return;
    }

    let cost = 10000;

    //Check if enough points
    let points = (await req.user.points);
    if (points < cost) {
        //No enough point
        res.send({auth: true, enough: false, points, cost});
    }
    else {
        //Enough point

        //Create CaseOwned
        let caseOwned = new CaseOwned();
        caseOwned.case = await getDBConnection().getRepository(Case).findOneOrFail({where: {name: "Beta"}});
        caseOwned.uuid = randomString();
        caseOwned.relationSteamKey = null;

        await getDBConnection().getRepository(CaseOwned).save(caseOwned);

        await caseOwned.reload();

        req.user.cases.push(caseOwned);
        await getDBConnection().getRepository(User).save(req.user);

        //Change points
        await req.user.changePoints(-cost);

        res.send({auth: true, enough: true});
    }

});

module.exports = router;