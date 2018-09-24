import {getPower} from "../database/entity/UserPower";

export {}; //Do not remove
import AssertStatic = Chai.AssertStatic;

const chai = require("chai");

var assert: AssertStatic = chai.assert;

describe("Power test", () => {

    it('getPower()', function () {
        assert.isNotFalse(getPower("double_points"), "Get double_points");
        assert.isFalse(getPower("i_do_not_exist"), "Get non existant power");
    });


});