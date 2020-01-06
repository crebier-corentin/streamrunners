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
Object.defineProperty(exports, "__esModule", { value: true });
const typeorm_1 = require("typeorm");
const User_1 = require("./User");
const CaseContent_1 = require("./CaseContent");
const Case_1 = require("./Case");
const SteamKey_1 = require("./SteamKey");
let CaseOwned = class CaseOwned extends typeorm_1.BaseEntity {
    get steamKey() {
        return this.relationSteamKey[0];
    }
    set steamKey(newValue) {
        this.relationSteamKey[0] = newValue;
    }
    isOpened() {
        return this.content != null;
    }
};
__decorate([
    typeorm_1.PrimaryGeneratedColumn(),
    __metadata("design:type", Number)
], CaseOwned.prototype, "id", void 0);
__decorate([
    typeorm_1.Column({ unique: true }),
    __metadata("design:type", String)
], CaseOwned.prototype, "uuid", void 0);
__decorate([
    typeorm_1.ManyToOne(type => User_1.User, user => user.cases, { nullable: true }),
    __metadata("design:type", User_1.User)
], CaseOwned.prototype, "user", void 0);
__decorate([
    typeorm_1.ManyToOne(type => Case_1.Case, Case => Case.caseOwned, { cascade: true, eager: true }),
    __metadata("design:type", Case_1.Case)
], CaseOwned.prototype, "case", void 0);
__decorate([
    typeorm_1.ManyToOne(type => CaseContent_1.CaseContent, CaseContent => CaseContent.caseOwned, { cascade: true, eager: true, nullable: true }),
    __metadata("design:type", CaseContent_1.CaseContent)
], CaseOwned.prototype, "content", void 0);
__decorate([
    typeorm_1.OneToMany(type => SteamKey_1.SteamKey, steamKey => steamKey.caseOwned, { nullable: true, eager: true, cascade: true }),
    __metadata("design:type", Array)
], CaseOwned.prototype, "relationSteamKey", void 0);
__decorate([
    typeorm_1.CreateDateColumn(),
    __metadata("design:type", Date)
], CaseOwned.prototype, "createdAt", void 0);
CaseOwned = __decorate([
    typeorm_1.Entity()
], CaseOwned);
exports.CaseOwned = CaseOwned;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiL1N0cmVhbVJ1bm5lcnMvVHdpdGNoVmlldy9kYXRhYmFzZS9lbnRpdHkvQ2FzZU93bmVkLnRzIiwic291cmNlcyI6WyIvU3RyZWFtUnVubmVycy9Ud2l0Y2hWaWV3L2RhdGFiYXNlL2VudGl0eS9DYXNlT3duZWQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7QUFBQSxxQ0FTaUI7QUFDakIsaUNBQTRCO0FBQzVCLCtDQUEwQztBQUMxQyxpQ0FBNEI7QUFFNUIseUNBQW9DO0FBR3BDLElBQWEsU0FBUyxHQUF0QixNQUFhLFNBQVUsU0FBUSxvQkFBVTtJQW9CckMsSUFBSSxRQUFRO1FBQ1IsT0FBTyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFDcEMsQ0FBQztJQUVELElBQUksUUFBUSxDQUFDLFFBQVE7UUFDakIsSUFBSSxDQUFDLGdCQUFnQixDQUFDLENBQUMsQ0FBQyxHQUFHLFFBQVEsQ0FBQztJQUN4QyxDQUFDO0lBS0QsUUFBUTtRQUNKLE9BQU8sSUFBSSxDQUFDLE9BQU8sSUFBSSxJQUFJLENBQUM7SUFDaEMsQ0FBQztDQUdKLENBQUE7QUFqQ0c7SUFEQyxnQ0FBc0IsRUFBRTs7cUNBQ2Q7QUFHWDtJQURDLGdCQUFNLENBQUMsRUFBQyxNQUFNLEVBQUUsSUFBSSxFQUFDLENBQUM7O3VDQUNWO0FBR2I7SUFEQyxtQkFBUyxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsV0FBSSxFQUFFLElBQUksQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLEtBQUssRUFBRSxFQUFDLFFBQVEsRUFBRSxJQUFJLEVBQUMsQ0FBQzs4QkFDeEQsV0FBSTt1Q0FBQztBQUdYO0lBREMsbUJBQVMsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLFdBQUksRUFBRSxJQUFJLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxTQUFTLEVBQUUsRUFBQyxPQUFPLEVBQUUsSUFBSSxFQUFFLEtBQUssRUFBRSxJQUFJLEVBQUMsQ0FBQzs4QkFDeEUsV0FBSTt1Q0FBQztBQUdYO0lBREMsbUJBQVMsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLHlCQUFXLEVBQUUsV0FBVyxDQUFDLEVBQUUsQ0FBQyxXQUFXLENBQUMsU0FBUyxFQUFFLEVBQUMsT0FBTyxFQUFFLElBQUksRUFBRSxLQUFLLEVBQUUsSUFBSSxFQUFFLFFBQVEsRUFBRSxJQUFJLEVBQUMsQ0FBQzs4QkFDMUcseUJBQVc7MENBQUM7QUFHckI7SUFEQyxtQkFBUyxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsbUJBQVEsRUFBRSxRQUFRLENBQUMsRUFBRSxDQUFDLFFBQVEsQ0FBQyxTQUFTLEVBQUUsRUFBQyxRQUFRLEVBQUUsSUFBSSxFQUFFLEtBQUssRUFBRSxJQUFJLEVBQUUsT0FBTyxFQUFFLElBQUksRUFBQyxDQUFDOzttREFDN0U7QUFXN0I7SUFEQywwQkFBZ0IsRUFBRTs4QkFDUixJQUFJOzRDQUFDO0FBN0JQLFNBQVM7SUFEckIsZ0JBQU0sRUFBRTtHQUNJLFNBQVMsQ0FvQ3JCO0FBcENZLDhCQUFTIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtcbiAgICBCYXNlRW50aXR5LFxuICAgIENvbHVtbiwgQ3JlYXRlRGF0ZUNvbHVtbixcbiAgICBFbnRpdHksXG4gICAgSm9pbkNvbHVtbixcbiAgICBNYW55VG9NYW55LFxuICAgIE1hbnlUb09uZSxcbiAgICBPbmVUb01hbnksIE9uZVRvT25lLFxuICAgIFByaW1hcnlHZW5lcmF0ZWRDb2x1bW5cbn0gZnJvbSBcInR5cGVvcm1cIjtcbmltcG9ydCB7VXNlcn0gZnJvbSBcIi4vVXNlclwiO1xuaW1wb3J0IHtDYXNlQ29udGVudH0gZnJvbSBcIi4vQ2FzZUNvbnRlbnRcIjtcbmltcG9ydCB7Q2FzZX0gZnJvbSBcIi4vQ2FzZVwiO1xuaW1wb3J0IHtyYW5kb21TdHJpbmd9IGZyb20gXCIuLi9jb25uZWN0aW9uXCI7XG5pbXBvcnQge1N0ZWFtS2V5fSBmcm9tIFwiLi9TdGVhbUtleVwiO1xuXG5ARW50aXR5KClcbmV4cG9ydCBjbGFzcyBDYXNlT3duZWQgZXh0ZW5kcyBCYXNlRW50aXR5IHtcblxuICAgIEBQcmltYXJ5R2VuZXJhdGVkQ29sdW1uKClcbiAgICBpZDogbnVtYmVyO1xuXG4gICAgQENvbHVtbih7dW5pcXVlOiB0cnVlfSlcbiAgICB1dWlkOiBzdHJpbmc7XG5cbiAgICBATWFueVRvT25lKHR5cGUgPT4gVXNlciwgdXNlciA9PiB1c2VyLmNhc2VzLCB7bnVsbGFibGU6IHRydWV9KVxuICAgIHVzZXI6IFVzZXI7XG5cbiAgICBATWFueVRvT25lKHR5cGUgPT4gQ2FzZSwgQ2FzZSA9PiBDYXNlLmNhc2VPd25lZCwge2Nhc2NhZGU6IHRydWUsIGVhZ2VyOiB0cnVlfSlcbiAgICBjYXNlOiBDYXNlO1xuXG4gICAgQE1hbnlUb09uZSh0eXBlID0+IENhc2VDb250ZW50LCBDYXNlQ29udGVudCA9PiBDYXNlQ29udGVudC5jYXNlT3duZWQsIHtjYXNjYWRlOiB0cnVlLCBlYWdlcjogdHJ1ZSwgbnVsbGFibGU6IHRydWV9KVxuICAgIGNvbnRlbnQ6IENhc2VDb250ZW50O1xuXG4gICAgQE9uZVRvTWFueSh0eXBlID0+IFN0ZWFtS2V5LCBzdGVhbUtleSA9PiBzdGVhbUtleS5jYXNlT3duZWQsIHtudWxsYWJsZTogdHJ1ZSwgZWFnZXI6IHRydWUsIGNhc2NhZGU6IHRydWV9KVxuICAgIHJlbGF0aW9uU3RlYW1LZXk6IFN0ZWFtS2V5W107XG5cbiAgICBnZXQgc3RlYW1LZXkoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnJlbGF0aW9uU3RlYW1LZXlbMF07XG4gICAgfVxuXG4gICAgc2V0IHN0ZWFtS2V5KG5ld1ZhbHVlKSB7XG4gICAgICAgIHRoaXMucmVsYXRpb25TdGVhbUtleVswXSA9IG5ld1ZhbHVlO1xuICAgIH1cblxuICAgIEBDcmVhdGVEYXRlQ29sdW1uKClcbiAgICBjcmVhdGVkQXQ6IERhdGU7XG5cbiAgICBpc09wZW5lZCgpIDogYm9vbGVhbiB7XG4gICAgICAgIHJldHVybiB0aGlzLmNvbnRlbnQgIT0gbnVsbDtcbiAgICB9XG5cblxufVxuIl19