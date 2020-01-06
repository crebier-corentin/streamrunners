"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiL1N0cmVhbVJ1bm5lcnMvVHdpdGNoVmlldy9yb3V0ZXMvcG9pbnRzLnRzIiwic291cmNlcyI6WyIvU3RyZWFtUnVubmVycy9Ud2l0Y2hWaWV3L3JvdXRlcy9wb2ludHMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7OztBQUFBLElBQUksT0FBTyxHQUFHLE9BQU8sQ0FBQyxTQUFTLENBQUMsQ0FBQztBQUNqQyxJQUFJLE1BQU0sR0FBRyxPQUFPLENBQUMsTUFBTSxFQUFFLENBQUM7QUFNOUIsTUFBTSxDQUFDLEdBQUcsQ0FBQyxHQUFHLEVBQUUsVUFBZ0IsR0FBb0IsRUFBRSxHQUFhOztRQUUvRCxHQUFHLENBQUMsTUFBTSxDQUFDLFFBQVEsRUFBRSxFQUFDLEtBQUssRUFBRSx3QkFBd0IsRUFBRSxHQUFHLEVBQUMsQ0FBQyxDQUFDO0lBRWpFLENBQUM7Q0FBQSxDQUFDLENBQUM7QUFFSCxNQUFNLENBQUMsT0FBTyxHQUFHLE1BQU0sQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbInZhciBleHByZXNzID0gcmVxdWlyZSgnZXhwcmVzcycpO1xudmFyIHJvdXRlciA9IGV4cHJlc3MuUm91dGVyKCk7XG5cbi8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBuby11bnVzZWQtdmFyc1xuaW1wb3J0IHtSZXNwb25zZX0gZnJvbSAnZXhwcmVzcyc7XG5cblxucm91dGVyLmdldCgnLycsIGFzeW5jIGZ1bmN0aW9uIChyZXE6IEV4cHJlc3MuUmVxdWVzdCwgcmVzOiBSZXNwb25zZSkge1xuXG4gICAgcmVzLnJlbmRlcihcInBvaW50c1wiLCB7dGl0bGU6IFwiU3RyZWFtUnVubmVycyAtIFBvaW50c1wiLCByZXF9KTtcblxufSk7XG5cbm1vZHVsZS5leHBvcnRzID0gcm91dGVyO1xuIl19