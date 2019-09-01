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
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiL1N0cmVhbVJ1bm5lcnMvVHdpdGNoVmlldy9kYXRhYmFzZS9lbnRpdHkvQ2FzZUNvbnRlbnQudHMiLCJzb3VyY2VzIjpbIi9TdHJlYW1SdW5uZXJzL1R3aXRjaFZpZXcvZGF0YWJhc2UvZW50aXR5L0Nhc2VDb250ZW50LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQUEscUNBU2lCO0FBQ2pCLGlDQUE0QjtBQUM1QixpQ0FBNEI7QUFDNUIsMkNBQXNDO0FBQ3RDLDhDQUE4QztBQUM5Qyx5Q0FBb0M7QUFHcEMsSUFBYSxXQUFXLEdBQXhCLE1BQWEsV0FBWSxTQUFRLG9CQUFVO0lBMEJ2QyxZQUFZO1FBQ1IsTUFBTSxLQUFLLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQztRQUUxQixZQUFZO1FBQ1osSUFBSSxLQUFLLElBQUksSUFBSSxFQUFFO1lBQ2YsUUFBUSxJQUFJLENBQUMsT0FBTyxFQUFFO2dCQUNsQixLQUFLLGVBQWUsQ0FBQztnQkFDckIsS0FBSyxPQUFPO29CQUNSLE9BQU8sU0FBUyxDQUFDO2dCQUNyQixLQUFLLFlBQVk7b0JBQ2IsT0FBTyxTQUFTLENBQUM7YUFHeEI7U0FDSjtRQUVELE9BQU87UUFDUCxJQUFJLEtBQUssR0FBRyxDQUFDLElBQUksS0FBSyxJQUFJLElBQUksR0FBRyxHQUFHLEVBQUU7WUFDbEMsT0FBTyxTQUFTLENBQUM7U0FDcEI7UUFFRCxPQUFPO1FBQ1AsSUFBSSxLQUFLLEdBQUcsSUFBSSxHQUFHLEdBQUcsSUFBSSxLQUFLLElBQUksQ0FBQyxHQUFHLEdBQUcsRUFBRTtZQUN4QyxPQUFPLFNBQVMsQ0FBQztTQUNwQjtRQUVELFFBQVE7UUFDUixJQUFJLEtBQUssR0FBRyxDQUFDLEdBQUcsR0FBRyxJQUFJLEtBQUssSUFBSSxFQUFFLEdBQUcsR0FBRyxFQUFFO1lBQ3RDLE9BQU8sU0FBUyxDQUFDO1NBQ3BCO1FBRUQsTUFBTTtRQUNOLElBQUksS0FBSyxHQUFHLEVBQUUsR0FBRyxHQUFHLElBQUksS0FBSyxJQUFJLEVBQUUsR0FBRyxHQUFHLEVBQUU7WUFDdkMsT0FBTyxTQUFTLENBQUM7U0FDcEI7UUFFRCxNQUFNO1FBQ04sT0FBTyxTQUFTLENBQUM7SUFHckIsQ0FBQztJQUVLLFlBQVksQ0FBQyxJQUFVLEVBQUUsU0FBb0I7O1lBQy9DLE1BQU0sY0FBYyxHQUFHLDRCQUFlLEVBQUUsQ0FBQyxhQUFhLENBQUMsV0FBSSxDQUFDLENBQUM7WUFDN0QsTUFBTSxtQkFBbUIsR0FBRyw0QkFBZSxFQUFFLENBQUMsYUFBYSxDQUFDLHFCQUFTLENBQUMsQ0FBQztZQUd2RSxJQUFJLElBQUksQ0FBQyxPQUFPLElBQUksSUFBSSxFQUFFO2dCQUV0QixRQUFRLElBQUksQ0FBQyxPQUFPLEVBQUU7b0JBQ2xCLEtBQUssWUFBWTt3QkFDYixJQUFJLENBQUMsUUFBUSxHQUFHLElBQUksQ0FBQzt3QkFDckIsTUFBTTtvQkFFVixLQUFLLE9BQU87d0JBQ1IsU0FBUyxDQUFDLFFBQVEsR0FBRyxNQUFNLG1CQUFRLENBQUMsTUFBTSxFQUFFLENBQUM7d0JBQzdDLG1CQUFtQixDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQzt3QkFDcEMsTUFBTTtpQkFDYjthQUVKO2lCQUNJO2dCQUVELFFBQVE7Z0JBQ1IsTUFBTSxJQUFJLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQzthQUN4QztZQUVELE1BQU0sY0FBYyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUNwQyxDQUFDO0tBQUE7Q0FHSixDQUFBO0FBOUZHO0lBREMsZ0NBQXNCLEVBQUU7O3VDQUNkO0FBR1g7SUFEQyxnQkFBTSxDQUFDLEVBQUMsTUFBTSxFQUFFLElBQUksRUFBQyxDQUFDOzt5Q0FDVjtBQUdiO0lBREMsZ0JBQU0sQ0FBQyxFQUFDLFFBQVEsRUFBRSxJQUFJLEVBQUMsQ0FBQzs7MENBQ1g7QUFHZDtJQURDLGdCQUFNLENBQUMsRUFBQyxRQUFRLEVBQUUsSUFBSSxFQUFDLENBQUM7OzJDQUNWO0FBR2Y7SUFEQyxnQkFBTSxFQUFFOzsyQ0FDTTtBQUdmO0lBREMsZ0JBQU0sQ0FBQyxFQUFDLFFBQVEsRUFBRSxJQUFJLEVBQUMsQ0FBQzs7NENBQ1Q7QUFHaEI7SUFEQyxtQkFBUyxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsV0FBSSxFQUFFLElBQUksQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQzs4QkFDeEMsV0FBSTt5Q0FBQztBQUdYO0lBREMsbUJBQVMsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLHFCQUFTLEVBQUUsU0FBUyxDQUFDLEVBQUUsQ0FBQyxTQUFTLENBQUMsT0FBTyxDQUFDOzhCQUNsRCxxQkFBUzs4Q0FBQztBQXhCWixXQUFXO0lBRHZCLGdCQUFNLEVBQUU7R0FDSSxXQUFXLENBaUd2QjtBQWpHWSxrQ0FBVyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7XG4gICAgQmFzZUVudGl0eSxcbiAgICBDb2x1bW4sXG4gICAgRW50aXR5LFxuICAgIEpvaW5Db2x1bW4sXG4gICAgTWFueVRvTWFueSxcbiAgICBNYW55VG9PbmUsXG4gICAgT25lVG9NYW55LCBPbmVUb09uZSxcbiAgICBQcmltYXJ5R2VuZXJhdGVkQ29sdW1uXG59IGZyb20gXCJ0eXBlb3JtXCI7XG5pbXBvcnQge1VzZXJ9IGZyb20gXCIuL1VzZXJcIjtcbmltcG9ydCB7Q2FzZX0gZnJvbSBcIi4vQ2FzZVwiO1xuaW1wb3J0IHtDYXNlT3duZWR9IGZyb20gXCIuL0Nhc2VPd25lZFwiO1xuaW1wb3J0IHtnZXREQkNvbm5lY3Rpb259IGZyb20gXCIuLi9jb25uZWN0aW9uXCI7XG5pbXBvcnQge1N0ZWFtS2V5fSBmcm9tIFwiLi9TdGVhbUtleVwiO1xuXG5ARW50aXR5KClcbmV4cG9ydCBjbGFzcyBDYXNlQ29udGVudCBleHRlbmRzIEJhc2VFbnRpdHkge1xuXG4gICAgQFByaW1hcnlHZW5lcmF0ZWRDb2x1bW4oKVxuICAgIGlkOiBudW1iZXI7XG5cbiAgICBAQ29sdW1uKHt1bmlxdWU6IHRydWV9KVxuICAgIG5hbWU6IHN0cmluZztcblxuICAgIEBDb2x1bW4oe251bGxhYmxlOiB0cnVlfSlcbiAgICBpbWFnZTogc3RyaW5nO1xuXG4gICAgQENvbHVtbih7bnVsbGFibGU6IHRydWV9KVxuICAgIGFtb3VudDogbnVtYmVyO1xuXG4gICAgQENvbHVtbigpXG4gICAgY2hhbmNlOiBudW1iZXI7XG5cbiAgICBAQ29sdW1uKHtudWxsYWJsZTogdHJ1ZX0pXG4gICAgc3BlY2lhbDogc3RyaW5nO1xuXG4gICAgQE1hbnlUb09uZSh0eXBlID0+IENhc2UsIENhc2UgPT4gQ2FzZS5jb250ZW50KVxuICAgIGNhc2U6IENhc2U7XG5cbiAgICBAT25lVG9NYW55KHR5cGUgPT4gQ2FzZU93bmVkLCBDYXNlT3duZWQgPT4gQ2FzZU93bmVkLmNvbnRlbnQpXG4gICAgY2FzZU93bmVkOiBDYXNlT3duZWQ7XG5cbiAgICBnZXRSYXJlQ29sb3IoKTogc3RyaW5nIHtcbiAgICAgICAgY29uc3QgdmFsdWUgPSB0aGlzLmNoYW5jZTtcblxuICAgICAgICAvL0lmIHNwZWNpYWxcbiAgICAgICAgaWYgKHZhbHVlID09IG51bGwpIHtcbiAgICAgICAgICAgIHN3aXRjaCAodGhpcy5zcGVjaWFsKSB7XG4gICAgICAgICAgICAgICAgY2FzZSBcImxvZ29fYmFubmllcmVcIjpcbiAgICAgICAgICAgICAgICBjYXNlIFwic3RlYW1cIjpcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIFwiI2ZmZDcwMFwiO1xuICAgICAgICAgICAgICAgIGNhc2UgXCJiYWRnZV9iZXRhXCI6XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBcIiNjZjBhMWRcIjtcblxuXG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICAvL0RvcsOpZVxuICAgICAgICBpZiAodmFsdWUgPiAwICYmIHZhbHVlIDw9IDEuOTkgKiAxMDApIHtcbiAgICAgICAgICAgIHJldHVybiBcIiNmZmQ3MDBcIjtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vUm91Z2VcbiAgICAgICAgaWYgKHZhbHVlID4gMS45OSAqIDEwMCAmJiB2YWx1ZSA8PSAzICogMTAwKSB7XG4gICAgICAgICAgICByZXR1cm4gXCIjY2YwYTFkXCI7XG4gICAgICAgIH1cblxuICAgICAgICAvL1Zpb2xldFxuICAgICAgICBpZiAodmFsdWUgPiAzICogMTAwICYmIHZhbHVlIDw9IDE1ICogMTAwKSB7XG4gICAgICAgICAgICByZXR1cm4gXCIjMmUwMDZjXCI7XG4gICAgICAgIH1cblxuICAgICAgICAvL0JsZXVcbiAgICAgICAgaWYgKHZhbHVlID4gMTUgKiAxMDAgJiYgdmFsdWUgPD0gMjMgKiAxMDApIHtcbiAgICAgICAgICAgIHJldHVybiBcIiMwZjA1NmJcIjtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vR3Jpc1xuICAgICAgICByZXR1cm4gXCIjODA4MDgwXCI7XG5cblxuICAgIH1cblxuICAgIGFzeW5jIGFwcGx5Q29udGVudCh1c2VyOiBVc2VyLCBjYXNlT3duZWQ6IENhc2VPd25lZCkge1xuICAgICAgICBjb25zdCB1c2VyUmVwb3NpdG9yeSA9IGdldERCQ29ubmVjdGlvbigpLmdldFJlcG9zaXRvcnkoVXNlcik7XG4gICAgICAgIGNvbnN0IGNhc2VPd25lZFJlcG9zaXRvcnkgPSBnZXREQkNvbm5lY3Rpb24oKS5nZXRSZXBvc2l0b3J5KENhc2VPd25lZCk7XG5cblxuICAgICAgICBpZiAodGhpcy5zcGVjaWFsICE9IG51bGwpIHtcblxuICAgICAgICAgICAgc3dpdGNoICh0aGlzLnNwZWNpYWwpIHtcbiAgICAgICAgICAgICAgICBjYXNlIFwiYmFkZ2VfYmV0YVwiOlxuICAgICAgICAgICAgICAgICAgICB1c2VyLmJldGFCYWdlID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgICAgICAgICBjYXNlIFwic3RlYW1cIjpcbiAgICAgICAgICAgICAgICAgICAgY2FzZU93bmVkLnN0ZWFtS2V5ID0gYXdhaXQgU3RlYW1LZXkucmFuZG9tKCk7XG4gICAgICAgICAgICAgICAgICAgIGNhc2VPd25lZFJlcG9zaXRvcnkuc2F2ZShjYXNlT3duZWQpO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIH1cblxuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuXG4gICAgICAgICAgICAvL1BvaW50c1xuICAgICAgICAgICAgYXdhaXQgdXNlci5jaGFuZ2VQb2ludHModGhpcy5hbW91bnQpO1xuICAgICAgICB9XG5cbiAgICAgICAgYXdhaXQgdXNlclJlcG9zaXRvcnkuc2F2ZSh1c2VyKTtcbiAgICB9XG5cblxufVxuIl19