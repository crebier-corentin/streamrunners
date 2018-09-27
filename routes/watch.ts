import {StreamQueue} from "../database/entity/StreamQueue";
import {Repository} from "typeorm";
import {getDBConnection} from "../database/connection";
import {User} from "../database/entity/User";

const moment = require("moment");

var express = require('express');
var router = express.Router();

router.post('/update', async (req: Express.Request, res) => {

    async function sendData() {
        res.send({
            auth: true,
            points: req.user.points,
            queue: (await StreamQueue.currentAndNextStreams()),
            viewers: (await User.viewers()),
            mostPoints: (await User.mostPoints()),
            mostPlace: (await User.mostPlace()),
        });
    }

    if (req.isAuthenticated()) {

        //check if stream is online
        let current = await StreamQueue.currentStream();

        //Check if stream and is not self stream
        if (current == undefined || current.user.id === req.user.id) {
            await sendData();
            return;
        }

        let isOnline = await StreamQueue.isCurrentOnline(current.user.username);

        //Check if stream is online
        if (!isOnline) {
            await sendData();
            return;
        }

        let newDate = moment();

        let lastUpdate: Date = req.user.lastUpdateTime();

        //If lastUpdate was one minutes or less ago
        if (moment(lastUpdate).add(1, "minutes") >= newDate) {
            await req.user.changePoints((newDate.toDate().getTime() - lastUpdate.getTime()) / 1000);
            req.user.lastUpdate = newDate.toDate();
            await req.user.save();
        }
        else {
            req.user.lastUpdate = newDate.toDate();
            await req.user.save();
        }

        await sendData();
        return;


    }
    else {
        //Not auth
        return res.send({auth: false});
    }

});

router.post('/add', async (req: Express.Request, res) => {

    if (req.isAuthenticated()) {

        //Check if queue is empty
        let cost = (await StreamQueue.isEmpty()) ? 0 : 1000;

        //Check if enough pointsFunc
        let points = (await req.user.points);
        if (points < cost) {
            //No enough point
            res.send({auth: true, enough: false, points, cost});
        }
        else {
            //Enough point
            let stream = new StreamQueue();
            stream.amount = cost;
            stream.time = 60 * 10;

            stream.user = req.user;

            let repository: Repository<StreamQueue> = getDBConnection().getRepository(StreamQueue);
            await repository.save(stream);

            req.user.streamQueue.push(stream);

            //Change points
            await req.user.changePoints(-cost);

            res.send({auth: true, enough: true});
        }


    }
    else {
        //Not auth
        res.send({auth: false});

    }

});

router.post('/skip', async (req: Express.Request, res) => {

    if (req.isAuthenticated() && req.user.moderator) {


        let currentStream = await StreamQueue.currentStream();

        if (currentStream != undefined) {
            currentStream.current = currentStream.time;
            await getDBConnection().getRepository(StreamQueue).save(currentStream);
        }

        res.send("Stream skippé");


    }
    else {
        res.status(403);
        res.send("Vous n'avez pas le droit de faire ça !");
    }


});

module.exports = router;