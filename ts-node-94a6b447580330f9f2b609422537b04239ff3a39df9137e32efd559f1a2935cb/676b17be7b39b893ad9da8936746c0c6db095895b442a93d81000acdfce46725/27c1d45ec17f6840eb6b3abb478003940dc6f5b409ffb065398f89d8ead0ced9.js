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
// eslint-disable-next-line no-undef
const User_1 = require("../database/entity/User");
const SteamKey_1 = require("../database/entity/SteamKey");
var express = require('express');
var router = express.Router();
router.get('/', function (req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        //Si connecter afficher le stream, sinon afficher la page d'acceuil
        if (req.isAuthenticated()) {
            res.render("./watch", { title: 'StreamRunners - Accueil', req });
        }
        else {
            res.render('./index', { title: 'StreamRunners - Accueil', req, viewers: (yield User_1.User.viewers()) });
        }
    });
});
router.get('/admin', function (req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        if (req.isUnauthenticated() || !req.user.moderator) {
            return res.status(404).end();
        }
        //Nombre d'utilisateur
        const users = (yield User_1.User.find());
        const totalUsers = users.length;
        //Nombre de points
        let totalPoints = 0;
        for (const user of users) {
            totalPoints += user.points;
        }
        //Clé steam
        const usedKey = (yield SteamKey_1.SteamKey.createQueryBuilder("key")
            .where("caseOwnedId IS NOT NULL")
            .getMany()).length;
        const totalKey = (yield SteamKey_1.SteamKey.find()).length;
        return res.render('admin', { req, totalUsers, totalPoints, usedKey, totalKey });
    });
});
router.get("/logout", (req, res) => {
    if (req.isAuthenticated()) {
        req.logOut();
    }
    res.redirect("/");
});
module.exports = router;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiL1N0cmVhbVJ1bm5lcnMvVHdpdGNoVmlldy9yb3V0ZXMvaW5kZXgudHMiLCJzb3VyY2VzIjpbIi9TdHJlYW1SdW5uZXJzL1R3aXRjaFZpZXcvcm91dGVzL2luZGV4LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7QUFBQSxvQ0FBb0M7QUFDcEMsa0RBQTZDO0FBRTdDLDBEQUFxRDtBQUVyRCxJQUFJLE9BQU8sR0FBRyxPQUFPLENBQUMsU0FBUyxDQUFDLENBQUM7QUFDakMsSUFBSSxNQUFNLEdBQUcsT0FBTyxDQUFDLE1BQU0sRUFBRSxDQUFDO0FBRzlCLE1BQU0sQ0FBQyxHQUFHLENBQUMsR0FBRyxFQUFFLFVBQWdCLEdBQW9CLEVBQUUsR0FBRzs7UUFHckQsbUVBQW1FO1FBQ25FLElBQUksR0FBRyxDQUFDLGVBQWUsRUFBRSxFQUFFO1lBQ3ZCLEdBQUcsQ0FBQyxNQUFNLENBQUMsU0FBUyxFQUFFLEVBQUMsS0FBSyxFQUFFLHlCQUF5QixFQUFFLEdBQUcsRUFBQyxDQUFDLENBQUM7U0FFbEU7YUFDSTtZQUNELEdBQUcsQ0FBQyxNQUFNLENBQUMsU0FBUyxFQUFFLEVBQUMsS0FBSyxFQUFFLHlCQUF5QixFQUFFLEdBQUcsRUFBRSxPQUFPLEVBQUUsQ0FBQyxNQUFNLFdBQUksQ0FBQyxPQUFPLEVBQUUsQ0FBQyxFQUFDLENBQUMsQ0FBQztTQUNuRztJQUNMLENBQUM7Q0FBQSxDQUFDLENBQUM7QUFFSCxNQUFNLENBQUMsR0FBRyxDQUFDLFFBQVEsRUFBRSxVQUFnQixHQUFvQixFQUFFLEdBQUc7O1FBRTFELElBQUksR0FBRyxDQUFDLGlCQUFpQixFQUFFLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLFNBQVMsRUFBRTtZQUNoRCxPQUFPLEdBQUcsQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxFQUFFLENBQUM7U0FDaEM7UUFFRCxzQkFBc0I7UUFDdEIsTUFBTSxLQUFLLEdBQUcsQ0FBQyxNQUFNLFdBQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFDO1FBQ2xDLE1BQU0sVUFBVSxHQUFHLEtBQUssQ0FBQyxNQUFNLENBQUM7UUFFaEMsa0JBQWtCO1FBQ2xCLElBQUksV0FBVyxHQUFHLENBQUMsQ0FBQztRQUVwQixLQUFLLE1BQU0sSUFBSSxJQUFJLEtBQUssRUFBRTtZQUN0QixXQUFXLElBQUksSUFBSSxDQUFDLE1BQU0sQ0FBQztTQUM5QjtRQUVELFdBQVc7UUFDWCxNQUFNLE9BQU8sR0FBRyxDQUFDLE1BQU0sbUJBQVEsQ0FBQyxrQkFBa0IsQ0FBQyxLQUFLLENBQUM7YUFDcEQsS0FBSyxDQUFDLHlCQUF5QixDQUFDO2FBQ2hDLE9BQU8sRUFBRSxDQUFDLENBQUMsTUFBTSxDQUFDO1FBRXZCLE1BQU0sUUFBUSxHQUFHLENBQUMsTUFBTSxtQkFBUSxDQUFDLElBQUksRUFBRSxDQUFDLENBQUMsTUFBTSxDQUFDO1FBRWhELE9BQU8sR0FBRyxDQUFDLE1BQU0sQ0FBQyxPQUFPLEVBQUUsRUFBQyxHQUFHLEVBQUUsVUFBVSxFQUFFLFdBQVcsRUFBRSxPQUFPLEVBQUUsUUFBUSxFQUFDLENBQUMsQ0FBQztJQUVsRixDQUFDO0NBQUEsQ0FBQyxDQUFDO0FBRUgsTUFBTSxDQUFDLEdBQUcsQ0FBQyxTQUFTLEVBQUUsQ0FBQyxHQUFvQixFQUFFLEdBQUcsRUFBRSxFQUFFO0lBRWhELElBQUksR0FBRyxDQUFDLGVBQWUsRUFBRSxFQUFFO1FBQ3ZCLEdBQUcsQ0FBQyxNQUFNLEVBQUUsQ0FBQztLQUNoQjtJQUVELEdBQUcsQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLENBQUM7QUFFdEIsQ0FBQyxDQUFDLENBQUM7QUFFSCxNQUFNLENBQUMsT0FBTyxHQUFHLE1BQU0sQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBuby11bmRlZlxuaW1wb3J0IHtVc2VyfSBmcm9tIFwiLi4vZGF0YWJhc2UvZW50aXR5L1VzZXJcIjtcbmltcG9ydCB7Z2V0REJDb25uZWN0aW9ufSBmcm9tIFwiLi4vZGF0YWJhc2UvY29ubmVjdGlvblwiO1xuaW1wb3J0IHtTdGVhbUtleX0gZnJvbSBcIi4uL2RhdGFiYXNlL2VudGl0eS9TdGVhbUtleVwiO1xuXG52YXIgZXhwcmVzcyA9IHJlcXVpcmUoJ2V4cHJlc3MnKTtcbnZhciByb3V0ZXIgPSBleHByZXNzLlJvdXRlcigpO1xuXG5cbnJvdXRlci5nZXQoJy8nLCBhc3luYyBmdW5jdGlvbiAocmVxOiBFeHByZXNzLlJlcXVlc3QsIHJlcykge1xuXG5cbiAgICAvL1NpIGNvbm5lY3RlciBhZmZpY2hlciBsZSBzdHJlYW0sIHNpbm9uIGFmZmljaGVyIGxhIHBhZ2UgZCdhY2NldWlsXG4gICAgaWYgKHJlcS5pc0F1dGhlbnRpY2F0ZWQoKSkge1xuICAgICAgICByZXMucmVuZGVyKFwiLi93YXRjaFwiLCB7dGl0bGU6ICdTdHJlYW1SdW5uZXJzIC0gQWNjdWVpbCcsIHJlcX0pO1xuXG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgICByZXMucmVuZGVyKCcuL2luZGV4Jywge3RpdGxlOiAnU3RyZWFtUnVubmVycyAtIEFjY3VlaWwnLCByZXEsIHZpZXdlcnM6IChhd2FpdCBVc2VyLnZpZXdlcnMoKSl9KTtcbiAgICB9XG59KTtcblxucm91dGVyLmdldCgnL2FkbWluJywgYXN5bmMgZnVuY3Rpb24gKHJlcTogRXhwcmVzcy5SZXF1ZXN0LCByZXMpIHtcblxuICAgIGlmIChyZXEuaXNVbmF1dGhlbnRpY2F0ZWQoKSB8fCAhcmVxLnVzZXIubW9kZXJhdG9yKSB7XG4gICAgICAgIHJldHVybiByZXMuc3RhdHVzKDQwNCkuZW5kKCk7XG4gICAgfVxuXG4gICAgLy9Ob21icmUgZCd1dGlsaXNhdGV1clxuICAgIGNvbnN0IHVzZXJzID0gKGF3YWl0IFVzZXIuZmluZCgpKTtcbiAgICBjb25zdCB0b3RhbFVzZXJzID0gdXNlcnMubGVuZ3RoO1xuXG4gICAgLy9Ob21icmUgZGUgcG9pbnRzXG4gICAgbGV0IHRvdGFsUG9pbnRzID0gMDtcblxuICAgIGZvciAoY29uc3QgdXNlciBvZiB1c2Vycykge1xuICAgICAgICB0b3RhbFBvaW50cyArPSB1c2VyLnBvaW50cztcbiAgICB9XG5cbiAgICAvL0Nsw6kgc3RlYW1cbiAgICBjb25zdCB1c2VkS2V5ID0gKGF3YWl0IFN0ZWFtS2V5LmNyZWF0ZVF1ZXJ5QnVpbGRlcihcImtleVwiKVxuICAgICAgICAud2hlcmUoXCJjYXNlT3duZWRJZCBJUyBOT1QgTlVMTFwiKVxuICAgICAgICAuZ2V0TWFueSgpKS5sZW5ndGg7XG5cbiAgICBjb25zdCB0b3RhbEtleSA9IChhd2FpdCBTdGVhbUtleS5maW5kKCkpLmxlbmd0aDtcblxuICAgIHJldHVybiByZXMucmVuZGVyKCdhZG1pbicsIHtyZXEsIHRvdGFsVXNlcnMsIHRvdGFsUG9pbnRzLCB1c2VkS2V5LCB0b3RhbEtleX0pO1xuXG59KTtcblxucm91dGVyLmdldChcIi9sb2dvdXRcIiwgKHJlcTogRXhwcmVzcy5SZXF1ZXN0LCByZXMpID0+IHtcblxuICAgIGlmIChyZXEuaXNBdXRoZW50aWNhdGVkKCkpIHtcbiAgICAgICAgcmVxLmxvZ091dCgpO1xuICAgIH1cblxuICAgIHJlcy5yZWRpcmVjdChcIi9cIik7XG5cbn0pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IHJvdXRlcjsiXX0=