"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const typeorm_1 = require("typeorm");
const User_1 = require("./User");
const Case_1 = require("./Case");
const CaseOwned_1 = require("./CaseOwned");
const connection_1 = require("../connection");
const SteamKey_1 = require("./SteamKey");
let CaseContent = class CaseContent extends typeorm_1.BaseEntity {
    getRareColor() {
        const value = this.chance;
        //If special
        if (value == null) {
            switch (this.special) {
                case "logo_banniere":
                case "steam":
                    return "#ffd700";
                case "badge_beta":
                    return "#cf0a1d";
            }
        }
        //Dorée
        if (value > 0 && value <= 1.99 * 100) {
            return "#ffd700";
        }
        //Rouge
        if (value > 1.99 * 100 && value <= 3 * 100) {
            return "#cf0a1d";
        }
        //Violet
        if (value > 3 * 100 && value <= 15 * 100) {
            return "#2e006c";
        }
        //Bleu
        if (value > 15 * 100 && value <= 23 * 100) {
            return "#0f056b";
        }
        //Gris
        return "#808080";
    }
    applyContent(user, caseOwned) {
        return __awaiter(this, void 0, void 0, function* () {
            const userRepository = connection_1.getDBConnection().getRepository(User_1.User);
            const caseOwnedRepository = connection_1.getDBConnection().getRepository(CaseOwned_1.CaseOwned);
            if (this.special != null) {
                switch (this.special) {
                    case "badge_beta":
                        user.betaBage = true;
                        break;
                    case "steam":
                        caseOwned.steamKey = yield SteamKey_1.SteamKey.random();
                        caseOwnedRepository.save(caseOwned);
                        break;
                }
            }
            else {
                //Points
                yield user.changePoints(this.amount);
            }
            yield userRepository.save(user);
        });
    }
};
__decorate([
    typeorm_1.PrimaryGeneratedColumn(),
    __metadata("design:type", Number)
], CaseContent.prototype, "id", void 0);
__decorate([
    typeorm_1.Column({ unique: true }),
    __metadata("design:type", String)
], CaseContent.prototype, "name", void 0);
__decorate([
    typeorm_1.Column({ nullable: true }),
    __metadata("design:type", String)
], CaseContent.prototype, "image", void 0);
__decorate([
    typeorm_1.Column({ nullable: true }),
    __metadata("design:type", Number)
], CaseContent.prototype, "amount", void 0);
__decorate([
    typeorm_1.Column(),
    __metadata("design:type", Number)
], CaseContent.prototype, "chance", void 0);
__decorate([
    typeorm_1.Column({ nullable: true }),
    __metadata("design:type", String)
], CaseContent.prototype, "special", void 0);
__decorate([
    typeorm_1.ManyToOne(type => Case_1.Case, Case => Case.content),
    __metadata("design:type", Case_1.Case)
], CaseContent.prototype, "case", void 0);
__decorate([
    typeorm_1.OneToMany(type => CaseOwned_1.CaseOwned, CaseOwned => CaseOwned.content),
    __metadata("design:type", CaseOwned_1.CaseOwned)
], CaseContent.prototype, "caseOwned", void 0);
CaseContent = __decorate([
    typeorm_1.Entity()
], CaseContent);
exports.CaseContent = CaseContent;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiL1N0cmVhbVJ1bm5lcnMvVHdpdGNoVmlldy9kYXRhYmFzZS9lbnRpdHkvQ2FzZUNvbnRlbnQudHMiLCJzb3VyY2VzIjpbIi9TdHJlYW1SdW5uZXJzL1R3aXRjaFZpZXcvZGF0YWJhc2UvZW50aXR5L0Nhc2VDb250ZW50LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQSxxQ0FTaUI7QUFDakIsaUNBQTRCO0FBQzVCLGlDQUE0QjtBQUM1QiwyQ0FBc0M7QUFDdEMsOENBQThDO0FBQzlDLHlDQUFvQztBQUdwQyxJQUFhLFdBQVcsR0FBeEIsTUFBYSxXQUFZLFNBQVEsb0JBQVU7SUEwQnZDLFlBQVk7UUFDUixNQUFNLEtBQUssR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDO1FBRTFCLFlBQVk7UUFDWixJQUFJLEtBQUssSUFBSSxJQUFJLEVBQUU7WUFDZixRQUFRLElBQUksQ0FBQyxPQUFPLEVBQUU7Z0JBQ2xCLEtBQUssZUFBZSxDQUFDO2dCQUNyQixLQUFLLE9BQU87b0JBQ1IsT0FBTyxTQUFTLENBQUM7Z0JBQ3JCLEtBQUssWUFBWTtvQkFDYixPQUFPLFNBQVMsQ0FBQzthQUd4QjtTQUNKO1FBRUQsT0FBTztRQUNQLElBQUksS0FBSyxHQUFHLENBQUMsSUFBSSxLQUFLLElBQUksSUFBSSxHQUFHLEdBQUcsRUFBRTtZQUNsQyxPQUFPLFNBQVMsQ0FBQztTQUNwQjtRQUVELE9BQU87UUFDUCxJQUFJLEtBQUssR0FBRyxJQUFJLEdBQUcsR0FBRyxJQUFJLEtBQUssSUFBSSxDQUFDLEdBQUcsR0FBRyxFQUFFO1lBQ3hDLE9BQU8sU0FBUyxDQUFDO1NBQ3BCO1FBRUQsUUFBUTtRQUNSLElBQUksS0FBSyxHQUFHLENBQUMsR0FBRyxHQUFHLElBQUksS0FBSyxJQUFJLEVBQUUsR0FBRyxHQUFHLEVBQUU7WUFDdEMsT0FBTyxTQUFTLENBQUM7U0FDcEI7UUFFRCxNQUFNO1FBQ04sSUFBSSxLQUFLLEdBQUcsRUFBRSxHQUFHLEdBQUcsSUFBSSxLQUFLLElBQUksRUFBRSxHQUFHLEdBQUcsRUFBRTtZQUN2QyxPQUFPLFNBQVMsQ0FBQztTQUNwQjtRQUVELE1BQU07UUFDTixPQUFPLFNBQVMsQ0FBQztJQUdyQixDQUFDO0lBRUssWUFBWSxDQUFDLElBQVUsRUFBRSxTQUFvQjs7WUFDL0MsTUFBTSxjQUFjLEdBQUcsNEJBQWUsRUFBRSxDQUFDLGFBQWEsQ0FBQyxXQUFJLENBQUMsQ0FBQztZQUM3RCxNQUFNLG1CQUFtQixHQUFHLDRCQUFlLEVBQUUsQ0FBQyxhQUFhLENBQUMscUJBQVMsQ0FBQyxDQUFDO1lBR3ZFLElBQUksSUFBSSxDQUFDLE9BQU8sSUFBSSxJQUFJLEVBQUU7Z0JBRXRCLFFBQVEsSUFBSSxDQUFDLE9BQU8sRUFBRTtvQkFDbEIsS0FBSyxZQUFZO3dCQUNiLElBQUksQ0FBQyxRQUFRLEdBQUcsSUFBSSxDQUFDO3dCQUNyQixNQUFNO29CQUVWLEtBQUssT0FBTzt3QkFDUixTQUFTLENBQUMsUUFBUSxHQUFHLE1BQU0sbUJBQVEsQ0FBQyxNQUFNLEVBQUUsQ0FBQzt3QkFDN0MsbUJBQW1CLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDO3dCQUNwQyxNQUFNO2lCQUNiO2FBRUo7aUJBQ0k7Z0JBRUQsUUFBUTtnQkFDUixNQUFNLElBQUksQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDO2FBQ3hDO1lBRUQsTUFBTSxjQUFjLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQ3BDLENBQUM7S0FBQTtDQUdKLENBQUE7QUE5Rkc7SUFEQyxnQ0FBc0IsRUFBRTs7dUNBQ2Q7QUFHWDtJQURDLGdCQUFNLENBQUMsRUFBQyxNQUFNLEVBQUUsSUFBSSxFQUFDLENBQUM7O3lDQUNWO0FBR2I7SUFEQyxnQkFBTSxDQUFDLEVBQUMsUUFBUSxFQUFFLElBQUksRUFBQyxDQUFDOzswQ0FDWDtBQUdkO0lBREMsZ0JBQU0sQ0FBQyxFQUFDLFFBQVEsRUFBRSxJQUFJLEVBQUMsQ0FBQzs7MkNBQ1Y7QUFHZjtJQURDLGdCQUFNLEVBQUU7OzJDQUNNO0FBR2Y7SUFEQyxnQkFBTSxDQUFDLEVBQUMsUUFBUSxFQUFFLElBQUksRUFBQyxDQUFDOzs0Q0FDVDtBQUdoQjtJQURDLG1CQUFTLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxXQUFJLEVBQUUsSUFBSSxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDOzhCQUN4QyxXQUFJO3lDQUFDO0FBR1g7SUFEQyxtQkFBUyxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMscUJBQVMsRUFBRSxTQUFTLENBQUMsRUFBRSxDQUFDLFNBQVMsQ0FBQyxPQUFPLENBQUM7OEJBQ2xELHFCQUFTOzhDQUFDO0FBeEJaLFdBQVc7SUFEdkIsZ0JBQU0sRUFBRTtHQUNJLFdBQVcsQ0FpR3ZCO0FBakdZLGtDQUFXIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtcbiAgICBCYXNlRW50aXR5LFxuICAgIENvbHVtbixcbiAgICBFbnRpdHksXG4gICAgSm9pbkNvbHVtbixcbiAgICBNYW55VG9NYW55LFxuICAgIE1hbnlUb09uZSxcbiAgICBPbmVUb01hbnksIE9uZVRvT25lLFxuICAgIFByaW1hcnlHZW5lcmF0ZWRDb2x1bW5cbn0gZnJvbSBcInR5cGVvcm1cIjtcbmltcG9ydCB7VXNlcn0gZnJvbSBcIi4vVXNlclwiO1xuaW1wb3J0IHtDYXNlfSBmcm9tIFwiLi9DYXNlXCI7XG5pbXBvcnQge0Nhc2VPd25lZH0gZnJvbSBcIi4vQ2FzZU93bmVkXCI7XG5pbXBvcnQge2dldERCQ29ubmVjdGlvbn0gZnJvbSBcIi4uL2Nvbm5lY3Rpb25cIjtcbmltcG9ydCB7U3RlYW1LZXl9IGZyb20gXCIuL1N0ZWFtS2V5XCI7XG5cbkBFbnRpdHkoKVxuZXhwb3J0IGNsYXNzIENhc2VDb250ZW50IGV4dGVuZHMgQmFzZUVudGl0eSB7XG5cbiAgICBAUHJpbWFyeUdlbmVyYXRlZENvbHVtbigpXG4gICAgaWQ6IG51bWJlcjtcblxuICAgIEBDb2x1bW4oe3VuaXF1ZTogdHJ1ZX0pXG4gICAgbmFtZTogc3RyaW5nO1xuXG4gICAgQENvbHVtbih7bnVsbGFibGU6IHRydWV9KVxuICAgIGltYWdlOiBzdHJpbmc7XG5cbiAgICBAQ29sdW1uKHtudWxsYWJsZTogdHJ1ZX0pXG4gICAgYW1vdW50OiBudW1iZXI7XG5cbiAgICBAQ29sdW1uKClcbiAgICBjaGFuY2U6IG51bWJlcjtcblxuICAgIEBDb2x1bW4oe251bGxhYmxlOiB0cnVlfSlcbiAgICBzcGVjaWFsOiBzdHJpbmc7XG5cbiAgICBATWFueVRvT25lKHR5cGUgPT4gQ2FzZSwgQ2FzZSA9PiBDYXNlLmNvbnRlbnQpXG4gICAgY2FzZTogQ2FzZTtcblxuICAgIEBPbmVUb01hbnkodHlwZSA9PiBDYXNlT3duZWQsIENhc2VPd25lZCA9PiBDYXNlT3duZWQuY29udGVudClcbiAgICBjYXNlT3duZWQ6IENhc2VPd25lZDtcblxuICAgIGdldFJhcmVDb2xvcigpOiBzdHJpbmcge1xuICAgICAgICBjb25zdCB2YWx1ZSA9IHRoaXMuY2hhbmNlO1xuXG4gICAgICAgIC8vSWYgc3BlY2lhbFxuICAgICAgICBpZiAodmFsdWUgPT0gbnVsbCkge1xuICAgICAgICAgICAgc3dpdGNoICh0aGlzLnNwZWNpYWwpIHtcbiAgICAgICAgICAgICAgICBjYXNlIFwibG9nb19iYW5uaWVyZVwiOlxuICAgICAgICAgICAgICAgIGNhc2UgXCJzdGVhbVwiOlxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gXCIjZmZkNzAwXCI7XG4gICAgICAgICAgICAgICAgY2FzZSBcImJhZGdlX2JldGFcIjpcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIFwiI2NmMGExZFwiO1xuXG5cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIC8vRG9yw6llXG4gICAgICAgIGlmICh2YWx1ZSA+IDAgJiYgdmFsdWUgPD0gMS45OSAqIDEwMCkge1xuICAgICAgICAgICAgcmV0dXJuIFwiI2ZmZDcwMFwiO1xuICAgICAgICB9XG5cbiAgICAgICAgLy9Sb3VnZVxuICAgICAgICBpZiAodmFsdWUgPiAxLjk5ICogMTAwICYmIHZhbHVlIDw9IDMgKiAxMDApIHtcbiAgICAgICAgICAgIHJldHVybiBcIiNjZjBhMWRcIjtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vVmlvbGV0XG4gICAgICAgIGlmICh2YWx1ZSA+IDMgKiAxMDAgJiYgdmFsdWUgPD0gMTUgKiAxMDApIHtcbiAgICAgICAgICAgIHJldHVybiBcIiMyZTAwNmNcIjtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vQmxldVxuICAgICAgICBpZiAodmFsdWUgPiAxNSAqIDEwMCAmJiB2YWx1ZSA8PSAyMyAqIDEwMCkge1xuICAgICAgICAgICAgcmV0dXJuIFwiIzBmMDU2YlwiO1xuICAgICAgICB9XG5cbiAgICAgICAgLy9HcmlzXG4gICAgICAgIHJldHVybiBcIiM4MDgwODBcIjtcblxuXG4gICAgfVxuXG4gICAgYXN5bmMgYXBwbHlDb250ZW50KHVzZXI6IFVzZXIsIGNhc2VPd25lZDogQ2FzZU93bmVkKSB7XG4gICAgICAgIGNvbnN0IHVzZXJSZXBvc2l0b3J5ID0gZ2V0REJDb25uZWN0aW9uKCkuZ2V0UmVwb3NpdG9yeShVc2VyKTtcbiAgICAgICAgY29uc3QgY2FzZU93bmVkUmVwb3NpdG9yeSA9IGdldERCQ29ubmVjdGlvbigpLmdldFJlcG9zaXRvcnkoQ2FzZU93bmVkKTtcblxuXG4gICAgICAgIGlmICh0aGlzLnNwZWNpYWwgIT0gbnVsbCkge1xuXG4gICAgICAgICAgICBzd2l0Y2ggKHRoaXMuc3BlY2lhbCkge1xuICAgICAgICAgICAgICAgIGNhc2UgXCJiYWRnZV9iZXRhXCI6XG4gICAgICAgICAgICAgICAgICAgIHVzZXIuYmV0YUJhZ2UgPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcblxuICAgICAgICAgICAgICAgIGNhc2UgXCJzdGVhbVwiOlxuICAgICAgICAgICAgICAgICAgICBjYXNlT3duZWQuc3RlYW1LZXkgPSBhd2FpdCBTdGVhbUtleS5yYW5kb20oKTtcbiAgICAgICAgICAgICAgICAgICAgY2FzZU93bmVkUmVwb3NpdG9yeS5zYXZlKGNhc2VPd25lZCk7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG5cbiAgICAgICAgICAgIC8vUG9pbnRzXG4gICAgICAgICAgICBhd2FpdCB1c2VyLmNoYW5nZVBvaW50cyh0aGlzLmFtb3VudCk7XG4gICAgICAgIH1cblxuICAgICAgICBhd2FpdCB1c2VyUmVwb3NpdG9yeS5zYXZlKHVzZXIpO1xuICAgIH1cblxuXG59XG4iXX0=