import {getPower, UserPower} from "../database/entity/UserPower";

export {}; //Do not remove
import AssertStatic = Chai.AssertStatic;
import {createConnection, getConnection} from "typeorm";
import {User} from "../database/entity/User";

const chai = require("chai");
var chaiAsPromised = require("chai-as-promised");

chai.use(chaiAsPromised);

var assert: AssertStatic & { isFulfilled, isRejected } = chai.assert;

describe("Power test", () => {

    before(async () => {

        await createConnection("test").catch(error => console.log(error));

        //Repository
        const userRepository = getConnection('test').getRepository(User);

        //User and WatchSession
        let u = await userRepository.create();
        u.twitchId = "1";
        u.username = "test";
        u.display_name = "test";
        u.email = "test@test.com";
        u.avatar = "a";

        await userRepository.save(u);


    });

    it('getPower()', function () {
        assert.isNotFalse(getPower("double_points"), "Get double_points");
        assert.isFalse(getPower("i_do_not_exist"), "Get non existant power");
    });

    it('addPower()', async function () {

        const userRepository = getConnection('test').getRepository(User);

        let user = await userRepository.findOne({twitchId: "1"});

        assert.isFulfilled(user.addPower("double_points"));
        assert.isRejected(user.addPower("i_do_not_exist"));

        await user.addPower("double_points");

        assert.propertyVal(<any>user.powers[0], "powerName", "double_points");


    });

    it('power.use()', async function () {
        const userRepository = getConnection('test').getRepository(User);
        let user = await userRepository.findOne({twitchId: "1"});

        let power = user.powers[0];
        await power.use();

        assert.equal(user.currentPower(), power);

    });

    it('currentPower()', async function () {
        const userRepository = getConnection('test').getRepository(User);
        let user = await userRepository.findOne({twitchId: "1"});

        assert.equal((<UserPower>user.currentPower()).powerName, "double_points");

    });

    after(async () => {

        //Close Repository
        await getConnection('test').getRepository(UserPower).clear();
        await getConnection('test').getRepository(User).clear();

        await getConnection("test").close();

    });


});