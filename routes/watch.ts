import {StreamQueue, updateStreamQueue} from "../database/entity/StreamQueue";
import {Repository} from "typeorm";
import {getDBConnection} from "../database/connection";
import {User} from "../database/entity/User";
import {throttle} from 'throttle-debounce';
import {ChatMessage} from "../database/entity/ChatMessage";
import {Request, Response} from "express";
import * as  expressThrottle from "express-throttle";
import {DiscordBot} from "../other/DiscordBot";
import {Twitch} from "../other/Twitch";

const moment = require("moment");

var express = require('express');
var router = express.Router();

async function sendData(req: Express.Request, res) {

    const [queue, viewers, /*mostPoints, mostPlace,*/ messages] = await Promise.all([
        StreamQueue.currentAndNextStreams(), //queue
        User.viewers(), //viewers
        // User.mostPoints(), //mostPoints
        // User.mostPlace(), //mostPlace
        ChatMessage.getLastMessages() //messages
    ]);

    res.send({
        auth: true,
        points: req.user.points,
        queue,
        viewers,
        // mostPoints,
        // mostPlace,
        messages
    });
}

//Auth
router.use((req: Request, res: Response, next) => {
    if (req.isUnauthenticated()) return res.send({auth: false});

    next();
});

router.post('/update', async (req: Express.Request, res, next) => {
    //Update lastOnWatchPage
    req.user.lastOnWatchPage = new Date();
    await req.user.save();

    //Check if stream is online
    const current = await StreamQueue.currentStream();

    //Check if stream and is not self stream
    if (current == undefined || current.user.id === req.user.id) return next();

    //Check if stream is online
    const isOnline = await Twitch.isStreamOnline(current.user.twitchId);
    if (!isOnline) return next();

    const now = moment();

    //If lastUpdate was one minutes or less ago
    if (moment(req.user.lastUpdate).add(1, "minutes") >= now) {
        await req.user.changePoints((now.toDate().getTime() - req.user.lastUpdate.getTime()) / 1000);
    }

    req.user.lastUpdate = now.toDate();
    await req.user.save();

    return next();
}, sendData);

router.post('/add', async (req: Express.Request, res) => {
    //Check if queue is empty
    const cost = (await StreamQueue.isEmpty()) ? 0 : 1000;

    //Check if enough points
    if (req.user.points < cost) {
        //Not enough point
        return res.send({auth: true, enough: false, points: req.user.points, cost});
    }

    //Enough point
    //Create streamqueue
    const stream = new StreamQueue();
    stream.amount = cost;
    stream.time = 60 * 10;
    stream.user = req.user;
    await stream.save();

    //Change points
    await req.user.changePoints(-cost);

    //Discord
    await DiscordBot.sendStreamNotificationMessage();

    res.send({auth: true, enough: true});

});

router.post('/delete', async (req: Express.Request, res) => {
    //Get id
    const id = req['body'].id;

    if (id == undefined) {
        return res.send({auth: true, error: true, errorMessage: "Impossible de trouver la place"});
    }

    //Get stream
    const repo = getDBConnection().getRepository(StreamQueue);
    const stream = await repo.createQueryBuilder("queue")
        .leftJoinAndSelect("queue.user", "user")
        .where("queue.id = :id", {id})
        .andWhere("user.id = :userid", {userid: req.user.id})
        .getOne();

    if (stream == undefined || stream.user.id !== req.user.id) {
        return res.send({auth: true, error: true, errorMessage: "Impossible de trouver la place"});
    }

    if ((await StreamQueue.currentStream()).id === stream.id) {
        return res.send({auth: true, error: true, errorMessage: "On ne peut pas supprimer si on à la première place"});
    }

    //Delete stream
    await repo.remove(stream);

    //Refund
    await req.user.changePoints(stream.amount);
    await req.user.save();

    return res.send({auth: true, error: false});

});

router.post('/skip', async (req: Express.Request, res) => {

    if (req.user.moderator) {


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

router.post('/chat/add', expressThrottle({
    burst: 1,
    period: "1s",
    key: (req: Request) => req.user?.id
}), async (req: Request, res) => {
    //Validate message
    const message = (<string>req.body.message)?.trim();
    if (message.length === 0 || message.length > 200) {
        return res.status(400).send();
    }

    //Save message
    const chatMessage = new ChatMessage();
    chatMessage.author = req.user;
    chatMessage.message = message;
    await chatMessage.save();

    return res.send();

});

router.post('/chat/delete', async (req: Request, res) => {
    //Moderator only
    if (!req.user.moderator) return res.status(403).end();

    //Delete message
    const message = await ChatMessage.findOne(Number(req.body.messageId));
    message.deletedBy = req.user;
    await message.save();

    return res.send();


});

module.exports = router;
