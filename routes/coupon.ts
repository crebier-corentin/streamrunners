import {getDBConnection} from "../database/connection";

var express = require('express');
var router = express.Router();

// eslint-disable-next-line no-unused-vars
import {Request, Response} from "express";
import {User} from "../database/entity/User";
import {Coupon} from "../database/entity/Coupon";


router.get('/', async function (req: Express.Request, res: Response) {
    if (req.isAuthenticated()) {
        res.render("coupon", {title: "StreamRunners - Coupons", req});
    }
    else {
        res.redirect("/");
    }
});

router.post('/add', async function (req: Request, res: Response) {

    if (req.isAuthenticated()) {
        let code = req.body.coupon;
        let userRepository = getDBConnection().getRepository(User);
        let couponRepository = getDBConnection().getRepository(Coupon);

        //If code is empty
        if (code == "" || code == undefined) {
            res.send({error: true, message: "Le code coupon est vide."});
            return;
        }

        //If coupon does not exist
        let coupon = await couponRepository.findOne({where: {name: code}, relations: ["users"]});
        if (coupon == undefined) {
            res.send({error: true, message: "Le coupon n'existe pas."});
            return;
        }

        //If code is already used
        let count = await userRepository.createQueryBuilder("user")
            .leftJoinAndSelect("user.coupons", "coupon")
            .where("user.id = :id", {id: req.user.id})
            .andWhere("coupon.name = :code", {code})
            .getCount();

        if (count > 0) {
            res.send({error: true, message: "Le coupon est déjà utilisé."});
            return;
        }

        //Is coupon expired or overused
        if (!coupon.isValid()) {
            res.send({error: true, message: "Le coupon n'est plus valide"});
            return;
        }

        //The coupon is valid
        let user = await userRepository.findOne(req.user.id, {relations: ["coupons"]});
        user.coupons.push(coupon);
        await user.changePoints(coupon.amount);
        await userRepository.save(user);

        res.send({error: false, message: `Le coupon d'une valeur de : ${coupon.amount} à été utilisé !`});
    }
    else {
        res.send({error: true, message: "Vous n'êtes pas connecté."});
    }
});

module.exports = router;
