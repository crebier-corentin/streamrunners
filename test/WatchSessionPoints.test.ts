import {createConnection} from "typeorm";
import {User} from "../database/entity/User";
import {WatchSession} from "../database/entity/WatchSession";
import {StreamSession} from "../database/entity/StreamSession";
import AssertStatic = Chai.AssertStatic;

const chai = require("chai");

var assert: AssertStatic = chai.assert;

describe("Watch Session points test", () => {

    it("Should give correct number of points", async () => {

        createConnection("test").then(async (connection) => {

            //Repository
            const userRepository = connection.getRepository(User);
            const watchSessionRepository = connection.getRepository(WatchSession);
            const streamSessionRepository = connection.getRepository(StreamSession);

            //User and WatchSession
            let u = await userRepository.create();
            u.twitchId = "1";
            u.username = "test";
            u.email = "test@test.com";
            u.avatar = "";

            await userRepository.save(u);

            let watchSession = new WatchSession();
            watchSession.user = u;

            watchSession.start = new Date(2018, 1, 1, 10, 0, 0);
            watchSession.last = new Date(2018, 1, 1, 10, 10, 0);

            await watchSessionRepository.save(watchSession);

            let user = await userRepository.findOne(1);

            //0 Points
            let s1 = new StreamSession();
            s1.user = user;

            s1.start = new Date(2018, 1, 1, 9, 0, 0);
            s1.last = new Date(2018, 1, 1, 9, 50, 0);

            await streamSessionRepository.save(s1);

            let s2 = new StreamSession();
            s2.user = user;

            s2.start = new Date(2018, 1, 1, 10, 15, 0);
            s2.last = new Date(2018, 1, 1, 10, 20, 0);

            await streamSessionRepository.save(s2);

            assert.equal((await user.points()), 0, "No overlap");

            await streamSessionRepository.remove(s1);
            await streamSessionRepository.remove(s2);

            //Partial on left
            let s3 = new StreamSession();
            s3.user = user;

            s3.start = new Date(2018, 1, 1, 9, 50, 0);
            s3.last = new Date(2018, 1, 1, 10, 5, 0);

            await streamSessionRepository.save(s3);

            assert.equal((await user.points()), 30, "Partial on left");

            await streamSessionRepository.remove(s3);

            assert.equal((await user.points()), 0, "No overlap");

            //Partial on right
            let s4 = new StreamSession();
            s4.user = user;

            s4.start = new Date(2018, 1, 1, 10, 5, 0);
            s4.last = new Date(2018, 1, 1, 10, 20, 0);

            await streamSessionRepository.save(s4);

            assert.equal((await user.points()), 30, "Partial on right");

            await streamSessionRepository.remove(s4);

            assert.equal((await user.points()), 0, "No overlap");

            //Full overlap
            let s5 = new StreamSession();
            s5.user = user;

            s5.start = new Date(2018, 1, 1, 9, 0, 0);
            s5.last = new Date(2018, 1, 1, 11, 0, 0);

            await streamSessionRepository.save(s5);

            assert.equal((await user.points()), 60, "Full overlap");

            await streamSessionRepository.remove(s5);

            assert.equal((await user.points()), 0, "No overlap");


        }).catch(error => console.log(error));

    });

});