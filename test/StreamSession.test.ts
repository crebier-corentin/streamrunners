import {createConnection, getConnection} from "typeorm";
import {StreamSession} from "../database/entity/StreamSession";
import {User} from "../database/entity/User";
import AssertStatic = Chai.AssertStatic;

const chai = require("chai");

var assert: AssertStatic = chai.assert;

describe("newStreamSession", () => {

    //Create connection and add data
    before(async () => {
        await createConnection("test").catch(error => console.log(error));

        //Repository
        const userRepository = getConnection('test').getRepository(User);

        //User
        let u = await userRepository.create();
        u.twitchId = "1";
        u.username = "test";
        u.email = "test@test.com";
        u.avatar = "";

        await userRepository.save(u);

    });

    it("Create 2 session one after the other", async () => {
        let user = await getConnection("test").getRepository(User).findOne({twitchId: "1"});

        const session1 = await StreamSession.newStreamSession(user);
        const session2 = await StreamSession.newStreamSession(user);

        assert.equal(session1.lastTime().getTime(), session2.startTime().getTime(), "Session 2 should start when Session 1 ends");
        assert.isAbove(session2.lastTime().getTime(), session1.lastTime().getTime(), "Session 2 should end after Session 1");


    });

    //Close connection and clear data
    after(async () => {

        //Repository
        await getConnection('test').getRepository(User).clear();
        await getConnection('test').getRepository(StreamSession).clear();

        await getConnection("test").close();

    });

});