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
        if (req.isAuthenticated()) {
            res.render("parrainage", { title: "StreamRunners - Parrainage", req, hostname: process.env.HOSTNAME });
        }
        else {
            res.redirect("/");
        }
    });
});
module.exports = router;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiL1N0cmVhbVJ1bm5lcnMvVHdpdGNoVmlldy9yb3V0ZXMvcGFycmFpbmFnZS50cyIsInNvdXJjZXMiOlsiL1N0cmVhbVJ1bm5lcnMvVHdpdGNoVmlldy9yb3V0ZXMvcGFycmFpbmFnZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7OztBQUFBLElBQUksT0FBTyxHQUFHLE9BQU8sQ0FBQyxTQUFTLENBQUMsQ0FBQztBQUNqQyxJQUFJLE1BQU0sR0FBRyxPQUFPLENBQUMsTUFBTSxFQUFFLENBQUM7QUFNOUIsTUFBTSxDQUFDLEdBQUcsQ0FBQyxHQUFHLEVBQUUsVUFBZ0IsR0FBb0IsRUFBRSxHQUFhOztRQUUvRCxJQUFJLEdBQUcsQ0FBQyxlQUFlLEVBQUUsRUFBRTtZQUV2QixHQUFHLENBQUMsTUFBTSxDQUFDLFlBQVksRUFBRSxFQUFDLEtBQUssRUFBRSw0QkFBNEIsRUFBRSxHQUFHLEVBQUUsUUFBUSxFQUFFLE9BQU8sQ0FBQyxHQUFHLENBQUMsUUFBUSxFQUFDLENBQUMsQ0FBQztTQUN4RzthQUNJO1lBQ0QsR0FBRyxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsQ0FBQztTQUNyQjtJQUNMLENBQUM7Q0FBQSxDQUFDLENBQUM7QUFFSCxNQUFNLENBQUMsT0FBTyxHQUFHLE1BQU0sQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbInZhciBleHByZXNzID0gcmVxdWlyZSgnZXhwcmVzcycpO1xudmFyIHJvdXRlciA9IGV4cHJlc3MuUm91dGVyKCk7XG5cbi8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBuby11bnVzZWQtdmFyc1xuaW1wb3J0IHtSZXNwb25zZX0gZnJvbSAnZXhwcmVzcyc7XG5cblxucm91dGVyLmdldCgnLycsIGFzeW5jIGZ1bmN0aW9uIChyZXE6IEV4cHJlc3MuUmVxdWVzdCwgcmVzOiBSZXNwb25zZSkge1xuXG4gICAgaWYgKHJlcS5pc0F1dGhlbnRpY2F0ZWQoKSkge1xuXG4gICAgICAgIHJlcy5yZW5kZXIoXCJwYXJyYWluYWdlXCIsIHt0aXRsZTogXCJTdHJlYW1SdW5uZXJzIC0gUGFycmFpbmFnZVwiLCByZXEsIGhvc3RuYW1lOiBwcm9jZXNzLmVudi5IT1NUTkFNRX0pO1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgICAgcmVzLnJlZGlyZWN0KFwiL1wiKTtcbiAgICB9XG59KTtcblxubW9kdWxlLmV4cG9ydHMgPSByb3V0ZXI7XG4iXX0=