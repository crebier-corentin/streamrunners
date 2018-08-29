import {Connection, createConnection, getConnection} from "typeorm";
import {User} from "../database/entity/User";
import {WatchSession} from "../database/entity/WatchSession";
import {StreamSession} from "../database/entity/StreamSession";
import AssertStatic = Chai.AssertStatic;

const chai = require("chai");

var assert: AssertStatic = chai.assert;

describe("Watch Session points test", () => {

    //Create connection and add data
    before(async () => {

        await createConnection("test").catch(error => console.log(error));

        //Repository
        const userRepository = getConnection('test').getRepository(User);
        const watchSessionRepository = getConnection('test').getRepository(WatchSession);

        //User and WatchSession
        let u = await userRepository.create();
        u.twitchId = "1";
        u.username = "test";
        u.display_name = "test";
        u.email = "test@test.com";
        u.avatar = "";

        await userRepository.save(u);

        let watchSession = new WatchSession();
        watchSession.user = u;

        watchSession.start = new Date(2018, 1, 1, 10, 0, 0);
        watchSession.last = new Date(2018, 1, 1, 10, 10, 0);

        await watchSessionRepository.save(watchSession);


    });

    it("No overlap", async () => {

        //Repository
        const userRepository = getConnection('test').getRepository(User);
        const streamSessionRepository = getConnection('test').getRepository(StreamSession);

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
    });

    it("Partial on left", async () => {

        //Repository
        const userRepository = getConnection('test').getRepository(User);
        const streamSessionRepository = getConnection('test').getRepository(StreamSession);

        let user = await userRepository.findOne(1);
        //Partial on left
        let s3 = new StreamSession();
        s3.user = user;

        s3.start = new Date(2018, 1, 1, 9, 50, 0);
        s3.last = new Date(2018, 1, 1, 10, 5, 0);

        await streamSessionRepository.save(s3);

        assert.equal((await user.points()), 300, "Partial on left");

        await streamSessionRepository.remove(s3);

        assert.equal((await user.points()), 0, "No overlap");
    });

    it("Partial on right", async () => {

        //Repository
        const userRepository = getConnection('test').getRepository(User);
        const streamSessionRepository = getConnection('test').getRepository(StreamSession);

        let user = await userRepository.findOne(1);

        //Partial on right
        let s4 = new StreamSession();
        s4.user = user;

        s4.start = new Date(2018, 1, 1, 10, 5, 0);
        s4.last = new Date(2018, 1, 1, 10, 20, 0);

        await streamSessionRepository.save(s4);

        assert.equal((await user.points()), 300, "Partial on right");

        await streamSessionRepository.remove(s4);

        assert.equal((await user.points()), 0, "No overlap");
    });

    it("Full overlap", async () => {

        //Repository
        const userRepository = getConnection('test').getRepository(User);
        const streamSessionRepository = getConnection('test').getRepository(StreamSession);

        let user = await userRepository.findOne(1);
        //Full overlap
        let s5 = new StreamSession();
        s5.user = user;

        s5.start = new Date(2018, 1, 1, 9, 0, 0);
        s5.last = new Date(2018, 1, 1, 11, 0, 0);

        await streamSessionRepository.save(s5);

        assert.equal((await user.points()), 600, "Full overlap");

        await streamSessionRepository.remove(s5);

        assert.equal((await user.points()), 0, "No overlap");
    });

    //Close connection and clear data
    after(async () => {

        //Repository
        await getConnection('test').getRepository(User).clear();
        await getConnection('test').getRepository(WatchSession).clear();

        await getConnection("test").close();

    });

});
