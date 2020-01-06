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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiL1N0cmVhbVJ1bm5lcnMvVHdpdGNoVmlldy9yb3V0ZXMvaW5kZXgudHMiLCJzb3VyY2VzIjpbIi9TdHJlYW1SdW5uZXJzL1R3aXRjaFZpZXcvcm91dGVzL2luZGV4LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7O0FBQUEsb0NBQW9DO0FBQ3BDLGtEQUE2QztBQUU3QywwREFBcUQ7QUFFckQsSUFBSSxPQUFPLEdBQUcsT0FBTyxDQUFDLFNBQVMsQ0FBQyxDQUFDO0FBQ2pDLElBQUksTUFBTSxHQUFHLE9BQU8sQ0FBQyxNQUFNLEVBQUUsQ0FBQztBQUc5QixNQUFNLENBQUMsR0FBRyxDQUFDLEdBQUcsRUFBRSxVQUFnQixHQUFvQixFQUFFLEdBQUc7O1FBR3JELG1FQUFtRTtRQUNuRSxJQUFJLEdBQUcsQ0FBQyxlQUFlLEVBQUUsRUFBRTtZQUN2QixHQUFHLENBQUMsTUFBTSxDQUFDLFNBQVMsRUFBRSxFQUFDLEtBQUssRUFBRSx5QkFBeUIsRUFBRSxHQUFHLEVBQUMsQ0FBQyxDQUFDO1NBRWxFO2FBQ0k7WUFDRCxHQUFHLENBQUMsTUFBTSxDQUFDLFNBQVMsRUFBRSxFQUFDLEtBQUssRUFBRSx5QkFBeUIsRUFBRSxHQUFHLEVBQUUsT0FBTyxFQUFFLENBQUMsTUFBTSxXQUFJLENBQUMsT0FBTyxFQUFFLENBQUMsRUFBQyxDQUFDLENBQUM7U0FDbkc7SUFDTCxDQUFDO0NBQUEsQ0FBQyxDQUFDO0FBRUgsTUFBTSxDQUFDLEdBQUcsQ0FBQyxRQUFRLEVBQUUsVUFBZ0IsR0FBb0IsRUFBRSxHQUFHOztRQUUxRCxJQUFJLEdBQUcsQ0FBQyxpQkFBaUIsRUFBRSxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxTQUFTLEVBQUU7WUFDaEQsT0FBTyxHQUFHLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsRUFBRSxDQUFDO1NBQ2hDO1FBRUQsc0JBQXNCO1FBQ3RCLE1BQU0sS0FBSyxHQUFHLENBQUMsTUFBTSxXQUFJLENBQUMsSUFBSSxFQUFFLENBQUMsQ0FBQztRQUNsQyxNQUFNLFVBQVUsR0FBRyxLQUFLLENBQUMsTUFBTSxDQUFDO1FBRWhDLGtCQUFrQjtRQUNsQixJQUFJLFdBQVcsR0FBRyxDQUFDLENBQUM7UUFFcEIsS0FBSyxNQUFNLElBQUksSUFBSSxLQUFLLEVBQUU7WUFDdEIsV0FBVyxJQUFJLElBQUksQ0FBQyxNQUFNLENBQUM7U0FDOUI7UUFFRCxXQUFXO1FBQ1gsTUFBTSxPQUFPLEdBQUcsQ0FBQyxNQUFNLG1CQUFRLENBQUMsa0JBQWtCLENBQUMsS0FBSyxDQUFDO2FBQ3BELEtBQUssQ0FBQyx5QkFBeUIsQ0FBQzthQUNoQyxPQUFPLEVBQUUsQ0FBQyxDQUFDLE1BQU0sQ0FBQztRQUV2QixNQUFNLFFBQVEsR0FBRyxDQUFDLE1BQU0sbUJBQVEsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFDLE1BQU0sQ0FBQztRQUVoRCxPQUFPLEdBQUcsQ0FBQyxNQUFNLENBQUMsT0FBTyxFQUFFLEVBQUMsR0FBRyxFQUFFLFVBQVUsRUFBRSxXQUFXLEVBQUUsT0FBTyxFQUFFLFFBQVEsRUFBQyxDQUFDLENBQUM7SUFFbEYsQ0FBQztDQUFBLENBQUMsQ0FBQztBQUVILE1BQU0sQ0FBQyxHQUFHLENBQUMsU0FBUyxFQUFFLENBQUMsR0FBb0IsRUFBRSxHQUFHLEVBQUUsRUFBRTtJQUVoRCxJQUFJLEdBQUcsQ0FBQyxlQUFlLEVBQUUsRUFBRTtRQUN2QixHQUFHLENBQUMsTUFBTSxFQUFFLENBQUM7S0FDaEI7SUFFRCxHQUFHLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxDQUFDO0FBRXRCLENBQUMsQ0FBQyxDQUFDO0FBRUgsTUFBTSxDQUFDLE9BQU8sR0FBRyxNQUFNLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgbm8tdW5kZWZcbmltcG9ydCB7VXNlcn0gZnJvbSBcIi4uL2RhdGFiYXNlL2VudGl0eS9Vc2VyXCI7XG5pbXBvcnQge2dldERCQ29ubmVjdGlvbn0gZnJvbSBcIi4uL2RhdGFiYXNlL2Nvbm5lY3Rpb25cIjtcbmltcG9ydCB7U3RlYW1LZXl9IGZyb20gXCIuLi9kYXRhYmFzZS9lbnRpdHkvU3RlYW1LZXlcIjtcblxudmFyIGV4cHJlc3MgPSByZXF1aXJlKCdleHByZXNzJyk7XG52YXIgcm91dGVyID0gZXhwcmVzcy5Sb3V0ZXIoKTtcblxuXG5yb3V0ZXIuZ2V0KCcvJywgYXN5bmMgZnVuY3Rpb24gKHJlcTogRXhwcmVzcy5SZXF1ZXN0LCByZXMpIHtcblxuXG4gICAgLy9TaSBjb25uZWN0ZXIgYWZmaWNoZXIgbGUgc3RyZWFtLCBzaW5vbiBhZmZpY2hlciBsYSBwYWdlIGQnYWNjZXVpbFxuICAgIGlmIChyZXEuaXNBdXRoZW50aWNhdGVkKCkpIHtcbiAgICAgICAgcmVzLnJlbmRlcihcIi4vd2F0Y2hcIiwge3RpdGxlOiAnU3RyZWFtUnVubmVycyAtIEFjY3VlaWwnLCByZXF9KTtcblxuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgICAgcmVzLnJlbmRlcignLi9pbmRleCcsIHt0aXRsZTogJ1N0cmVhbVJ1bm5lcnMgLSBBY2N1ZWlsJywgcmVxLCB2aWV3ZXJzOiAoYXdhaXQgVXNlci52aWV3ZXJzKCkpfSk7XG4gICAgfVxufSk7XG5cbnJvdXRlci5nZXQoJy9hZG1pbicsIGFzeW5jIGZ1bmN0aW9uIChyZXE6IEV4cHJlc3MuUmVxdWVzdCwgcmVzKSB7XG5cbiAgICBpZiAocmVxLmlzVW5hdXRoZW50aWNhdGVkKCkgfHwgIXJlcS51c2VyLm1vZGVyYXRvcikge1xuICAgICAgICByZXR1cm4gcmVzLnN0YXR1cyg0MDQpLmVuZCgpO1xuICAgIH1cblxuICAgIC8vTm9tYnJlIGQndXRpbGlzYXRldXJcbiAgICBjb25zdCB1c2VycyA9IChhd2FpdCBVc2VyLmZpbmQoKSk7XG4gICAgY29uc3QgdG90YWxVc2VycyA9IHVzZXJzLmxlbmd0aDtcblxuICAgIC8vTm9tYnJlIGRlIHBvaW50c1xuICAgIGxldCB0b3RhbFBvaW50cyA9IDA7XG5cbiAgICBmb3IgKGNvbnN0IHVzZXIgb2YgdXNlcnMpIHtcbiAgICAgICAgdG90YWxQb2ludHMgKz0gdXNlci5wb2ludHM7XG4gICAgfVxuXG4gICAgLy9DbMOpIHN0ZWFtXG4gICAgY29uc3QgdXNlZEtleSA9IChhd2FpdCBTdGVhbUtleS5jcmVhdGVRdWVyeUJ1aWxkZXIoXCJrZXlcIilcbiAgICAgICAgLndoZXJlKFwiY2FzZU93bmVkSWQgSVMgTk9UIE5VTExcIilcbiAgICAgICAgLmdldE1hbnkoKSkubGVuZ3RoO1xuXG4gICAgY29uc3QgdG90YWxLZXkgPSAoYXdhaXQgU3RlYW1LZXkuZmluZCgpKS5sZW5ndGg7XG5cbiAgICByZXR1cm4gcmVzLnJlbmRlcignYWRtaW4nLCB7cmVxLCB0b3RhbFVzZXJzLCB0b3RhbFBvaW50cywgdXNlZEtleSwgdG90YWxLZXl9KTtcblxufSk7XG5cbnJvdXRlci5nZXQoXCIvbG9nb3V0XCIsIChyZXE6IEV4cHJlc3MuUmVxdWVzdCwgcmVzKSA9PiB7XG5cbiAgICBpZiAocmVxLmlzQXV0aGVudGljYXRlZCgpKSB7XG4gICAgICAgIHJlcS5sb2dPdXQoKTtcbiAgICB9XG5cbiAgICByZXMucmVkaXJlY3QoXCIvXCIpO1xuXG59KTtcblxubW9kdWxlLmV4cG9ydHMgPSByb3V0ZXI7Il19