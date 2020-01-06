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
const moment = require("moment");
let VIP = class VIP extends typeorm_1.BaseEntity {
    startTime() {
        if (this.start instanceof Date) {
            return this.start;
        }
        else {
            return new Date(this.start);
        }
    }
    lastTime() {
        if (this.last instanceof Date) {
            return this.last;
        }
        else {
            return new Date(this.last);
        }
    }
};
__decorate([
    typeorm_1.PrimaryGeneratedColumn(),
    __metadata("design:type", Number)
], VIP.prototype, "id", void 0);
__decorate([
    typeorm_1.Column("datetime", { default: () => 'CURRENT_TIMESTAMP' }),
    __metadata("design:type", Object)
], VIP.prototype, "start", void 0);
__decorate([
    typeorm_1.Column("datetime", { default: () => 'CURRENT_TIMESTAMP' }),
    __metadata("design:type", Object)
], VIP.prototype, "last", void 0);
__decorate([
    typeorm_1.ManyToOne(type => User_1.User, { onDelete: "CASCADE" }),
    __metadata("design:type", User_1.User)
], VIP.prototype, "user", void 0);
VIP = __decorate([
    typeorm_1.Entity()
], VIP);
exports.VIP = VIP;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiL1N0cmVhbVJ1bm5lcnMvVHdpdGNoVmlldy9kYXRhYmFzZS9lbnRpdHkvVklQLnRzIiwic291cmNlcyI6WyIvU3RyZWFtUnVubmVycy9Ud2l0Y2hWaWV3L2RhdGFiYXNlL2VudGl0eS9WSVAudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7QUFBQSxxQ0FBb0g7QUFDcEgsaUNBQTRCO0FBRzVCLE1BQU0sTUFBTSxHQUFHLE9BQU8sQ0FBQyxRQUFRLENBQUMsQ0FBQztBQUdqQyxJQUFhLEdBQUcsR0FBaEIsTUFBYSxHQUFJLFNBQVEsb0JBQVU7SUFXL0IsU0FBUztRQUNMLElBQUksSUFBSSxDQUFDLEtBQUssWUFBWSxJQUFJLEVBQUU7WUFDNUIsT0FBTyxJQUFJLENBQUMsS0FBSyxDQUFDO1NBQ3JCO2FBQ0k7WUFDRCxPQUFPLElBQUksSUFBSSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQztTQUMvQjtJQUNMLENBQUM7SUFFRCxRQUFRO1FBQ0osSUFBSSxJQUFJLENBQUMsSUFBSSxZQUFZLElBQUksRUFBRTtZQUMzQixPQUFPLElBQUksQ0FBQyxJQUFJLENBQUM7U0FDcEI7YUFDSTtZQUNELE9BQU8sSUFBSSxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO1NBQzlCO0lBQ0wsQ0FBQztDQU1KLENBQUE7QUE5Qkc7SUFEQyxnQ0FBc0IsRUFBRTs7K0JBQ2Q7QUFHWDtJQURDLGdCQUFNLENBQUMsVUFBVSxFQUFFLEVBQUMsT0FBTyxFQUFFLEdBQUcsRUFBRSxDQUFDLG1CQUFtQixFQUFDLENBQUM7O2tDQUNwQztBQUdyQjtJQURDLGdCQUFNLENBQUMsVUFBVSxFQUFFLEVBQUMsT0FBTyxFQUFFLEdBQUcsRUFBRSxDQUFDLG1CQUFtQixFQUFDLENBQUM7O2lDQUNyQztBQXFCcEI7SUFEQyxtQkFBUyxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsV0FBSSxFQUFFLEVBQUMsUUFBUSxFQUFFLFNBQVMsRUFBQyxDQUFDOzhCQUN6QyxXQUFJO2lDQUFDO0FBOUJGLEdBQUc7SUFEZixnQkFBTSxFQUFFO0dBQ0ksR0FBRyxDQWlDZjtBQWpDWSxrQkFBRyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7QmFzZUVudGl0eSwgQ29sdW1uLCBDcmVhdGVEYXRlQ29sdW1uLCBFbnRpdHksIE1hbnlUb09uZSwgUHJpbWFyeUdlbmVyYXRlZENvbHVtbiwgUmVwb3NpdG9yeX0gZnJvbSBcInR5cGVvcm1cIjtcbmltcG9ydCB7VXNlcn0gZnJvbSBcIi4vVXNlclwiO1xuaW1wb3J0IHtTdHJlYW1RdWV1ZX0gZnJvbSBcIi4vU3RyZWFtUXVldWVcIjtcbmltcG9ydCB7Z2V0REJDb25uZWN0aW9ufSBmcm9tIFwiLi4vY29ubmVjdGlvblwiO1xuY29uc3QgbW9tZW50ID0gcmVxdWlyZShcIm1vbWVudFwiKTtcblxuQEVudGl0eSgpXG5leHBvcnQgY2xhc3MgVklQIGV4dGVuZHMgQmFzZUVudGl0eSB7XG5cbiAgICBAUHJpbWFyeUdlbmVyYXRlZENvbHVtbigpXG4gICAgaWQ6IG51bWJlcjtcblxuICAgIEBDb2x1bW4oXCJkYXRldGltZVwiLCB7ZGVmYXVsdDogKCkgPT4gJ0NVUlJFTlRfVElNRVNUQU1QJ30pXG4gICAgc3RhcnQ6IERhdGUgfCBudW1iZXI7XG5cbiAgICBAQ29sdW1uKFwiZGF0ZXRpbWVcIiwge2RlZmF1bHQ6ICgpID0+ICdDVVJSRU5UX1RJTUVTVEFNUCd9KVxuICAgIGxhc3Q6IERhdGUgfCBudW1iZXI7XG5cbiAgICBzdGFydFRpbWUoKTogRGF0ZSB7XG4gICAgICAgIGlmICh0aGlzLnN0YXJ0IGluc3RhbmNlb2YgRGF0ZSkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuc3RhcnQ7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICByZXR1cm4gbmV3IERhdGUodGhpcy5zdGFydCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBsYXN0VGltZSgpOiBEYXRlIHtcbiAgICAgICAgaWYgKHRoaXMubGFzdCBpbnN0YW5jZW9mIERhdGUpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmxhc3Q7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICByZXR1cm4gbmV3IERhdGUodGhpcy5sYXN0KTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIEBNYW55VG9PbmUodHlwZSA9PiBVc2VyLCB7b25EZWxldGU6IFwiQ0FTQ0FERVwifSlcbiAgICB1c2VyOiBVc2VyO1xuXG5cbn1cblxuIl19