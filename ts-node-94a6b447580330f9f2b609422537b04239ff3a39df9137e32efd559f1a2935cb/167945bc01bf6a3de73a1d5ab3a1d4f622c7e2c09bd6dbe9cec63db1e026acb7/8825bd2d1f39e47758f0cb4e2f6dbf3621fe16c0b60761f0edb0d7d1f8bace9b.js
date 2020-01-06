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
const CacheService_1 = require("../other/CacheService");
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
const pickAvatars = (count) => __awaiter(void 0, void 0, void 0, function* () {
    const avatars = [];
    while (avatars.length < count) {
        const avatarUrls = (yield connection_1.getDBConnection().getRepository(User_1.User).find({ select: ["avatar"] })).map(u => u.avatar);
        const shuffled = utils_1.shuffledArray(avatarUrls);
        for (const url of shuffled) {
            try {
                avatars.push(yield canvas_1.loadImage(url));
            }
            catch (_a) {
                //Ignore
            }
            if (avatars.length > count)
                return avatars;
        }
    }
    return avatars;
});
const drawBanner = (columns, rows) => __awaiter(void 0, void 0, void 0, function* () {
    const avatars = yield pickAvatars(columns * rows);
    const canvas = canvas_1.createCanvas(columns * 100, rows * 100);
    const ctx = canvas.getContext("2d");
    for (let x = 0; x < columns; x++) {
        for (let y = 0; y < rows; y++) {
            var image = avatars[y * columns + x];
            ctx.drawImage(image, x * 100, y * 100, 100, 100);
        }
    }
    return canvas.toBuffer('image/png');
});
const bannerCache = new CacheService_1.default(60); //1 minute cache
router.get('/banner', function (req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        var banner = yield bannerCache.get("banner", drawBanner.bind(null, 10, 5));
        res.set('Content-Type', 'image/png');
        return res.send(banner);
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiL1N0cmVhbVJ1bm5lcnMvVHdpdGNoVmlldy9yb3V0ZXMvaW5kZXgudHMiLCJzb3VyY2VzIjpbIi9TdHJlYW1SdW5uZXJzL1R3aXRjaFZpZXcvcm91dGVzL2luZGV4LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7O0FBQUEsb0NBQW9DO0FBQ3BDLGtEQUE2QztBQUM3Qyx1REFBdUQ7QUFDdkQsMERBQXFEO0FBQ3JELG1DQUFzRDtBQUN0RCwwQ0FBNkM7QUFDN0Msd0RBQWlEO0FBRWpELElBQUksT0FBTyxHQUFHLE9BQU8sQ0FBQyxTQUFTLENBQUMsQ0FBQztBQUNqQyxJQUFJLE1BQU0sR0FBRyxPQUFPLENBQUMsTUFBTSxFQUFFLENBQUM7QUFHOUIsTUFBTSxDQUFDLEdBQUcsQ0FBQyxHQUFHLEVBQUUsVUFBZ0IsR0FBb0IsRUFBRSxHQUFHOztRQUdyRCxtRUFBbUU7UUFDbkUsSUFBSSxHQUFHLENBQUMsZUFBZSxFQUFFLEVBQUU7WUFDdkIsR0FBRyxDQUFDLE1BQU0sQ0FBQyxTQUFTLEVBQUUsRUFBQyxLQUFLLEVBQUUseUJBQXlCLEVBQUUsR0FBRyxFQUFDLENBQUMsQ0FBQztTQUVsRTthQUNJO1lBQ0QsR0FBRyxDQUFDLE1BQU0sQ0FBQyxTQUFTLEVBQUUsRUFBQyxLQUFLLEVBQUUseUJBQXlCLEVBQUUsR0FBRyxFQUFFLE9BQU8sRUFBRSxDQUFDLE1BQU0sV0FBSSxDQUFDLE9BQU8sRUFBRSxDQUFDLEVBQUMsQ0FBQyxDQUFDO1NBQ25HO0lBQ0wsQ0FBQztDQUFBLENBQUMsQ0FBQztBQUVILE1BQU0sV0FBVyxHQUFHLENBQU8sS0FBYSxFQUFvQixFQUFFO0lBQzFELE1BQU0sT0FBTyxHQUFZLEVBQUUsQ0FBQztJQUM1QixPQUFPLE9BQU8sQ0FBQyxNQUFNLEdBQUcsS0FBSyxFQUFFO1FBQzNCLE1BQU0sVUFBVSxHQUFHLENBQUMsTUFBTSw0QkFBZSxFQUFFLENBQUMsYUFBYSxDQUFDLFdBQUksQ0FBQyxDQUFDLElBQUksQ0FBQyxFQUFD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SSxDQUFDLE1BQU0sQ0FBQztTQUM5QjtRQUVELFdBQVc7UUFDWCxNQUFNLE9BQU8sR0FBRyxDQUFDLE1BQU0sbUJBQVEsQ0FBQyxrQkFBa0IsQ0FBQyxLQUFLLENBQUM7YUFDcEQsS0FBSyxDQUFDLHlCQUF5QixDQUFDO2FBQ2hDLE9BQU8sRUFBRSxDQUFDLENBQUMsTUFBTSxDQUFDO1FBRXZCLE1BQU0sUUFBUSxHQUFHLENBQUMsTUFBTSxtQkFBUSxDQUFDLElBQUksRUFBRSxDQUFDLENBQUMsTUFBTSxDQUFDO1FBRWhELE9BQU8sR0FBRyxDQUFDLE1BQU0sQ0FBQyxPQUFPLEVBQUUsRUFBQyxHQUFHLEVBQUUsVUFBVSxFQUFFLFdBQVcsRUFBRSxPQUFPLEVBQUUsUUFBUSxFQUFDLENBQUMsQ0FBQztJQUVsRixDQUFDO0NBQUEsQ0FBQyxDQUFDO0FBRUgsTUFBTSxDQUFDLEdBQUcsQ0FBQyxTQUFTLEVBQUUsQ0FBQyxHQUFvQixFQUFFLEdBQUcsRUFBRSxFQUFFO0lBRWhELElBQUksR0FBRyxDQUFDLGVBQWUsRUFBRSxFQUFFO1FBQ3ZCLEdBQUcsQ0FBQyxNQUFNLEVBQUUsQ0FBQztLQUNoQjtJQUVELEdBQUcsQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLENBQUM7QUFFdEIsQ0FBQyxDQUFDLENBQUM7QUFFSCxNQUFNLENBQUMsT0FBTyxHQUFHLE1BQU0sQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBuby11bmRlZlxuaW1wb3J0IHtVc2VyfSBmcm9tIFwiLi4vZGF0YWJhc2UvZW50aXR5L1VzZXJcIjtcbmltcG9ydCB7Z2V0REJDb25uZWN0aW9ufSBmcm9tIFwiLi4vZGF0YWJhc2UvY29ubmVjdGlvblwiO1xuaW1wb3J0IHtTdGVhbUtleX0gZnJvbSBcIi4uL2RhdGFiYXNlL2VudGl0eS9TdGVhbUtleVwiO1xuaW1wb3J0IHtjcmVhdGVDYW52YXMsIGxvYWRJbWFnZSwgSW1hZ2V9IGZyb20gXCJjYW52YXNcIjtcbmltcG9ydCB7c2h1ZmZsZWRBcnJheX0gZnJvbSBcIi4uL290aGVyL3V0aWxzXCI7XG5pbXBvcnQgQ2FjaGVTZXJ2aWNlIGZyb20gXCIuLi9vdGhlci9DYWNoZVNlcnZpY2VcIjtcblxudmFyIGV4cHJlc3MgPSByZXF1aXJlKCdleHByZXNzJyk7XG52YXIgcm91dGVyID0gZXhwcmVzcy5Sb3V0ZXIoKTtcblxuXG5yb3V0ZXIuZ2V0KCcvJywgYXN5bmMgZnVuY3Rpb24gKHJlcTogRXhwcmVzcy5SZXF1ZXN0LCByZXMpIHtcblxuXG4gICAgLy9TaSBjb25uZWN0ZXIgYWZmaWNoZXIgbGUgc3RyZWFtLCBzaW5vbiBhZmZpY2hlciBsYSBwYWdlIGQnYWNjZXVpbFxuICAgIGlmIChyZXEuaXNBdXRoZW50aWNhdGVkKCkpIHtcbiAgICAgICAgcmVzLnJlbmRlcihcIi4vd2F0Y2hcIiwge3RpdGxlOiAnU3RyZWFtUnVubmVycyAtIEFjY3VlaWwnLCByZXF9KTtcblxuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgICAgcmVzLnJlbmRlcignLi9pbmRleCcsIHt0aXRsZTogJ1N0cmVhbVJ1bm5lcnMgLSBBY2N1ZWlsJywgcmVxLCB2aWV3ZXJzOiAoYXdhaXQgVXNlci52aWV3ZXJzKCkpfSk7XG4gICAgfVxufSk7XG5cbmNvbnN0IHBpY2tBdmF0YXJzID0gYXN5bmMgKGNvdW50OiBudW1iZXIpOiBQcm9taXNlPEltYWdlW10+ID0+IHtcbiAgICBjb25zdCBhdmF0YXJzOiBJbWFnZVtdID0gW107XG4gICAgd2hpbGUgKGF2YXRhcnMubGVuZ3RoIDwgY291bnQpIHtcbiAgICAgICAgY29uc3QgYXZhdGFyVXJscyA9IChhd2FpdCBnZXREQkNvbm5lY3Rpb24oKS5nZXRSZXBvc2l0b3J5KFVzZXIpLmZpbmQoe3NlbGVjdDogW1wiYXZhdGFyXCJdfSkpLm1hcCh1ID0+IHUuYXZhdGFyKTtcbiAgICAgICAgY29uc3Qgc2h1ZmZsZWQgPSBzaHVmZmxlZEFycmF5KGF2YXRhclVybHMpO1xuXG4gICAgICAgIGZvciAoY29uc3QgdXJsIG9mIHNodWZmbGVkKSB7XG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgIGF2YXRhcnMucHVzaChhd2FpdCBsb2FkSW1hZ2UodXJsKSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjYXRjaCB7XG4gICAgICAgICAgICAgICAgLy9JZ25vcmVcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChhdmF0YXJzLmxlbmd0aCA+IGNvdW50KSByZXR1cm4gYXZhdGFycztcbiAgICAgICAgfVxuXG4gICAgfVxuICAgIHJldHVybiBhdmF0YXJzO1xufTtcbmNvbnN0IGRyYXdCYW5uZXIgPSBhc3luYyAoY29sdW1uczogbnVtYmVyLCByb3dzOiBudW1iZXIpOiBQcm9taXNlPEJ1ZmZlcj4gPT4ge1xuXG4gICAgY29uc3QgYXZhdGFycyA9IGF3YWl0IHBpY2tBdmF0YXJzKGNvbHVtbnMgKiByb3dzKTtcblxuICAgIGNvbnN0IGNhbnZhcyA9IGNyZWF0ZUNhbnZhcyhjb2x1bW5zICogMTAwLCByb3dzICogMTAwKTtcbiAgICBjb25zdCBjdHggPSBjYW52YXMuZ2V0Q29udGV4dChcIjJkXCIpO1xuXG4gICAgZm9yIChsZXQgeCA9IDA7IHggPCBjb2x1bW5zOyB4KyspIHtcbiAgICAgICAgZm9yIChsZXQgeSA9IDA7IHkgPCByb3dzOyB5KyspIHtcblxuICAgICAgICAgICAgdmFyIGltYWdlID0gYXZhdGFyc1t5ICogY29sdW1ucyArIHhdO1xuICAgICAgICAgICAgY3R4LmRyYXdJbWFnZShpbWFnZSwgeCAqIDEwMCwgeSAqIDEwMCwgMTAwLCAxMDApXG4gICAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gY2FudmFzLnRvQnVmZmVyKCdpbWFnZS9wbmcnKTtcbn07XG5cbmNvbnN0IGJhbm5lckNhY2hlID0gbmV3IENhY2hlU2VydmljZSg2MCk7IC8vMSBtaW51dGUgY2FjaGVcbnJvdXRlci5nZXQoJy9iYW5uZXInLCBhc3luYyBmdW5jdGlvbiAocmVxOiBFeHByZXNzLlJlcXVlc3QsIHJlcykge1xuXG4gICAgdmFyIGJhbm5lciA9IGF3YWl0IGJhbm5lckNhY2hlLmdldChcImJhbm5lclwiLCBkcmF3QmFubmVyLmJpbmQobnVsbCwgMTAsIDUpKTtcblxuICAgIHJlcy5zZXQoJ0NvbnRlbnQtVHlwZScsICdpbWFnZS9wbmcnKTtcbiAgICByZXR1cm4gcmVzLnNlbmQoYmFubmVyKTtcblxufSk7XG5cbnJvdXRlci5nZXQoJy9hZG1pbicsIGFzeW5jIGZ1bmN0aW9uIChyZXE6IEV4cHJlc3MuUmVxdWVzdCwgcmVzKSB7XG5cbiAgICBpZiAocmVxLmlzVW5hdXRoZW50aWNhdGVkKCkgfHwgIXJlcS51c2VyLm1vZGVyYXRvcikge1xuICAgICAgICByZXR1cm4gcmVzLnN0YXR1cyg0MDQpLmVuZCgpO1xuICAgIH1cblxuICAgIC8vTm9tYnJlIGQndXRpbGlzYXRldXJcbiAgICBjb25zdCB1c2VycyA9IChhd2FpdCBVc2VyLmZpbmQoKSk7XG4gICAgY29uc3QgdG90YWxVc2VycyA9IHVzZXJzLmxlbmd0aDtcblxuICAgIC8vTm9tYnJlIGRlIHBvaW50c1xuICAgIGxldCB0b3RhbFBvaW50cyA9IDA7XG5cbiAgICBmb3IgKGNvbnN0IHVzZXIgb2YgdXNlcnMpIHtcbiAgICAgICAgdG90YWxQb2ludHMgKz0gdXNlci5wb2ludHM7XG4gICAgfVxuXG4gICAgLy9DbMOpIHN0ZWFtXG4gICAgY29uc3QgdXNlZEtleSA9IChhd2FpdCBTdGVhbUtleS5jcmVhdGVRdWVyeUJ1aWxkZXIoXCJrZXlcIilcbiAgICAgICAgLndoZXJlKFwiY2FzZU93bmVkSWQgSVMgTk9UIE5VTExcIilcbiAgICAgICAgLmdldE1hbnkoKSkubGVuZ3RoO1xuXG4gICAgY29uc3QgdG90YWxLZXkgPSAoYXdhaXQgU3RlYW1LZXkuZmluZCgpKS5sZW5ndGg7XG5cbiAgICByZXR1cm4gcmVzLnJlbmRlcignYWRtaW4nLCB7cmVxLCB0b3RhbFVzZXJzLCB0b3RhbFBvaW50cywgdXNlZEtleSwgdG90YWxLZXl9KTtcblxufSk7XG5cbnJvdXRlci5nZXQoXCIvbG9nb3V0XCIsIChyZXE6IEV4cHJlc3MuUmVxdWVzdCwgcmVzKSA9PiB7XG5cbiAgICBpZiAocmVxLmlzQXV0aGVudGljYXRlZCgpKSB7XG4gICAgICAgIHJlcS5sb2dPdXQoKTtcbiAgICB9XG5cbiAgICByZXMucmVkaXJlY3QoXCIvXCIpO1xuXG59KTtcblxubW9kdWxlLmV4cG9ydHMgPSByb3V0ZXI7XG4iXX0=