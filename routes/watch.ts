import {StreamQueue} from "../database/entity/StreamQueue";
import {WatchSession} from "../database/entity/WatchSession";
import {Repository} from "typeorm";
import {getDBConnection} from "../database/connection";
import moment = require("moment");
import e = require("express");

var express = require('express');
var router = express.Router();

router.post('/update', async (req: Express.Request, res: e.Response) => {

    async function sendData() {
        res.send({
            auth: true,
            points: (await req.user.points()),
            queue: (await StreamQueue.currentAndNextStreams()),
            viewers: (await WatchSession.viewers())
        });
    }

    if (req.isAuthenticated()) {
        let newDate = moment();

        let watchSessionArr = req.user.watchSession;

        if (watchSessionArr != undefined && watchSessionArr.length > 0) {
            //Get lastTime Watch session
            let watchSession = req.user.getLastWatchSession();

            //Compare if less than 5 minutes since lastTime update update lastTime watchSession
            if (moment(watchSession.lastTime()).add(5, "minutes") >= newDate) {
                //Its been less than 5 minutes since lastTime update
                watchSession.last = newDate.toDate();
                watchSession.save();

                await sendData();
                return;

            }

        }
        //Its been more than 5 minutes since lastTime update, startTime new watchSession
        //or
        //First watchSession
        let newWatchSession = new WatchSession();
        newWatchSession.user = req.user;
        newWatchSession.save();

        await sendData();
        return;


    }
    else {
        //Not auth
        return res.send({auth: false});
    }

});

router.post('/add', async (req: Express.Request, res: e.Response) => {

    if (req.isAuthenticated()) {

        //Check if queue is empty
        let cost = (await StreamQueue.isEmpty()) ? 0 : 1000;

        //Check if enough pointsFunc
        let points = (await req.user.points());
        if (points < cost) {
            //No enough point
            res.send({auth: true, enough: false, points, cost});
        }
        else {
            //Enough point
            let stream = new StreamQueue();
            stream.amount = cost;
            stream.time = 60*10;

            stream.user = req.user;

            let repository: Repository<StreamQueue> = getDBConnection().getRepository(StreamQueue);
            repository.save(stream);
            res.send({auth: true, enough: true});
        }


    }
    else {
        //Not auth
        res.send({auth: false});

    }

});

module.exports = router;