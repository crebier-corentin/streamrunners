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
const connection_1 = require("../database/connection");
var express = require('express');
var router = express.Router();
const User_1 = require("../database/entity/User");
const Coupon_1 = require("../database/entity/Coupon");
router.get('/', function (req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        if (req.isAuthenticated()) {
            res.render("coupon", { title: "StreamRunners - Coupons", req });
        }
        else {
            res.redirect("/");
        }
    });
});
router.post('/add', function (req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        if (req.isAuthenticated()) {
            let code = req.body.coupon;
            let userRepository = connection_1.getDBConnection().getRepository(User_1.User);
            let couponRepository = connection_1.getDBConnection().getRepository(Coupon_1.Coupon);
            //If code is empty
            if (code == "" || code == undefined || code == null) {
                res.send({ error: true, message: "Le code coupon est vide." });
                return;
            }
            //If coupon does not exist
            let coupon = yield couponRepository.findOne({ where: { name: code }, relations: ["users"] });
            if (coupon == undefined) {
                res.send({ error: true, message: "Le coupon n'existe pas." });
                return;
            }
            //If code is already used
            let count = yield userRepository.createQueryBuilder("user")
                .leftJoinAndSelect("user.coupons", "coupon")
                .where("user.id = :id", { id: req.user.id })
                .andWhere("coupon.name = :code", { code })
                .getCount();
            if (count > 0) {
                res.send({ error: true, message: "Le coupon est déjà utilisé." });
                return;
            }
            //Is coupon expired or overused
            if (!coupon.isValid()) {
                res.send({ error: true, message: "Le coupon n'est plus valide" });
                return;
            }
            //The coupon is valid
            let user = yield userRepository.findOne(req.user.id, { relations: ["coupons"] });
            user.coupons.push(coupon);
            yield user.changePoints(coupon.amount);
            yield userRepository.save(user);
            res.send({ error: false, message: `Le coupon d'une valeur de : ${coupon.amount} à été utilisé !` });
        }
        else {
            res.send({ error: true, message: "Vous n'êtes pas connecté." });
        }
    });
});
module.exports = router;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiL1N0cmVhbVJ1bm5lcnMvVHdpdGNoVmlldy9yb3V0ZXMvY291cG9uLnRzIiwic291cmNlcyI6WyIvU3RyZWFtUnVubmVycy9Ud2l0Y2hWaWV3L3JvdXRlcy9jb3Vwb24udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7OztBQUFBLHVEQUF1RDtBQUV2RCxJQUFJLE9BQU8sR0FBRyxPQUFPLENBQUMsU0FBUyxDQUFDLENBQUM7QUFDakMsSUFBSSxNQUFNLEdBQUcsT0FBTyxDQUFDLE1BQU0sRUFBRSxDQUFDO0FBSTlCLGtEQUE2QztBQUM3QyxzREFBaUQ7QUFHakQsTUFBTSxDQUFDLEdBQUcsQ0FBQyxHQUFHLEVBQUUsVUFBZ0IsR0FBb0IsRUFBRSxHQUFhOztRQUMvRCxJQUFJLEdBQUcsQ0FBQyxlQUFlLEVBQUUsRUFBRTtZQUN2QixHQUFHLENBQUMsTUFBTSxDQUFDLFFBQVEsRUFBRSxFQUFDLEtBQUssRUFBRSx5QkFBeUIsRUFBRSxHQUFHLEVBQUMsQ0FBQyxDQUFDO1NBQ2pFO2FBQ0k7WUFDRCxHQUFHLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxDQUFDO1NBQ3JCO0lBQ0wsQ0FBQztDQUFBLENBQUMsQ0FBQztBQUVILE1BQU0sQ0FBQyxJQUFJLENBQUMsTUFBTSxFQUFFLFVBQWdCLEdBQVksRUFBRSxHQUFhOztRQUUzRCxJQUFJLEdBQUcsQ0FBQyxlQUFlLEVBQUUsRUFBRTtZQUN2QixJQUFJLElBQUksR0FBRyxHQUFHLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQztZQUMzQixJQUFJLGNBQWMsR0FBRyw0QkFBZSxFQUFFLENBQUMsYUFBYSxDQUFDLFdBQUksQ0FBQyxDQUFDO1lBQzNELElBQUksZ0JBQWdCLEdBQUcsNEJBQWUsRUFBRSxDQUFDLGFBQWEsQ0FBQyxlQUFNLENBQUMsQ0FBQztZQUUvRCxrQkFBa0I7WUFDbEIsSUFBSSxJQUFJLElBQUksRUFBRSxJQUFJLElBQUksSUFBSSxTQUFTLElBQUksSUFBSSxJQUFJLElBQUksRUFBRTtnQkFDakQsR0FBRyxDQUFDLElBQUksQ0FBQyxFQUFDLEtBQUssRUFBRSxJQUFJLEVBQUUsT0FBTyxFQUFFLDBCQUEwQixFQUFDLENBQUMsQ0FBQztnQkFDN0QsT0FBTzthQUNWO1lBRUQsMEJBQTBCO1lBQzFCLElBQUksTUFBTSxHQUFHLE1BQU0sZ0JBQWdCLENBQUMsT0FBTyxDQUFDLEVBQUMsS0FBSyxFQUFFLEVBQUMsSUFBSSxFQUFFLElBQUksRUFBQyxFQUFFLFNBQVMsRUFBRSxDQUFDLE9BQU8sQ0FBQyxFQUFDLENBQUMsQ0FBQztZQUN6RixJQUFJLE1BQU0sSUFBSSxTQUFTLEVBQUU7Z0JBQ3JCLEdBQUcsQ0FBQyxJQUFJLENBQUMsRUFBQyxLQUFLLEVBQUUsSUFBSSxFQUFFLE9BQU8sRUFBRSx5QkFBeUIsRUFBQyxDQUFDLENBQUM7Z0JBQzVELE9BQU87YUFDVjtZQUVELHlCQUF5QjtZQUN6QixJQUFJLEtBQUssR0FBRyxNQUFNLGNBQWMsQ0FBQyxrQkFBa0IsQ0FBQyxNQUFNLENBQUM7aUJBQ3RELGlCQUFpQixDQUFDLGNBQWMsRUFBRSxRQUFRLENBQUM7aUJBQzNDLEtBQUssQ0FBQyxlQUFlLEVBQUUsRUFBQyxFQUFFLEVBQUUsR0FBRyxDQUFDLElBQUksQ0FBQyxFQUFFLEVBQUMsQ0FBQztpQkFDekMsUUFBUSxDQUFDLHFCQUFxQixFQUFFLEVBQUMsSUFBSSxFQUFDLENBQUM7aUJBQ3ZDLFFBQVEsRUFBRSxDQUFDO1lBRWhCLElBQUksS0FBSyxHQUFHLENBQUMsRUFBRTtnQkFDWCxHQUFHLENBQUMsSUFBSSxDQUFDLEVBQUMsS0FBSyxFQUFFLElBQUksRUFBRSxPQUFPLEVBQUUsNkJBQTZCLEVBQUMsQ0FBQyxDQUFDO2dCQUNoRSxPQUFPO2FBQ1Y7WUFFRCwrQkFBK0I7WUFDL0IsSUFBSSxDQUFDLE1BQU0sQ0FBQyxPQUFPLEVBQUUsRUFBRTtnQkFDbkIsR0FBRyxDQUFDLElBQUksQ0FBQyxFQUFDLEtBQUssRUFBRSxJQUFJLEVBQUUsT0FBTyxFQUFFLDZCQUE2QixFQUFDLENBQUMsQ0FBQztnQkFDaEUsT0FBTzthQUNWO1lBRUQscUJBQXFCO1lBQ3JCLElBQUksSUFBSSxHQUFHLE1BQU0sY0FBYyxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEVBQUUsRUFBRSxFQUFDLFNBQVMsRUFBRSxDQUFDLFNBQVMsQ0FBQyxFQUFDLENBQUMsQ0FBQztZQUMvRSxJQUFJLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQztZQUMxQixNQUFNLElBQUksQ0FBQyxZQUFZLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxDQUFDO1lBQ3ZDLE1BQU0sY0FBYyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUVoQyxHQUFHLENBQUMsSUFBSSxDQUFDLEVBQUMsS0FBSyxFQUFFLEtBQUssRUFBRSxPQUFPLEVBQUUsK0JBQStCLE1BQU0sQ0FBQyxNQUFNLGtCQUFrQixFQUFDLENBQUMsQ0FBQztTQUNyRzthQUNJO1lBQ0QsR0FBRyxDQUFDLElBQUksQ0FBQyxFQUFDLEtBQUssRUFBRSxJQUFJLEVBQUUsT0FBTyxFQUFFLDJCQUEyQixFQUFDLENBQUMsQ0FBQztTQUNqRTtJQUNMLENBQUM7Q0FBQSxDQUFDLENBQUM7QUFFSCxNQUFNLENBQUMsT0FBTyxHQUFHLE1BQU0sQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7Z2V0REJDb25uZWN0aW9ufSBmcm9tIFwiLi4vZGF0YWJhc2UvY29ubmVjdGlvblwiO1xuXG52YXIgZXhwcmVzcyA9IHJlcXVpcmUoJ2V4cHJlc3MnKTtcbnZhciByb3V0ZXIgPSBleHByZXNzLlJvdXRlcigpO1xuXG4vLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgbm8tdW51c2VkLXZhcnNcbmltcG9ydCB7UmVxdWVzdCwgUmVzcG9uc2V9IGZyb20gXCJleHByZXNzXCI7XG5pbXBvcnQge1VzZXJ9IGZyb20gXCIuLi9kYXRhYmFzZS9lbnRpdHkvVXNlclwiO1xuaW1wb3J0IHtDb3Vwb259IGZyb20gXCIuLi9kYXRhYmFzZS9lbnRpdHkvQ291cG9uXCI7XG5cblxucm91dGVyLmdldCgnLycsIGFzeW5jIGZ1bmN0aW9uIChyZXE6IEV4cHJlc3MuUmVxdWVzdCwgcmVzOiBSZXNwb25zZSkge1xuICAgIGlmIChyZXEuaXNBdXRoZW50aWNhdGVkKCkpIHtcbiAgICAgICAgcmVzLnJlbmRlcihcImNvdXBvblwiLCB7dGl0bGU6IFwiU3RyZWFtUnVubmVycyAtIENvdXBvbnNcIiwgcmVxfSk7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgICByZXMucmVkaXJlY3QoXCIvXCIpO1xuICAgIH1cbn0pO1xuXG5yb3V0ZXIucG9zdCgnL2FkZCcsIGFzeW5jIGZ1bmN0aW9uIChyZXE6IFJlcXVlc3QsIHJlczogUmVzcG9uc2UpIHtcblxuICAgIGlmIChyZXEuaXNBdXRoZW50aWNhdGVkKCkpIHtcbiAgICAgICAgbGV0IGNvZGUgPSByZXEuYm9keS5jb3Vwb247XG4gICAgICAgIGxldCB1c2VyUmVwb3NpdG9yeSA9IGdldERCQ29ubmVjdGlvbigpLmdldFJlcG9zaXRvcnkoVXNlcik7XG4gICAgICAgIGxldCBjb3Vwb25SZXBvc2l0b3J5ID0gZ2V0REJDb25uZWN0aW9uKCkuZ2V0UmVwb3NpdG9yeShDb3Vwb24pO1xuXG4gICAgICAgIC8vSWYgY29kZSBpcyBlbXB0eVxuICAgICAgICBpZiAoY29kZSA9PSBcIlwiIHx8IGNvZGUgPT0gdW5kZWZpbmVkIHx8IGNvZGUgPT0gbnVsbCkge1xuICAgICAgICAgICAgcmVzLnNlbmQoe2Vycm9yOiB0cnVlLCBtZXNzYWdlOiBcIkxlIGNvZGUgY291cG9uIGVzdCB2aWRlLlwifSk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICAvL0lmIGNvdXBvbiBkb2VzIG5vdCBleGlzdFxuICAgICAgICBsZXQgY291cG9uID0gYXdhaXQgY291cG9uUmVwb3NpdG9yeS5maW5kT25lKHt3aGVyZToge25hbWU6IGNvZGV9LCByZWxhdGlvbnM6IFtcInVzZXJzXCJdfSk7XG4gICAgICAgIGlmIChjb3Vwb24gPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICByZXMuc2VuZCh7ZXJyb3I6IHRydWUsIG1lc3NhZ2U6IFwiTGUgY291cG9uIG4nZXhpc3RlIHBhcy5cIn0pO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgLy9JZiBjb2RlIGlzIGFscmVhZHkgdXNlZFxuICAgICAgICBsZXQgY291bnQgPSBhd2FpdCB1c2VyUmVwb3NpdG9yeS5jcmVhdGVRdWVyeUJ1aWxkZXIoXCJ1c2VyXCIpXG4gICAgICAgICAgICAubGVmdEpvaW5BbmRTZWxlY3QoXCJ1c2VyLmNvdXBvbnNcIiwgXCJjb3Vwb25cIilcbiAgICAgICAgICAgIC53aGVyZShcInVzZXIuaWQgPSA6aWRcIiwge2lkOiByZXEudXNlci5pZH0pXG4gICAgICAgICAgICAuYW5kV2hlcmUoXCJjb3Vwb24ubmFtZSA9IDpjb2RlXCIsIHtjb2RlfSlcbiAgICAgICAgICAgIC5nZXRDb3VudCgpO1xuXG4gICAgICAgIGlmIChjb3VudCA+IDApIHtcbiAgICAgICAgICAgIHJlcy5zZW5kKHtlcnJvcjogdHJ1ZSwgbWVzc2FnZTogXCJMZSBjb3Vwb24gZXN0IGTDqWrDoCB1dGlsaXPDqS5cIn0pO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgLy9JcyBjb3Vwb24gZXhwaXJlZCBvciBvdmVydXNlZFxuICAgICAgICBpZiAoIWNvdXBvbi5pc1ZhbGlkKCkpIHtcbiAgICAgICAgICAgIHJlcy5zZW5kKHtlcnJvcjogdHJ1ZSwgbWVzc2FnZTogXCJMZSBjb3Vwb24gbidlc3QgcGx1cyB2YWxpZGVcIn0pO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgLy9UaGUgY291cG9uIGlzIHZhbGlkXG4gICAgICAgIGxldCB1c2VyID0gYXdhaXQgdXNlclJlcG9zaXRvcnkuZmluZE9uZShyZXEudXNlci5pZCwge3JlbGF0aW9uczogW1wiY291cG9uc1wiXX0pO1xuICAgICAgICB1c2VyLmNvdXBvbnMucHVzaChjb3Vwb24pO1xuICAgICAgICBhd2FpdCB1c2VyLmNoYW5nZVBvaW50cyhjb3Vwb24uYW1vdW50KTtcbiAgICAgICAgYXdhaXQgdXNlclJlcG9zaXRvcnkuc2F2ZSh1c2VyKTtcblxuICAgICAgICByZXMuc2VuZCh7ZXJyb3I6IGZhbHNlLCBtZXNzYWdlOiBgTGUgY291cG9uIGQndW5lIHZhbGV1ciBkZSA6ICR7Y291cG9uLmFtb3VudH0gw6Agw6l0w6kgdXRpbGlzw6kgIWB9KTtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICAgIHJlcy5zZW5kKHtlcnJvcjogdHJ1ZSwgbWVzc2FnZTogXCJWb3VzIG4nw6p0ZXMgcGFzIGNvbm5lY3TDqS5cIn0pO1xuICAgIH1cbn0pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IHJvdXRlcjtcbiJdfQ==