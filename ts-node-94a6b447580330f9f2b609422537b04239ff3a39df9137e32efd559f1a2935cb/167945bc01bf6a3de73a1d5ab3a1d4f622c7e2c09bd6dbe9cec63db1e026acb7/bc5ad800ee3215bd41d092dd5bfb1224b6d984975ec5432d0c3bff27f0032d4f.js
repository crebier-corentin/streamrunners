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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiL1N0cmVhbVJ1bm5lcnMvVHdpdGNoVmlldy9yb3V0ZXMvY291cG9uLnRzIiwic291cmNlcyI6WyIvU3RyZWFtUnVubmVycy9Ud2l0Y2hWaWV3L3JvdXRlcy9jb3Vwb24udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7QUFBQSx1REFBdUQ7QUFFdkQsSUFBSSxPQUFPLEdBQUcsT0FBTyxDQUFDLFNBQVMsQ0FBQyxDQUFDO0FBQ2pDLElBQUksTUFBTSxHQUFHLE9BQU8sQ0FBQyxNQUFNLEVBQUUsQ0FBQztBQUk5QixrREFBNkM7QUFDN0Msc0RBQWlEO0FBR2pELE1BQU0sQ0FBQyxHQUFHLENBQUMsR0FBRyxFQUFFLFVBQWdCLEdBQW9CLEVBQUUsR0FBYTs7UUFDL0QsSUFBSSxHQUFHLENBQUMsZUFBZSxFQUFFLEVBQUU7WUFDdkIsR0FBRyxDQUFDLE1BQU0sQ0FBQyxRQUFRLEVBQUUsRUFBQyxLQUFLLEVBQUUseUJBQXlCLEVBQUUsR0FBRyxFQUFDLENBQUMsQ0FBQztTQUNqRTthQUNJO1lBQ0QsR0FBRyxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsQ0FBQztTQUNyQjtJQUNMLENBQUM7Q0FBQSxDQUFDLENBQUM7QUFFSCxNQUFNLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRSxVQUFnQixHQUFZLEVBQUUsR0FBYTs7UUFFM0QsSUFBSSxHQUFHLENBQUMsZUFBZSxFQUFFLEVBQUU7WUFDdkIsSUFBSSxJQUFJLEdBQUcsR0FBRyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUM7WUFDM0IsSUFBSSxjQUFjLEdBQUcsNEJBQWUsRUFBRSxDQUFDLGFBQWEsQ0FBQyxXQUFJLENBQUMsQ0FBQztZQUMzRCxJQUFJLGdCQUFnQixHQUFHLDRCQUFlLEVBQUUsQ0FBQyxhQUFhLENBQUMsZUFBTSxDQUFDLENBQUM7WUFFL0Qsa0JBQWtCO1lBQ2xCLElBQUksSUFBSSxJQUFJLEVBQUUsSUFBSSxJQUFJLElBQUksU0FBUyxJQUFJLElBQUksSUFBSSxJQUFJLEVBQUU7Z0JBQ2pELEdBQUcsQ0FBQyxJQUFJLENBQUMsRUFBQyxLQUFLLEVBQUUsSUFBSSxFQUFFLE9BQU8sRUFBRSwwQkFBMEIsRUFBQyxDQUFDLENBQUM7Z0JBQzdELE9BQU87YUFDVjtZQUVELDBCQUEwQjtZQUMxQixJQUFJLE1BQU0sR0FBRyxNQUFNLGdCQUFnQixDQUFDLE9BQU8sQ0FBQyxFQUFDLEtBQUssRUFBRSxFQUFDLElBQUksRUFBRSxJQUFJLEVBQUMsRUFBRSxTQUFTLEVBQUUsQ0FBQyxPQUFPLENBQUMsRUFBQyxDQUFDLENBQUM7WUFDekYsSUFBSSxNQUFNLElBQUksU0FBUyxFQUFFO2dCQUNyQixHQUFHLENBQUMsSUFBSSxDQUFDLEVBQUMsS0FBSyxFQUFFLElBQUksRUFBRSxPQUFPLEVBQUUseUJBQXlCLEVBQUMsQ0FBQyxDQUFDO2dCQUM1RCxPQUFPO2FBQ1Y7WUFFRCx5QkFBeUI7WUFDekIsSUFBSSxLQUFLLEdBQUcsTUFBTSxjQUFjLENBQUMsa0JBQWtCLENBQUMsTUFBTSxDQUFDO2lCQUN0RCxpQkFBaUIsQ0FBQyxjQUFjLEVBQUUsUUFBUSxDQUFDO2lCQUMzQyxLQUFLLENBQUMsZUFBZSxFQUFFLEVBQUMsRUFBRSxFQUFFLEdBQUcsQ0FBQyxJQUFJLENBQUMsRUFBRSxFQUFDLENBQUM7aUJBQ3pDLFFBQVEsQ0FBQyxxQkFBcUIsRUFBRSxFQUFDLElBQUksRUFBQyxDQUFDO2lCQUN2QyxRQUFRLEVBQUUsQ0FBQztZQUVoQixJQUFJLEtBQUssR0FBRyxDQUFDLEVBQUU7Z0JBQ1gsR0FBRyxDQUFDLElBQUksQ0FBQyxFQUFDLEtBQUssRUFBRSxJQUFJLEVBQUUsT0FBTyxFQUFFLDZCQUE2QixFQUFDLENBQUMsQ0FBQztnQkFDaEUsT0FBTzthQUNWO1lBRUQsK0JBQStCO1lBQy9CLElBQUksQ0FBQyxNQUFNLENBQUMsT0FBTyxFQUFFLEVBQUU7Z0JBQ25CLEdBQUcsQ0FBQyxJQUFJLENBQUMsRUFBQyxLQUFLLEVBQUUsSUFBSSxFQUFFLE9BQU8sRUFBRSw2QkFBNkIsRUFBQyxDQUFDLENBQUM7Z0JBQ2hFLE9BQU87YUFDVjtZQUVELHFCQUFxQjtZQUNyQixJQUFJLElBQUksR0FBRyxNQUFNLGNBQWMsQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxFQUFFLEVBQUUsRUFBQyxTQUFTLEVBQUUsQ0FBQyxTQUFTLENBQUMsRUFBQyxDQUFDLENBQUM7WUFDL0UsSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUM7WUFDMUIsTUFBTSxJQUFJLENBQUMsWUFBWSxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQztZQUN2QyxNQUFNLGNBQWMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7WUFFaEMsR0FBRyxDQUFDLElBQUksQ0FBQyxFQUFDLEtBQUssRUFBRSxLQUFLLEVBQUUsT0FBTyxFQUFFLCtCQUErQixNQUFNLENBQUMsTUFBTSxrQkFBa0IsRUFBQyxDQUFDLENBQUM7U0FDckc7YUFDSTtZQUNELEdBQUcsQ0FBQyxJQUFJLENBQUMsRUFBQyxLQUFLLEVBQUUsSUFBSSxFQUFFLE9BQU8sRUFBRSwyQkFBMkIsRUFBQyxDQUFDLENBQUM7U0FDakU7SUFDTCxDQUFDO0NBQUEsQ0FBQyxDQUFDO0FBRUgsTUFBTSxDQUFDLE9BQU8sR0FBRyxNQUFNLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge2dldERCQ29ubmVjdGlvbn0gZnJvbSBcIi4uL2RhdGFiYXNlL2Nvbm5lY3Rpb25cIjtcblxudmFyIGV4cHJlc3MgPSByZXF1aXJlKCdleHByZXNzJyk7XG52YXIgcm91dGVyID0gZXhwcmVzcy5Sb3V0ZXIoKTtcblxuLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIG5vLXVudXNlZC12YXJzXG5pbXBvcnQge1JlcXVlc3QsIFJlc3BvbnNlfSBmcm9tIFwiZXhwcmVzc1wiO1xuaW1wb3J0IHtVc2VyfSBmcm9tIFwiLi4vZGF0YWJhc2UvZW50aXR5L1VzZXJcIjtcbmltcG9ydCB7Q291cG9ufSBmcm9tIFwiLi4vZGF0YWJhc2UvZW50aXR5L0NvdXBvblwiO1xuXG5cbnJvdXRlci5nZXQoJy8nLCBhc3luYyBmdW5jdGlvbiAocmVxOiBFeHByZXNzLlJlcXVlc3QsIHJlczogUmVzcG9uc2UpIHtcbiAgICBpZiAocmVxLmlzQXV0aGVudGljYXRlZCgpKSB7XG4gICAgICAgIHJlcy5yZW5kZXIoXCJjb3Vwb25cIiwge3RpdGxlOiBcIlN0cmVhbVJ1bm5lcnMgLSBDb3Vwb25zXCIsIHJlcX0pO1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgICAgcmVzLnJlZGlyZWN0KFwiL1wiKTtcbiAgICB9XG59KTtcblxucm91dGVyLnBvc3QoJy9hZGQnLCBhc3luYyBmdW5jdGlvbiAocmVxOiBSZXF1ZXN0LCByZXM6IFJlc3BvbnNlKSB7XG5cbiAgICBpZiAocmVxLmlzQXV0aGVudGljYXRlZCgpKSB7XG4gICAgICAgIGxldCBjb2RlID0gcmVxLmJvZHkuY291cG9uO1xuICAgICAgICBsZXQgdXNlclJlcG9zaXRvcnkgPSBnZXREQkNvbm5lY3Rpb24oKS5nZXRSZXBvc2l0b3J5KFVzZXIpO1xuICAgICAgICBsZXQgY291cG9uUmVwb3NpdG9yeSA9IGdldERCQ29ubmVjdGlvbigpLmdldFJlcG9zaXRvcnkoQ291cG9uKTtcblxuICAgICAgICAvL0lmIGNvZGUgaXMgZW1wdHlcbiAgICAgICAgaWYgKGNvZGUgPT0gXCJcIiB8fCBjb2RlID09IHVuZGVmaW5lZCB8fCBjb2RlID09IG51bGwpIHtcbiAgICAgICAgICAgIHJlcy5zZW5kKHtlcnJvcjogdHJ1ZSwgbWVzc2FnZTogXCJMZSBjb2RlIGNvdXBvbiBlc3QgdmlkZS5cIn0pO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgLy9JZiBjb3Vwb24gZG9lcyBub3QgZXhpc3RcbiAgICAgICAgbGV0IGNvdXBvbiA9IGF3YWl0IGNvdXBvblJlcG9zaXRvcnkuZmluZE9uZSh7d2hlcmU6IHtuYW1lOiBjb2RlfSwgcmVsYXRpb25zOiBbXCJ1c2Vyc1wiXX0pO1xuICAgICAgICBpZiAoY291cG9uID09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgcmVzLnNlbmQoe2Vycm9yOiB0cnVlLCBtZXNzYWdlOiBcIkxlIGNvdXBvbiBuJ2V4aXN0ZSBwYXMuXCJ9KTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vSWYgY29kZSBpcyBhbHJlYWR5IHVzZWRcbiAgICAgICAgbGV0IGNvdW50ID0gYXdhaXQgdXNlclJlcG9zaXRvcnkuY3JlYXRlUXVlcnlCdWlsZGVyKFwidXNlclwiKVxuICAgICAgICAgICAgLmxlZnRKb2luQW5kU2VsZWN0KFwidXNlci5jb3Vwb25zXCIsIFwiY291cG9uXCIpXG4gICAgICAgICAgICAud2hlcmUoXCJ1c2VyLmlkID0gOmlkXCIsIHtpZDogcmVxLnVzZXIuaWR9KVxuICAgICAgICAgICAgLmFuZFdoZXJlKFwiY291cG9uLm5hbWUgPSA6Y29kZVwiLCB7Y29kZX0pXG4gICAgICAgICAgICAuZ2V0Q291bnQoKTtcblxuICAgICAgICBpZiAoY291bnQgPiAwKSB7XG4gICAgICAgICAgICByZXMuc2VuZCh7ZXJyb3I6IHRydWUsIG1lc3NhZ2U6IFwiTGUgY291cG9uIGVzdCBkw6lqw6AgdXRpbGlzw6kuXCJ9KTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vSXMgY291cG9uIGV4cGlyZWQgb3Igb3ZlcnVzZWRcbiAgICAgICAgaWYgKCFjb3Vwb24uaXNWYWxpZCgpKSB7XG4gICAgICAgICAgICByZXMuc2VuZCh7ZXJyb3I6IHRydWUsIG1lc3NhZ2U6IFwiTGUgY291cG9uIG4nZXN0IHBsdXMgdmFsaWRlXCJ9KTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vVGhlIGNvdXBvbiBpcyB2YWxpZFxuICAgICAgICBsZXQgdXNlciA9IGF3YWl0IHVzZXJSZXBvc2l0b3J5LmZpbmRPbmUocmVxLnVzZXIuaWQsIHtyZWxhdGlvbnM6IFtcImNvdXBvbnNcIl19KTtcbiAgICAgICAgdXNlci5jb3Vwb25zLnB1c2goY291cG9uKTtcbiAgICAgICAgYXdhaXQgdXNlci5jaGFuZ2VQb2ludHMoY291cG9uLmFtb3VudCk7XG4gICAgICAgIGF3YWl0IHVzZXJSZXBvc2l0b3J5LnNhdmUodXNlcik7XG5cbiAgICAgICAgcmVzLnNlbmQoe2Vycm9yOiBmYWxzZSwgbWVzc2FnZTogYExlIGNvdXBvbiBkJ3VuZSB2YWxldXIgZGUgOiAke2NvdXBvbi5hbW91bnR9IMOgIMOpdMOpIHV0aWxpc8OpICFgfSk7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgICByZXMuc2VuZCh7ZXJyb3I6IHRydWUsIG1lc3NhZ2U6IFwiVm91cyBuJ8OqdGVzIHBhcyBjb25uZWN0w6kuXCJ9KTtcbiAgICB9XG59KTtcblxubW9kdWxlLmV4cG9ydHMgPSByb3V0ZXI7XG4iXX0=