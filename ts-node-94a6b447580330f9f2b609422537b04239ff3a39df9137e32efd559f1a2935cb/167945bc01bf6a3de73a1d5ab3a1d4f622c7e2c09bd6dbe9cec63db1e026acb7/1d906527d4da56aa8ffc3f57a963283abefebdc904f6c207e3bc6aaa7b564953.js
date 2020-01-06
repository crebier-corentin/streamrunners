"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
var express = require('express');
var router = express.Router();
router.get('/', function (req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        res.render("points", { title: "StreamRunners - Points", req });
    });
});
module.exports = router;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiL1N0cmVhbVJ1bm5lcnMvVHdpdGNoVmlldy9yb3V0ZXMvcG9pbnRzLnRzIiwic291cmNlcyI6WyIvU3RyZWFtUnVubmVycy9Ud2l0Y2hWaWV3L3JvdXRlcy9wb2ludHMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7QUFBQSxJQUFJLE9BQU8sR0FBRyxPQUFPLENBQUMsU0FBUyxDQUFDLENBQUM7QUFDakMsSUFBSSxNQUFNLEdBQUcsT0FBTyxDQUFDLE1BQU0sRUFBRSxDQUFDO0FBTTlCLE1BQU0sQ0FBQyxHQUFHLENBQUMsR0FBRyxFQUFFLFVBQWdCLEdBQW9CLEVBQUUsR0FBYTs7UUFFL0QsR0FBRyxDQUFDLE1BQU0sQ0FBQyxRQUFRLEVBQUUsRUFBQyxLQUFLLEVBQUUsd0JBQXdCLEVBQUUsR0FBRyxFQUFDLENBQUMsQ0FBQztJQUVqRSxDQUFDO0NBQUEsQ0FBQyxDQUFDO0FBRUgsTUFBTSxDQUFDLE9BQU8sR0FBRyxNQUFNLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyJ2YXIgZXhwcmVzcyA9IHJlcXVpcmUoJ2V4cHJlc3MnKTtcbnZhciByb3V0ZXIgPSBleHByZXNzLlJvdXRlcigpO1xuXG4vLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgbm8tdW51c2VkLXZhcnNcbmltcG9ydCB7UmVzcG9uc2V9IGZyb20gJ2V4cHJlc3MnO1xuXG5cbnJvdXRlci5nZXQoJy8nLCBhc3luYyBmdW5jdGlvbiAocmVxOiBFeHByZXNzLlJlcXVlc3QsIHJlczogUmVzcG9uc2UpIHtcblxuICAgIHJlcy5yZW5kZXIoXCJwb2ludHNcIiwge3RpdGxlOiBcIlN0cmVhbVJ1bm5lcnMgLSBQb2ludHNcIiwgcmVxfSk7XG5cbn0pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IHJvdXRlcjtcbiJdfQ==