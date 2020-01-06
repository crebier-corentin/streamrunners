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
router.post('/buyh', function (req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        if (req.isUnauthenticated()) {
            res.send({ auth: false });
            return;
        }
        let cost = 6666;
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
            caseOwned.case = yield connection_1.getDBConnection().getRepository(Case_1.Case).findOneOrFail({ where: { name: "Halloween" } });
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiL1N0cmVhbVJ1bm5lcnMvVHdpdGNoVmlldy9yb3V0ZXMvY2FzZS50cyIsInNvdXJjZXMiOlsiL1N0cmVhbVJ1bm5lcnMvVHdpdGNoVmlldy9yb3V0ZXMvY2FzZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7OztBQUFBLDREQUF1RDtBQUV2RCx1REFBcUU7QUFDckUsMERBQXFEO0FBR3JELGtEQUE2QztBQUk3QyxJQUFJLE9BQU8sR0FBRyxPQUFPLENBQUMsU0FBUyxDQUFDLENBQUM7QUFDakMsSUFBSSxNQUFNLEdBQUcsT0FBTyxDQUFDLE1BQU0sRUFBRSxDQUFDO0FBRTlCLCtDQUErQztBQUMvQyxTQUFlLE9BQU8sQ0FBQyxHQUFHOztRQUN0QixJQUFJLEdBQUcsQ0FBQyxpQkFBaUIsRUFBRSxFQUFFO1lBQ3pCLE9BQU8sU0FBUyxDQUFDO1NBQ3BCO1FBRUQsc0JBQXNCO1FBQ3RCLElBQUksSUFBSSxHQUFHLEdBQUcsQ0FBQyxPQUFPLENBQUMsQ0FBQyxJQUFJLElBQUksU0FBUyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLENBQUMsSUFBSSxDQUFDO1FBRWpGLElBQUksSUFBSSxJQUFJLFNBQVMsRUFBRTtZQUNuQixPQUFPLFNBQVMsQ0FBQztTQUNwQjtRQUVELG9CQUFvQjtRQUNwQixNQUFNLFVBQVUsR0FBRyw0QkFBZSxFQUFFLENBQUMsYUFBYSxDQUFDLHFCQUFTLENBQUMsQ0FBQztRQUM5RCxPQUFPLE1BQU0sVUFBVSxDQUFDLGtCQUFrQixDQUFDLEdBQUcsQ0FBQzthQUMxQyxpQkFBaUIsQ0FBQyxRQUFRLEVBQUUsTUFBTSxDQUFDO2FBQ25DLGlCQUFpQixDQUFDLFFBQVEsRUFBRSxNQUFNLENBQUM7YUFDbkMsaUJBQWlCLENBQUMsY0FBYyxFQUFFLFNBQVMsQ0FBQzthQUM1QyxLQUFLLENBQUMsZUFBZSxFQUFFLEVBQUMsRUFBRSxF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QUFDLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQztZQUVqRSxHQUFHLENBQUMsSUFBSSxDQUFDLEtBQUssR0FBRyxHQUFHLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDO1lBQ3BELE1BQU0sR0FBRyxDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQztZQUd0QixpSEFBaUg7WUFFakgsZUFBZTtZQUNmLE1BQU0sR0FBRyxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUVuQyxHQUFHLENBQUMsSUFBSSxDQUFDLEVBQUMsSUFBSSxFQUFFLElBQUksRUFBRSxNQUFNLEVBQUUsSUFBSSxFQUFDLENBQUMsQ0FBQztTQUN4QztJQUVMLENBQUM7Q0FBQSxDQUFDLENBQUM7QUFFSCxNQUFNLENBQUMsT0FBTyxHQUFHLE1BQU0sQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7Q2FzZU93bmVkfSBmcm9tIFwiLi4vZGF0YWJhc2UvZW50aXR5L0Nhc2VPd25lZFwiO1xuaW1wb3J0IHtDYXNlQ29udGVudH0gZnJvbSBcIi4uL2RhdGFiYXNlL2VudGl0eS9DYXNlQ29udGVudFwiO1xuaW1wb3J0IHtnZXREQkNvbm5lY3Rpb24sIHJhbmRvbVN0cmluZ30gZnJvbSBcIi4uL2RhdGFiYXNlL2Nvbm5lY3Rpb25cIjtcbmltcG9ydCB7U3RlYW1LZXl9IGZyb20gXCIuLi9kYXRhYmFzZS9lbnRpdHkvU3RlYW1LZXlcIjtcbmltcG9ydCB7U3RyZWFtUXVldWV9IGZyb20gXCIuLi9kYXRhYmFzZS9lbnRpdHkvU3RyZWFtUXVldWVcIjtcbmltcG9ydCB7UmVwb3NpdG9yeX0gZnJvbSBcInR5cGVvcm1cIjtcbmltcG9ydCB7Q2FzZX0gZnJvbSBcIi4uL2RhdGFiYXNlL2VudGl0eS9DYXNlXCI7XG5pbXBvcnQge1VzZXJ9IGZyb20gXCIuLi9kYXRhYmFzZS9lbnRpdHkvVXNlclwiO1xuXG5cbnZhciBleHByZXNzID0gcmVxdWlyZSgnZXhwcmVzcycpO1xudmFyIHJvdXRlciA9IGV4cHJlc3MuUm91dGVyKCk7XG5cbi8vQ2hlY2sgaWYgdXNlciBoYXMgY2FzZSwgZWxzZSByZXR1cm4gdW5kZWZpbmVkXG5hc3luYyBmdW5jdGlvbiBoYXNDYXNlKHJlcSk6IFByb21pc2U8Q2FzZU93bmVkIHwgdW5kZWZpbmVkPiB7XG4gICAgaWYgKHJlcS5pc1VuYXV0aGVudGljYXRlZCgpKSB7XG4gICAgICAgIHJldHVybiB1bmRlZmluZWQ7XG4gICAgfVxuXG4gICAgLy9HZXQgdXVpZCBQb3N0IG9yIEdldFxuICAgIGxldCB1dWlkID0gcmVxWydxdWVyeSddLnV1aWQgPT0gdW5kZWZpbmVkID8gcmVxWydib2R5J10udXVpZCA6IHJlcVsncXVlcnknXS51dWlkO1xuXG4gICAgaWYgKHV1aWQgPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIHJldHVybiB1bmRlZmluZWQ7XG4gICAgfVxuXG4gICAgLy9GaW5kIHVub3BlbmVkIGNhc2VcbiAgICBjb25zdCByZXBvc2l0b3J5ID0gZ2V0REJDb25uZWN0aW9uKCkuZ2V0UmVwb3NpdG9yeShDYXNlT3duZWQpO1xuICAgIHJldHVybiBhd2FpdCByZXBvc2l0b3J5LmNyZWF0ZVF1ZXJ5QnVpbGRlcihcImNcIilcbiAgICAgICAgLmxlZnRKb2luQW5kU2VsZWN0KFwiYy51c2VyXCIsIFwidXNlclwiKVxuICAgICAgICAubGVmdEpvaW5BbmRTZWxlY3QoXCJjLmNhc2VcIiwgXCJjYXNlXCIpXG4gICAgICAgIC5sZWZ0Sm9pbkFuZFNlbGVjdChcImNhc2UuY29udGVudFwiLCBcImNvbnRlbnRcIilcbiAgICAgICAgLndoZXJlKFwidXNlci5pZCA9IDppZFwiLCB7aWQ6IHJlcS51c2VyLmlkfSlcbiAgICAgICAgLmFuZFdoZXJlKFwiYy51dWlkID0gOnV1aWRcIiwge3V1aWR9KVxuICAgICAgICAuYW5kV2hlcmUoXCJjb250ZW50SWQgSVMgTlVMTFwiKVxuICAgICAgICAuZ2V0T25lKCk7XG59XG5cbnJvdXRlci5wb3N0KCcvb3BlbicsIGFzeW5jIGZ1bmN0aW9uIChyZXE6IEV4cHJlc3MuUmVxdWVzdCwgcmVzKSB7XG5cbiAgICBjb25zdCByZXBvc2l0b3J5ID0gZ2V0REJDb25uZWN0aW9uKCkuZ2V0UmVwb3NpdG9yeShDYXNlT3duZWQpO1xuXG4gICAgbGV0IGNhc2VPd25lZCA9IGF3YWl0IGhhc0Nhc2UocmVxKTtcbiAgICBpZiAoY2FzZU93bmVkID09IHVuZGVmaW5lZCkge1xuICAgICAgICByZXR1cm4gcmVzLnN0YXR1cyg0MDMpLnNlbmQoJ0JhZCBSZXF1ZXN0Jyk7XG4gICAgfVxuXG4gICAgbGV0IHNwaW4gPSBbXTtcblxuICAgIC8vR2V0IENvbnRlbnRcbiAgICBsZXQgd2lubmluZzogQ2FzZUNvbnRlbnQ7XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCA1NjsgaSsrKSB7XG4gICAgICAgIGxldCBpdGVtID0gYXdhaXQgY2FzZU93bmVkLmNhc2UuZ2V0UmFuZG9tQ29udGVudCgpO1xuICAgICAgICBzcGluLnB1c2goe25hbWU6IGl0ZW0ubmFtZSwgY29sb3I6IGl0ZW0uZ2V0UmFyZUNvbG9yKCksIGltYWdlOiBpdGVtLmltYWdlfSk7XG5cbiAgICAgICAgaWYgKGkgPT09IDUxKSB7XG4gICAgICAgICAgICB3aW5uaW5nID0gaXRlbTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8vV2lubmluZyA9IDUxXG4gICAgY2FzZU93bmVkLmNvbnRlbnQgPSB3aW5uaW5nO1xuICAgIGF3YWl0IHJlcG9zaXRvcnkuc2F2ZShjYXNlT3duZWQpO1xuXG4gICAgLy9HaXZlIHByaXplXG4gICAgYXdhaXQgd2lubmluZy5hcHBseUNvbnRlbnQocmVxLnVzZXIsIGNhc2VPd25lZCk7XG4gICAgcmV0dXJuIHJlcy5qc29uKHNwaW4pO1xuXG59KTtcblxucm91dGVyLmdldCgnL3Nob3cnLCBhc3luYyBmdW5jdGlvbiAocmVxOiBFeHByZXNzLlJlcXVlc3QsIHJlcykge1xuXG4gICAgbGV0IGNhc2VPd25lZCA9IGF3YWl0IGhhc0Nhc2UocmVxKTtcbiAgICBpZiAoY2FzZU93bmVkID09IHVuZGVmaW5lZCkge1xuICAgICAgICByZXMucmVkaXJlY3QoJy9jYXNlL2ludmVudG9yeScpO1xuICAgICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgcmVzLnJlbmRlcignLi9jYXNlJywge1xuXG4gICAgICAgIHRpdGxlOiAnU3RyZWFtUnVubmVycyAtIENhaXNzZScsXG4gICAgICAgIHJlcSxcbiAgICAgICAgdXVpZDogcmVxWydxdWVyeSddLnV1aWQsXG4gICAgICAgIGNhc2VDb250ZW50OiBjYXNlT3duZWQuY2FzZS5jb250ZW50LFxuICAgICAgICBzdGVhbUtleUF2YWlsYWJsZTogYXdhaXQgU3RlYW1LZXkuaXNBdmFpbGFibGUoKVxuICAgIH0pO1xuXG59KTtcblxucm91dGVyLmdldCgnL2ludmVudG9yeScsIGFzeW5jIGZ1bmN0aW9uIChyZXE6IEV4cHJlc3MuUmVxdWVzdCwgcmVzKSB7XG5cbiAgICBpZiAocmVxLmlzVW5hdXRoZW50aWNhdGVkKCkpIHtcbiAgICAgICAgcmVzLnJlZGlyZWN0KFwiL1wiKTtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIHJlcy5yZW5kZXIoXCJpbnZlbnRvcnlcIiwge3RpdGxlOiAnU3RyZWFtUnVubmVycyAtIEludmVudGFpcmUnLCByZXF9KTtcblxuXG59KTtcblxucm91dGVyLnBvc3QoJy9idXknLCBhc3luYyBmdW5jdGlvbiAocmVxOiBFeHByZXNzLlJlcXVlc3QsIHJlcykge1xuXG4gICAgaWYgKHJlcS5pc1VuYXV0aGVudGljYXRlZCgpKSB7XG4gICAgICAgIHJlcy5zZW5kKHthdXRoOiBmYWxzZX0pO1xuICAgICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgbGV0IGNvc3QgPSAxMDAwMDtcblxuICAgIC8vQ2hlY2sgaWYgZW5vdWdoIHBvaW50c1xuICAgIGxldCBwb2ludHMgPSAoYXdhaXQgcmVxLnVzZXIucG9pbnRzKTtcbiAgICBpZiAocG9pbnRzIDwgY29zdCkge1xuICAgICAgICAvL05vIGVub3VnaCBwb2ludFxuICAgICAgICByZXMuc2VuZCh7YXV0aDogdHJ1ZSwgZW5vdWdoOiBmYWxzZSwgcG9pbnRzLCBjb3N0fSk7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgICAvL0Vub3VnaCBwb2ludFxuXG4gICAgICAgIC8vQ3JlYXRlIENhc2VPd25lZFxuICAgICAgICBsZXQgY2FzZU93bmVkID0gbmV3IENhc2VPd25lZCgpO1xuICAgICAgICBjYXNlT3duZWQuY2FzZSA9IGF3YWl0IGdldERCQ29ubmVjdGlvbigpLmdldFJlcG9zaXRvcnkoQ2FzZSkuZmluZE9uZU9yRmFpbCh7d2hlcmU6IHtuYW1lOiBcIkJldGFcIn19KTtcbiAgICAgICAgY2FzZU93bmVkLnV1aWQgPSByYW5kb21TdHJpbmcoKTtcblxuICAgICAgICBhd2FpdCBnZXREQkNvbm5lY3Rpb24oKS5nZXRSZXBvc2l0b3J5KENhc2VPd25lZCkuc2F2ZShjYXNlT3duZWQpO1xuXG4gICAgICAgIHJlcS51c2VyLmNhc2VzID0gcmVxLnVzZXIuY2FzZXMuY29uY2F0KFtjYXNlT3duZWRdKTtcbiAgICAgICAgYXdhaXQgcmVxLnVzZXIuc2F2ZSgpO1xuXG5cbiAgICAgICAgLy8gYXdhaXQgQ2FzZU93bmVkLnF1ZXJ5KCdVUERBVEUgXCJjYXNlX293bmVkXCIgU0VUIFwidXNlcklkXCIgPSA/IFdIRVJFIFwiY2FzZUlkXCIgPSA/JywgW3JlcS51c2VyLmlkLCBjYXNlT3duZWQuaWRdKTtcblxuICAgICAgICAvL0NoYW5nZSBwb2ludHNcbiAgICAgICAgYXdhaXQgcmVxLnVzZXIuY2hhbmdlUG9pbnRzKC1jb3N0KTtcblxuICAgICAgICByZXMuc2VuZCh7YXV0aDogdHJ1ZSwgZW5vdWdoOiB0cnVlfSk7XG4gICAgfVxuXG59KTtcblxucm91dGVyLnBvc3QoJy9idXloJywgYXN5bmMgZnVuY3Rpb24gKHJlcTogRXhwcmVzcy5SZXF1ZXN0LCByZXMpIHtcblxuICAgIGlmIChyZXEuaXNVbmF1dGhlbnRpY2F0ZWQoKSkge1xuICAgICAgICByZXMuc2VuZCh7YXV0aDogZmFsc2V9KTtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGxldCBjb3N0ID0gNjY2NjtcblxuICAgIC8vQ2hlY2sgaWYgZW5vdWdoIHBvaW50c1xuICAgIGxldCBwb2ludHMgPSAoYXdhaXQgcmVxLnVzZXIucG9pbnRzKTtcbiAgICBpZiAocG9pbnRzIDwgY29zdCkge1xuICAgICAgICAvL05vIGVub3VnaCBwb2ludFxuICAgICAgICByZXMuc2VuZCh7YXV0aDogdHJ1ZSwgZW5vdWdoOiBmYWxzZSwgcG9pbnRzLCBjb3N0fSk7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgICAvL0Vub3VnaCBwb2ludFxuXG4gICAgICAgIC8vQ3JlYXRlIENhc2VPd25lZFxuICAgICAgICBsZXQgY2FzZU93bmVkID0gbmV3IENhc2VPd25lZCgpO1xuICAgICAgICBjYXNlT3duZWQuY2FzZSA9IGF3YWl0IGdldERCQ29ubmVjdGlvbigpLmdldFJlcG9zaXRvcnkoQ2FzZSkuZmluZE9uZU9yRmFpbCh7d2hlcmU6IHtuYW1lOiBcIkhhbGxvd2VlblwifX0pO1xuICAgICAgICBjYXNlT3duZWQudXVpZCA9IHJhbmRvbVN0cmluZygpO1xuXG4gICAgICAgIGF3YWl0IGdldERCQ29ubmVjdGlvbigpLmdldFJlcG9zaXRvcnkoQ2FzZU93bmVkKS5zYXZlKGNhc2VPd25lZCk7XG5cbiAgICAgICAgcmVxLnVzZXIuY2FzZXMgPSByZXEudXNlci5jYXNlcy5jb25jYXQoW2Nhc2VPd25lZF0pO1xuICAgICAgICBhd2FpdCByZXEudXNlci5zYXZlKCk7XG5cblxuICAgICAgICAvLyBhd2FpdCBDYXNlT3duZWQucXVlcnkoJ1VQREFURSBcImNhc2Vfb3duZWRcIiBTRVQgXCJ1c2VySWRcIiA9ID8gV0hFUkUgXCJjYXNlSWRcIiA9ID8nLCBbcmVxLnVzZXIuaWQsIGNhc2VPd25lZC5pZF0pO1xuXG4gICAgICAgIC8vQ2hhbmdlIHBvaW50c1xuICAgICAgICBhd2FpdCByZXEudXNlci5jaGFuZ2VQb2ludHMoLWNvc3QpO1xuXG4gICAgICAgIHJlcy5zZW5kKHthdXRoOiB0cnVlLCBlbm91Z2g6IHRydWV9KTtcbiAgICB9XG5cbn0pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IHJvdXRlcjsiXX0=