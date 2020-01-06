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
const connection_1 = require("../database/connection");
const SteamKey_1 = require("../database/entity/SteamKey");
const canvas_1 = require("canvas");
const utils_1 = require("../other/utils");
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
router.get('/banner', function (req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        //Get 18 avatars
        const avatars = [];
        outer: while (avatars.length < 18) {
            const avatarUrls = (yield connection_1.getDBConnection().getRepository(User_1.User).find({ select: ["avatar"] })).map(u => u.avatar);
            const shuffled = utils_1.shuffledArray(avatarUrls);
            for (const url of shuffled) {
                try {
                    avatars.push(yield canvas_1.loadImage(url));
                }
                catch (_a) {
                    //Ignore
                }
                if (avatars.length > 18)
                    break outer;
            }
        }
        //Build banner
        const canvas = canvas_1.createCanvas(600, 300);
        const ctx = canvas.getContext("2d");
        for (let x = 0; x < 6; x++) {
            for (let y = 0; y < 3; y++) {
                var image = avatars[y * 6 + x];
                ctx.drawImage(image, x * 100, y * 100, 100, 100);
            }
        }
        //Return image
        res.set('Content-Type', 'image/png');
        return res.send(canvas.toBuffer('image/png'));
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiL1N0cmVhbVJ1bm5lcnMvVHdpdGNoVmlldy9yb3V0ZXMvaW5kZXgudHMiLCJzb3VyY2VzIjpbIi9TdHJlYW1SdW5uZXJzL1R3aXRjaFZpZXcvcm91dGVzL2luZGV4LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7O0FBQUEsb0NBQW9DO0FBQ3BDLGtEQUE2QztBQUM3Qyx1REFBdUQ7QUFDdkQsMERBQXFEO0FBQ3JELG1DQUFzRDtBQUN0RCwwQ0FBNkM7QUFFN0MsSUFBSSxPQUFPLEdBQUcsT0FBTyxDQUFDLFNBQVMsQ0FBQyxDQUFDO0FBQ2pDLElBQUksTUFBTSxHQUFHLE9BQU8sQ0FBQyxNQUFNLEVBQUUsQ0FBQztBQUc5QixNQUFNLENBQUMsR0FBRyxDQUFDLEdBQUcsRUFBRSxVQUFnQixHQUFvQixFQUFFLEdBQUc7O1FBR3JELG1FQUFtRTtRQUNuRSxJQUFJLEdBQUcsQ0FBQyxlQUFlLEVBQUUsRUFBRTtZQUN2QixHQUFHLENBQUMsTUFBTSxDQUFDLFNBQVMsRUFBRSxFQUFDLEtBQUssRUFBRSx5QkFBeUIsRUFBRSxHQUFHLEVBQUMsQ0FBQyxDQUFDO1NBRWxFO2FBQ0k7WUFDRCxHQUFHLENBQUMsTUFBTSxDQUFDLFNBQVMsRUFBRSxFQUFDLEtBQUssRUFBRSx5QkFBeUIsRUFBRSxHQUFHLEVBQUUsT0FBTyxFQUFFLENBQUMsTUFBTSxXQUFJLENBQUMsT0FBTyxFQUFFLENBQUMsRUFBQyxDQUFDLENBQUM7U0FDbkc7SUFDTCxDQUFDO0NBQUEsQ0FBQyxDQUFDO0FBRUgsTUFBTSxDQUFDLEdBQUcsQ0FBQyxTQUFTLEVBQUUsVUFBZ0IsR0FBb0IsRUFBRSxHQUFHOztRQUUzRCxnQkFBZ0I7UUFDaEIsTUFBTSxPQUFPLEdBQVksRUFBRSxDQUFDO1FBQzVCLEtBQUssRUFDRCxPQUFPLE9BQU8sQ0FBQyxNQUFNLEdBQUcsRUFBRSxFQUFFO1lBQ3hCLE1BQU0sVUFBVSxHQUFHLENBQUMsTUFBTSw0QkFBZSxFQUFFLENBQUMsYUFBYSxDQUFDLFdB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QUFDLEdBQW9CLEVBQUUsR0FBRyxFQUFFLEVBQUU7SUFFaEQsSUFBSSxHQUFHLENBQUMsZUFBZSxFQUFFLEVBQUU7UUFDdkIsR0FBRyxDQUFDLE1BQU0sRUFBRSxDQUFDO0tBQ2hCO0lBRUQsR0FBRyxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsQ0FBQztBQUV0QixDQUFDLENBQUMsQ0FBQztBQUVILE1BQU0sQ0FBQyxPQUFPLEdBQUcsTUFBTSxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIG5vLXVuZGVmXG5pbXBvcnQge1VzZXJ9IGZyb20gXCIuLi9kYXRhYmFzZS9lbnRpdHkvVXNlclwiO1xuaW1wb3J0IHtnZXREQkNvbm5lY3Rpb259IGZyb20gXCIuLi9kYXRhYmFzZS9jb25uZWN0aW9uXCI7XG5pbXBvcnQge1N0ZWFtS2V5fSBmcm9tIFwiLi4vZGF0YWJhc2UvZW50aXR5L1N0ZWFtS2V5XCI7XG5pbXBvcnQge2NyZWF0ZUNhbnZhcywgbG9hZEltYWdlLCBJbWFnZX0gZnJvbSBcImNhbnZhc1wiO1xuaW1wb3J0IHtzaHVmZmxlZEFycmF5fSBmcm9tIFwiLi4vb3RoZXIvdXRpbHNcIjtcblxudmFyIGV4cHJlc3MgPSByZXF1aXJlKCdleHByZXNzJyk7XG52YXIgcm91dGVyID0gZXhwcmVzcy5Sb3V0ZXIoKTtcblxuXG5yb3V0ZXIuZ2V0KCcvJywgYXN5bmMgZnVuY3Rpb24gKHJlcTogRXhwcmVzcy5SZXF1ZXN0LCByZXMpIHtcblxuXG4gICAgLy9TaSBjb25uZWN0ZXIgYWZmaWNoZXIgbGUgc3RyZWFtLCBzaW5vbiBhZmZpY2hlciBsYSBwYWdlIGQnYWNjZXVpbFxuICAgIGlmIChyZXEuaXNBdXRoZW50aWNhdGVkKCkpIHtcbiAgICAgICAgcmVzLnJlbmRlcihcIi4vd2F0Y2hcIiwge3RpdGxlOiAnU3RyZWFtUnVubmVycyAtIEFjY3VlaWwnLCByZXF9KTtcblxuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgICAgcmVzLnJlbmRlcignLi9pbmRleCcsIHt0aXRsZTogJ1N0cmVhbVJ1bm5lcnMgLSBBY2N1ZWlsJywgcmVxLCB2aWV3ZXJzOiAoYXdhaXQgVXNlci52aWV3ZXJzKCkpfSk7XG4gICAgfVxufSk7XG5cbnJvdXRlci5nZXQoJy9iYW5uZXInLCBhc3luYyBmdW5jdGlvbiAocmVxOiBFeHByZXNzLlJlcXVlc3QsIHJlcykge1xuXG4gICAgLy9HZXQgMTggYXZhdGFyc1xuICAgIGNvbnN0IGF2YXRhcnM6IEltYWdlW10gPSBbXTtcbiAgICBvdXRlcjpcbiAgICAgICAgd2hpbGUgKGF2YXRhcnMubGVuZ3RoIDwgMTgpIHtcbiAgICAgICAgICAgIGNvbnN0IGF2YXRhclVybHMgPSAoYXdhaXQgZ2V0REJDb25uZWN0aW9uKCkuZ2V0UmVwb3NpdG9yeShVc2VyKS5maW5kKHtzZWxlY3Q6IFtcImF2YXRhclwiXX0pKS5tYXAodSA9PiB1LmF2YXRhcik7XG4gICAgICAgICAgICBjb25zdCBzaHVmZmxlZCA9IHNodWZmbGVkQXJyYXkoYXZhdGFyVXJscyk7XG5cbiAgICAgICAgICAgIGZvciAoY29uc3QgdXJsIG9mIHNodWZmbGVkKSB7XG4gICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgICAgYXZhdGFycy5wdXNoKGF3YWl0IGxvYWRJbWFnZSh1cmwpKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgY2F0Y2gge1xuICAgICAgICAgICAgICAgICAgICAvL0lnbm9yZVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZiAoYXZhdGFycy5sZW5ndGggPiAxOCkgYnJlYWsgb3V0ZXI7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgfVxuXG4gICAgLy9CdWlsZCBiYW5uZXJcbiAgICBjb25zdCBjYW52YXMgPSBjcmVhdGVDYW52YXMoNjAwLCAzMDApO1xuICAgIGNvbnN0IGN0eCA9IGNhbnZhcy5nZXRDb250ZXh0KFwiMmRcIik7XG5cbiAgICBmb3IgKGxldCB4ID0gMDsgeCA8IDY7IHgrKykge1xuICAgICAgICBmb3IgKGxldCB5ID0gMDsgeSA8IDM7IHkrKykge1xuXG4gICAgICAgICAgICB2YXIgaW1hZ2UgPSBhdmF0YXJzW3kgKiA2ICsgeF07XG4gICAgICAgICAgICBjdHguZHJhd0ltYWdlKGltYWdlLCB4ICogMTAwLCB5ICogMTAwLCAxMDAsIDEwMClcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8vUmV0dXJuIGltYWdlXG4gICAgcmVzLnNldCgnQ29udGVudC1UeXBlJywgJ2ltYWdlL3BuZycpO1xuICAgIHJldHVybiByZXMuc2VuZChjYW52YXMudG9CdWZmZXIoJ2ltYWdlL3BuZycpKTtcblxufSk7XG5cbnJvdXRlci5nZXQoJy9hZG1pbicsIGFzeW5jIGZ1bmN0aW9uIChyZXE6IEV4cHJlc3MuUmVxdWVzdCwgcmVzKSB7XG5cbiAgICBpZiAocmVxLmlzVW5hdXRoZW50aWNhdGVkKCkgfHwgIXJlcS51c2VyLm1vZGVyYXRvcikge1xuICAgICAgICByZXR1cm4gcmVzLnN0YXR1cyg0MDQpLmVuZCgpO1xuICAgIH1cblxuICAgIC8vTm9tYnJlIGQndXRpbGlzYXRldXJcbiAgICBjb25zdCB1c2VycyA9IChhd2FpdCBVc2VyLmZpbmQoKSk7XG4gICAgY29uc3QgdG90YWxVc2VycyA9IHVzZXJzLmxlbmd0aDtcblxuICAgIC8vTm9tYnJlIGRlIHBvaW50c1xuICAgIGxldCB0b3RhbFBvaW50cyA9IDA7XG5cbiAgICBmb3IgKGNvbnN0IHVzZXIgb2YgdXNlcnMpIHtcbiAgICAgICAgdG90YWxQb2ludHMgKz0gdXNlci5wb2ludHM7XG4gICAgfVxuXG4gICAgLy9DbMOpIHN0ZWFtXG4gICAgY29uc3QgdXNlZEtleSA9IChhd2FpdCBTdGVhbUtleS5jcmVhdGVRdWVyeUJ1aWxkZXIoXCJrZXlcIilcbiAgICAgICAgLndoZXJlKFwiY2FzZU93bmVkSWQgSVMgTk9UIE5VTExcIilcbiAgICAgICAgLmdldE1hbnkoKSkubGVuZ3RoO1xuXG4gICAgY29uc3QgdG90YWxLZXkgPSAoYXdhaXQgU3RlYW1LZXkuZmluZCgpKS5sZW5ndGg7XG5cbiAgICByZXR1cm4gcmVzLnJlbmRlcignYWRtaW4nLCB7cmVxLCB0b3RhbFVzZXJzLCB0b3RhbFBvaW50cywgdXNlZEtleSwgdG90YWxLZXl9KTtcblxufSk7XG5cbnJvdXRlci5nZXQoXCIvbG9nb3V0XCIsIChyZXE6IEV4cHJlc3MuUmVxdWVzdCwgcmVzKSA9PiB7XG5cbiAgICBpZiAocmVxLmlzQXV0aGVudGljYXRlZCgpKSB7XG4gICAgICAgIHJlcS5sb2dPdXQoKTtcbiAgICB9XG5cbiAgICByZXMucmVkaXJlY3QoXCIvXCIpO1xuXG59KTtcblxubW9kdWxlLmV4cG9ydHMgPSByb3V0ZXI7XG4iXX0=