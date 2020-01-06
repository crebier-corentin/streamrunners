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
const CaseOwned_1 = require("../database/entity/CaseOwned");
const connection_1 = require("../database/connection");
const SteamKey_1 = require("../database/entity/SteamKey");
const Case_1 = require("../database/entity/Case");
var express = require('express');
var router = express.Router();
//Check if user has case, else return undefined
function hasCase(req) {
    return __awaiter(this, void 0, void 0, function* () {
        if (req.isUnauthenticated()) {
            return undefined;
        }
        //Get uuid Post or Get
        let uuid = req['query'].uuid == undefined ? req['body'].uuid : req['query'].uuid;
        if (uuid == undefined) {
            return undefined;
        }
        //Find unopened case
        const repository = connection_1.getDBConnection().getRepository(CaseOwned_1.CaseOwned);
        return yield repository.createQueryBuilder("c")
            .leftJoinAndSelect("c.user", "user")
            .leftJoinAndSelect("c.case", "case")
            .leftJoinAndSelect("case.content", "content")
            .where("user.id = :id", { id: req.user.id })
            .andWhere("c.uuid = :uuid", { uuid })
            .andWhere("contentId IS NULL")
            .getOne();
    });
}
router.post('/open', function (req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const repository = connection_1.getDBConnection().getRepository(CaseOwned_1.CaseOwned);
        let caseOwned = yield hasCase(req);
        if (caseOwned == undefined) {
            return res.status(403).send('Bad Request');
        }
        let spin = [];
        //Get Content
        let winning;
        for (let i = 0; i < 56; i++) {
            let item = yield caseOwned.case.getRandomContent();
            spin.push({ name: item.name, color: item.getRareColor(), image: item.image });
            if (i === 51) {
                winning = item;
            }
        }
        //Winning = 51
        caseOwned.content = winning;
        yield repository.save(caseOwned);
        //Give prize
        yield winning.applyContent(req.user, caseOwned);
        return res.json(spin);
    });
});
router.get('/show', function (req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        let caseOwned = yield hasCase(req);
        if (caseOwned == undefined) {
            res.redirect('/case/inventory');
            return;
        }
        res.render('./case', {
            title: 'StreamRunners - Caisse',
            req,
            uuid: req['query'].uuid,
            caseContent: caseOwned.case.content,
            steamKeyAvailable: yield SteamKey_1.SteamKey.isAvailable()
        });
    });
});
router.get('/inventory', function (req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        if (req.isUnauthenticated()) {
            res.redirect("/");
            return;
        }
        res.render("inventory", { title: 'StreamRunners - Inventaire', req });
    });
});
router.post('/buy', function (req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        if (req.isUnauthenticated()) {
            res.send({ auth: false });
            return;
        }
        let cost = 10000;
        //Check if enough points
        let points = (yield req.user.points);
        if (points < cost) {
            //No enough point
            res.send({ auth: true, enough: false, points, cost });
        }
        else {
            //Enough point
            //Create CaseOwned
            let caseOwned = new CaseOwned_1.CaseOwned();
            caseOwned.case = yield connection_1.getDBConnection().getRepository(Case_1.Case).findOneOrFail({ where: { name: "Beta" } });
            caseOwned.uuid = connection_1.randomString();
            yield connection_1.getDBConnection().getRepository(CaseOwned_1.CaseOwned).save(caseOwned);
            req.user.cases = req.user.cases.concat([caseOwned]);
            yield req.user.save();
            // await CaseOwned.query('UPDATE "case_owned" SET "userId" = ? WHERE "caseId" = ?', [req.user.id, caseOwned.id]);
            //Change points
            yield req.user.changePoints(-cost);
            res.send({ auth: true, enough: true });
        }
    });
});
module.exports = router;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiL1N0cmVhbVJ1bm5lcnMvVHdpdGNoVmlldy9yb3V0ZXMvY2FzZS50cyIsInNvdXJjZXMiOlsiL1N0cmVhbVJ1bm5lcnMvVHdpdGNoVmlldy9yb3V0ZXMvY2FzZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7O0FBQUEsNERBQXVEO0FBRXZELHVEQUFxRTtBQUNyRSwwREFBcUQ7QUFHckQsa0RBQTZDO0FBSTdDLElBQUksT0FBTyxHQUFHLE9BQU8sQ0FBQyxTQUFTLENBQUMsQ0FBQztBQUNqQyxJQUFJLE1BQU0sR0FBRyxPQUFPLENBQUMsTUFBTSxFQUFFLENBQUM7QUFFOUIsK0NBQStDO0FBQy9DLFNBQWUsT0FBTyxDQUFDLEdBQUc7O1FBQ3RCLElBQUksR0FBRyxDQUFDLGlCQUFpQixFQUFFLEVBQUU7WUFDekIsT0FBTyxTQUFTLENBQUM7U0FDcEI7UUFFRCxzQkFBc0I7UUFDdEIsSUFBSSxJQUFJLEdBQUcsR0FBRyxDQUFDLE9BQU8sQ0FBQyxDQUFDLElBQUksSUFBSSxTQUFTLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsQ0FBQyxJQUFJLENBQUM7UUFFakYsSUFBSSxJQUFJLElBQUksU0FBUyxFQUFFO1lBQ25CLE9BQU8sU0FBUyxDQUFDO1NBQ3BCO1FBRUQsb0JBQW9CO1FBQ3BCLE1BQU0sVUFBVSxHQUFHLDRCQUFlLEVBQUUsQ0FBQyxhQUFhLENBQUMscUJBQVMsQ0FBQyxDQUFDO1FBQzlELE9BQU8sTUFBTSxVQUFVLENBQUMsa0JBQWtCLENBQUMsR0FBRyxDQUFDO2FBQzFDLGlCQUFpQixDQUFDLFFBQVEsRUFBRSxNQUFNLENBQUM7YUFDbkMsaUJBQWlCLENBQUMsUUFBUSxFQUFFLE1BQU0sQ0FBQzthQUNuQyxpQkFBaUIsQ0FBQyxjQUFjLEVBQUUsU0FBUyxDQUFDO2FBQzVDLEtBQUssQ0FBQyxlQUFlLEVBQUUsRUFBQyxFQUFFLEVB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Q2YsTUFBTSxHQUFHLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDO1lBRW5DLEdBQUcsQ0FBQyxJQUFJLENBQUMsRUFBQyxJQUFJLEVBQUUsSUFBSSxFQUFFLE1BQU0sRUFBRSxJQUFJLEVBQUMsQ0FBQyxDQUFDO1NBQ3hDO0lBRUwsQ0FBQztDQUFBLENBQUMsQ0FBQztBQUVILE1BQU0sQ0FBQyxPQUFPLEdBQUcsTUFBTSxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtDYXNlT3duZWR9IGZyb20gXCIuLi9kYXRhYmFzZS9lbnRpdHkvQ2FzZU93bmVkXCI7XG5pbXBvcnQge0Nhc2VDb250ZW50fSBmcm9tIFwiLi4vZGF0YWJhc2UvZW50aXR5L0Nhc2VDb250ZW50XCI7XG5pbXBvcnQge2dldERCQ29ubmVjdGlvbiwgcmFuZG9tU3RyaW5nfSBmcm9tIFwiLi4vZGF0YWJhc2UvY29ubmVjdGlvblwiO1xuaW1wb3J0IHtTdGVhbUtleX0gZnJvbSBcIi4uL2RhdGFiYXNlL2VudGl0eS9TdGVhbUtleVwiO1xuaW1wb3J0IHtTdHJlYW1RdWV1ZX0gZnJvbSBcIi4uL2RhdGFiYXNlL2VudGl0eS9TdHJlYW1RdWV1ZVwiO1xuaW1wb3J0IHtSZXBvc2l0b3J5fSBmcm9tIFwidHlwZW9ybVwiO1xuaW1wb3J0IHtDYXNlfSBmcm9tIFwiLi4vZGF0YWJhc2UvZW50aXR5L0Nhc2VcIjtcbmltcG9ydCB7VXNlcn0gZnJvbSBcIi4uL2RhdGFiYXNlL2VudGl0eS9Vc2VyXCI7XG5cblxudmFyIGV4cHJlc3MgPSByZXF1aXJlKCdleHByZXNzJyk7XG52YXIgcm91dGVyID0gZXhwcmVzcy5Sb3V0ZXIoKTtcblxuLy9DaGVjayBpZiB1c2VyIGhhcyBjYXNlLCBlbHNlIHJldHVybiB1bmRlZmluZWRcbmFzeW5jIGZ1bmN0aW9uIGhhc0Nhc2UocmVxKTogUHJvbWlzZTxDYXNlT3duZWQgfCB1bmRlZmluZWQ+IHtcbiAgICBpZiAocmVxLmlzVW5hdXRoZW50aWNhdGVkKCkpIHtcbiAgICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgICB9XG5cbiAgICAvL0dldCB1dWlkIFBvc3Qgb3IgR2V0XG4gICAgbGV0IHV1aWQgPSByZXFbJ3F1ZXJ5J10udXVpZCA9PSB1bmRlZmluZWQgPyByZXFbJ2JvZHknXS51dWlkIDogcmVxWydxdWVyeSddLnV1aWQ7XG5cbiAgICBpZiAodXVpZCA9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgICB9XG5cbiAgICAvL0ZpbmQgdW5vcGVuZWQgY2FzZVxuICAgIGNvbnN0IHJlcG9zaXRvcnkgPSBnZXREQkNvbm5lY3Rpb24oKS5nZXRSZXBvc2l0b3J5KENhc2VPd25lZCk7XG4gICAgcmV0dXJuIGF3YWl0IHJlcG9zaXRvcnkuY3JlYXRlUXVlcnlCdWlsZGVyKFwiY1wiKVxuICAgICAgICAubGVmdEpvaW5BbmRTZWxlY3QoXCJjLnVzZXJcIiwgXCJ1c2VyXCIpXG4gICAgICAgIC5sZWZ0Sm9pbkFuZFNlbGVjdChcImMuY2FzZVwiLCBcImNhc2VcIilcbiAgICAgICAgLmxlZnRKb2luQW5kU2VsZWN0KFwiY2FzZS5jb250ZW50XCIsIFwiY29udGVudFwiKVxuICAgICAgICAud2hlcmUoXCJ1c2VyLmlkID0gOmlkXCIsIHtpZDogcmVxLnVzZXIuaWR9KVxuICAgICAgICAuYW5kV2hlcmUoXCJjLnV1aWQgPSA6dXVpZFwiLCB7dXVpZH0pXG4gICAgICAgIC5hbmRXaGVyZShcImNvbnRlbnRJZCBJUyBOVUxMXCIpXG4gICAgICAgIC5nZXRPbmUoKTtcbn1cblxucm91dGVyLnBvc3QoJy9vcGVuJywgYXN5bmMgZnVuY3Rpb24gKHJlcTogRXhwcmVzcy5SZXF1ZXN0LCByZXMpIHtcblxuICAgIGNvbnN0IHJlcG9zaXRvcnkgPSBnZXREQkNvbm5lY3Rpb24oKS5nZXRSZXBvc2l0b3J5KENhc2VPd25lZCk7XG5cbiAgICBsZXQgY2FzZU93bmVkID0gYXdhaXQgaGFzQ2FzZShyZXEpO1xuICAgIGlmIChjYXNlT3duZWQgPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIHJldHVybiByZXMuc3RhdHVzKDQwMykuc2VuZCgnQmFkIFJlcXVlc3QnKTtcbiAgICB9XG5cbiAgICBsZXQgc3BpbiA9IFtdO1xuXG4gICAgLy9HZXQgQ29udGVudFxuICAgIGxldCB3aW5uaW5nOiBDYXNlQ29udGVudDtcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IDU2OyBpKyspIHtcbiAgICAgICAgbGV0IGl0ZW0gPSBhd2FpdCBjYXNlT3duZWQuY2FzZS5nZXRSYW5kb21Db250ZW50KCk7XG4gICAgICAgIHNwaW4ucHVzaCh7bmFtZTogaXRlbS5uYW1lLCBjb2xvcjogaXRlbS5nZXRSYXJlQ29sb3IoKSwgaW1hZ2U6IGl0ZW0uaW1hZ2V9KTtcblxuICAgICAgICBpZiAoaSA9PT0gNTEpIHtcbiAgICAgICAgICAgIHdpbm5pbmcgPSBpdGVtO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLy9XaW5uaW5nID0gNTFcbiAgICBjYXNlT3duZWQuY29udGVudCA9IHdpbm5pbmc7XG4gICAgYXdhaXQgcmVwb3NpdG9yeS5zYXZlKGNhc2VPd25lZCk7XG5cbiAgICAvL0dpdmUgcHJpemVcbiAgICBhd2FpdCB3aW5uaW5nLmFwcGx5Q29udGVudChyZXEudXNlciwgY2FzZU93bmVkKTtcbiAgICByZXR1cm4gcmVzLmpzb24oc3Bpbik7XG5cbn0pO1xuXG5yb3V0ZXIuZ2V0KCcvc2hvdycsIGFzeW5jIGZ1bmN0aW9uIChyZXE6IEV4cHJlc3MuUmVxdWVzdCwgcmVzKSB7XG5cbiAgICBsZXQgY2FzZU93bmVkID0gYXdhaXQgaGFzQ2FzZShyZXEpO1xuICAgIGlmIChjYXNlT3duZWQgPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIHJlcy5yZWRpcmVjdCgnL2Nhc2UvaW52ZW50b3J5Jyk7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICByZXMucmVuZGVyKCcuL2Nhc2UnLCB7XG5cbiAgICAgICAgdGl0bGU6ICdTdHJlYW1SdW5uZXJzIC0gQ2Fpc3NlJyxcbiAgICAgICAgcmVxLFxuICAgICAgICB1dWlkOiByZXFbJ3F1ZXJ5J10udXVpZCxcbiAgICAgICAgY2FzZUNvbnRlbnQ6IGNhc2VPd25lZC5jYXNlLmNvbnRlbnQsXG4gICAgICAgIHN0ZWFtS2V5QXZhaWxhYmxlOiBhd2FpdCBTdGVhbUtleS5pc0F2YWlsYWJsZSgpXG4gICAgfSk7XG5cbn0pO1xuXG5yb3V0ZXIuZ2V0KCcvaW52ZW50b3J5JywgYXN5bmMgZnVuY3Rpb24gKHJlcTogRXhwcmVzcy5SZXF1ZXN0LCByZXMpIHtcblxuICAgIGlmIChyZXEuaXNVbmF1dGhlbnRpY2F0ZWQoKSkge1xuICAgICAgICByZXMucmVkaXJlY3QoXCIvXCIpO1xuICAgICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgcmVzLnJlbmRlcihcImludmVudG9yeVwiLCB7dGl0bGU6ICdTdHJlYW1SdW5uZXJzIC0gSW52ZW50YWlyZScsIHJlcX0pO1xuXG5cbn0pO1xuXG5yb3V0ZXIucG9zdCgnL2J1eScsIGFzeW5jIGZ1bmN0aW9uIChyZXE6IEV4cHJlc3MuUmVxdWVzdCwgcmVzKSB7XG5cbiAgICBpZiAocmVxLmlzVW5hdXRoZW50aWNhdGVkKCkpIHtcbiAgICAgICAgcmVzLnNlbmQoe2F1dGg6IGZhbHNlfSk7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBsZXQgY29zdCA9IDEwMDAwO1xuXG4gICAgLy9DaGVjayBpZiBlbm91Z2ggcG9pbnRzXG4gICAgbGV0IHBvaW50cyA9IChhd2FpdCByZXEudXNlci5wb2ludHMpO1xuICAgIGlmIChwb2ludHMgPCBjb3N0KSB7XG4gICAgICAgIC8vTm8gZW5vdWdoIHBvaW50XG4gICAgICAgIHJlcy5zZW5kKHthdXRoOiB0cnVlLCBlbm91Z2g6IGZhbHNlLCBwb2ludHMsIGNvc3R9KTtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICAgIC8vRW5vdWdoIHBvaW50XG5cbiAgICAgICAgLy9DcmVhdGUgQ2FzZU93bmVkXG4gICAgICAgIGxldCBjYXNlT3duZWQgPSBuZXcgQ2FzZU93bmVkKCk7XG4gICAgICAgIGNhc2VPd25lZC5jYXNlID0gYXdhaXQgZ2V0REJDb25uZWN0aW9uKCkuZ2V0UmVwb3NpdG9yeShDYXNlKS5maW5kT25lT3JGYWlsKHt3aGVyZToge25hbWU6IFwiQmV0YVwifX0pO1xuICAgICAgICBjYXNlT3duZWQudXVpZCA9IHJhbmRvbVN0cmluZygpO1xuXG4gICAgICAgIGF3YWl0IGdldERCQ29ubmVjdGlvbigpLmdldFJlcG9zaXRvcnkoQ2FzZU93bmVkKS5zYXZlKGNhc2VPd25lZCk7XG5cbiAgICAgICAgcmVxLnVzZXIuY2FzZXMgPSByZXEudXNlci5jYXNlcy5jb25jYXQoW2Nhc2VPd25lZF0pO1xuICAgICAgICBhd2FpdCByZXEudXNlci5zYXZlKCk7XG5cblxuICAgICAgICAvLyBhd2FpdCBDYXNlT3duZWQucXVlcnkoJ1VQREFURSBcImNhc2Vfb3duZWRcIiBTRVQgXCJ1c2VySWRcIiA9ID8gV0hFUkUgXCJjYXNlSWRcIiA9ID8nLCBbcmVxLnVzZXIuaWQsIGNhc2VPd25lZC5pZF0pO1xuXG4gICAgICAgIC8vQ2hhbmdlIHBvaW50c1xuICAgICAgICBhd2FpdCByZXEudXNlci5jaGFuZ2VQb2ludHMoLWNvc3QpO1xuXG4gICAgICAgIHJlcy5zZW5kKHthdXRoOiB0cnVlLCBlbm91Z2g6IHRydWV9KTtcbiAgICB9XG5cbn0pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IHJvdXRlcjsiXX0=