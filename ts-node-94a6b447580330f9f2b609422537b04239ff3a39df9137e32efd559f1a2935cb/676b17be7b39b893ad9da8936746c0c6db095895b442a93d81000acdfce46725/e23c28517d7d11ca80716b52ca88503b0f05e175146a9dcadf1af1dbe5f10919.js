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
var UserPower_1;
const typeorm_1 = require("typeorm");
const User_1 = require("./User");
const moment = require("moment");
const connection_1 = require("../connection");
exports.powers = [
    {
        name: "double_points",
        description: "Gagne le double de points !",
        time: 60 * 60 * 24 * 7
    },
];
function getPower(name) {
    for (const power of exports.powers) {
        if (power.name === name) {
            return power;
        }
    }
    return false;
}
exports.getPower = getPower;
let UserPower = UserPower_1 = class UserPower extends typeorm_1.BaseEntity {
    expiresTime() {
        if (this.expires instanceof Date) {
            return this.expires;
        }
        else {
            return new Date(this.expires);
        }
    }
    hasExpired() {
        //If not used
        if (this.used || this.expires == null) {
            return false;
        }
        //If expired
        return new Date() > this.expiresTime();
    }
    power() {
        return getPower(this.powerName);
    }
    use() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.hasExpired() || this.used) {
                throw "Power has expired";
            }
            this.used = true;
            this.expires = moment().add(this.power().time, "seconds").toDate();
            yield connection_1.getDBConnection().getRepository(UserPower_1).save(this);
        });
    }
};
__decorate([
    typeorm_1.PrimaryGeneratedColumn(),
    __metadata("design:type", Number)
], UserPower.prototype, "id", void 0);
__decorate([
    typeorm_1.ManyToOne(type => User_1.User, user => user.powers, { cascade: true }),
    typeorm_1.JoinColumn({ name: "userId" }),
    __metadata("design:type", User_1.User)
], UserPower.prototype, "user", void 0);
__decorate([
    typeorm_1.Column(),
    __metadata("design:type", String)
], UserPower.prototype, "powerName", void 0);
__decorate([
    typeorm_1.Column({ default: false }),
    __metadata("design:type", Boolean)
], UserPower.prototype, "used", void 0);
__decorate([
    typeorm_1.Column("datetime", { nullable: true, default: null }),
    __metadata("design:type", Object)
], UserPower.prototype, "expires", void 0);
UserPower = UserPower_1 = __decorate([
    typeorm_1.Entity()
], UserPower);
exports.UserPower = UserPower;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiL1N0cmVhbVJ1bm5lcnMvVHdpdGNoVmlldy9kYXRhYmFzZS9lbnRpdHkvVXNlclBvd2VyLnRzIiwic291cmNlcyI6WyIvU3RyZWFtUnVubmVycy9Ud2l0Y2hWaWV3L2RhdGFiYXNlL2VudGl0eS9Vc2VyUG93ZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQSxxQ0FTaUI7QUFFakIsaUNBQTRCO0FBQzVCLE1BQU0sTUFBTSxHQUFHLE9BQU8sQ0FBQyxRQUFRLENBQUMsQ0FBQztBQUNqQyw4Q0FBOEM7QUFTakMsUUFBQSxNQUFNLEdBQVk7SUFDM0I7UUFDSSxJQUFJLEVBQUUsZUFBZTtRQUNyQixXQUFXLEVBQUUsNkJBQTZCO1FBQzFDLElBQUksRUFBRSxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxDQUFDO0tBQ3pCO0NBQ0osQ0FBQztBQUVGLFNBQWdCLFFBQVEsQ0FBQyxJQUFZO0lBRWpDLEtBQUssTUFBTSxLQUFLLElBQUksY0FBTSxFQUFFO1FBQ3hCLElBQUksS0FBSyxDQUFDLElBQUksS0FBSyxJQUFJLEVBQUU7WUFDckIsT0FBTyxLQUFLLENBQUM7U0FDaEI7S0FDSjtJQUVELE9BQU8sS0FBSyxDQUFDO0FBRWpCLENBQUM7QUFWRCw0QkFVQztBQUlELElBQWEsU0FBUyxpQkFBdEIsTUFBYSxTQUFVLFNBQVEsb0JBQVU7SUFrQnJDLFdBQVc7UUFDUCxJQUFJLElBQUksQ0FBQyxPQUFPLFlBQVksSUFBSSxFQUFFO1lBQzlCLE9BQU8sSUFBSSxDQUFDLE9BQU8sQ0FBQztTQUN2QjthQUNJO1lBQ0QsT0FBTyxJQUFJLElBQUksQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUM7U0FDakM7SUFDTCxDQUFDO0lBRUQsVUFBVTtRQUNOLGFBQWE7UUFDYixJQUFJLElBQUksQ0FBQyxJQUFJLElBQUksSUFBSSxDQUFDLE9BQU8sSUFBSSxJQUFJLEVBQUU7WUFDbkMsT0FBTyxLQUFLLENBQUM7U0FDaEI7UUFFRCxZQUFZO1FBQ1osT0FBTyxJQUFJLElBQUksRUFBRSxHQUFHLElBQUksQ0FBQyxXQUFXLEVBQUUsQ0FBQztJQUczQyxDQUFDO0lBRUQsS0FBSztRQUNELE9BQWMsUUFBUSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQztJQUMzQyxDQUFDO0lBRUssR0FBRzs7WUFFTCxJQUFJLElBQUksQ0FBQyxVQUFVLEVBQUUsSUFBSSxJQUFJLENBQUMsSUFBSSxFQUFFO2dCQUNoQyxNQUFNLG1CQUFtQixDQUFDO2FBQzdCO1lBRUQsSUFBSSxDQUFDLElBQUksR0FBRyxJQUFJLENBQUM7WUFDakIsSUFBSSxDQUFDLE9BQU8sR0FBRyxNQUFNLEVBQUUsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEtBQUssRUFBRSxDQUFDLElBQUksRUFBRSxTQUFTLENBQUMsQ0FBQyxNQUFNLEVBQUUsQ0FBQztZQUVuRSxNQUFNLDRCQUFlLEVBQUUsQ0FBQyxhQUFhLENBQUMsV0FBUyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQ2hFLENBQUM7S0FBQTtDQUNKLENBQUE7QUFuREc7SUFEQyxnQ0FBc0IsRUFBRTs7cUNBQ2Q7QUFJWDtJQUZDLG1CQUFTLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxXQUFJLEVBQUUsSUFBSSxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsTUFBTSxFQUFFLEVBQUMsT0FBTyxFQUFFLElBQUksRUFBQyxDQUFDO0lBQzdELG9CQUFVLENBQUMsRUFBQyxJQUFJLEVBQUUsUUFBUSxFQUFDLENBQUM7OEJBQ3ZCLFdBQUk7dUNBQUM7QUFHWDtJQURDLGdCQUFNLEVBQUU7OzRDQUNTO0FBR2xCO0lBREMsZ0JBQU0sQ0FBQyxFQUFDLE9BQU8sRUFBRSxLQUFLLEVBQUMsQ0FBQzs7dUNBQ1g7QUFHZDtJQURDLGdCQUFNLENBQUMsVUFBVSxFQUFFLEVBQUMsUUFBUSxFQUFFLElBQUksRUFBRSxPQUFPLEVBQUUsSUFBSSxFQUFDLENBQUM7OzBDQUM3QjtBQWhCZCxTQUFTO0lBRHJCLGdCQUFNLEVBQUU7R0FDSSxTQUFTLENBc0RyQjtBQXREWSw4QkFBUyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7XG4gICAgQmFzZUVudGl0eSxcbiAgICBDb2x1bW4sXG4gICAgRW50aXR5LFxuICAgIEpvaW5Db2x1bW4sXG4gICAgSm9pblRhYmxlLFxuICAgIE1hbnlUb01hbnksIE1hbnlUb09uZSxcbiAgICBPbmVUb01hbnksXG4gICAgUHJpbWFyeUdlbmVyYXRlZENvbHVtblxufSBmcm9tIFwidHlwZW9ybVwiO1xuXG5pbXBvcnQge1VzZXJ9IGZyb20gXCIuL1VzZXJcIjtcbmNvbnN0IG1vbWVudCA9IHJlcXVpcmUoXCJtb21lbnRcIik7XG5pbXBvcnQge2dldERCQ29ubmVjdGlvbn0gZnJvbSBcIi4uL2Nvbm5lY3Rpb25cIjtcblxuZXhwb3J0IGludGVyZmFjZSBQb3dlciB7XG4gICAgbmFtZTogc3RyaW5nO1xuICAgIGRlc2NyaXB0aW9uOiBzdHJpbmc7XG4gICAgdGltZTogbnVtYmVyO1xuICAgIGltYWdlPzogc3RyaW5nO1xufVxuXG5leHBvcnQgY29uc3QgcG93ZXJzOiBQb3dlcltdID0gW1xuICAgIHtcbiAgICAgICAgbmFtZTogXCJkb3VibGVfcG9pbnRzXCIsXG4gICAgICAgIGRlc2NyaXB0aW9uOiBcIkdhZ25lIGxlIGRvdWJsZSBkZSBwb2ludHMgIVwiLFxuICAgICAgICB0aW1lOiA2MCAqIDYwICogMjQgKiA3XG4gICAgfSxcbl07XG5cbmV4cG9ydCBmdW5jdGlvbiBnZXRQb3dlcihuYW1lOiBzdHJpbmcpOiBQb3dlciB8IGZhbHNlIHtcblxuICAgIGZvciAoY29uc3QgcG93ZXIgb2YgcG93ZXJzKSB7XG4gICAgICAgIGlmIChwb3dlci5uYW1lID09PSBuYW1lKSB7XG4gICAgICAgICAgICByZXR1cm4gcG93ZXI7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gZmFsc2U7XG5cbn1cblxuXG5ARW50aXR5KClcbmV4cG9ydCBjbGFzcyBVc2VyUG93ZXIgZXh0ZW5kcyBCYXNlRW50aXR5IHtcblxuICAgIEBQcmltYXJ5R2VuZXJhdGVkQ29sdW1uKClcbiAgICBpZDogbnVtYmVyO1xuXG4gICAgQE1hbnlUb09uZSh0eXBlID0+IFVzZXIsIHVzZXIgPT4gdXNlci5wb3dlcnMsIHtjYXNjYWRlOiB0cnVlfSlcbiAgICBASm9pbkNvbHVtbih7bmFtZTogXCJ1c2VySWRcIn0pXG4gICAgdXNlcjogVXNlcjtcblxuICAgIEBDb2x1bW4oKVxuICAgIHBvd2VyTmFtZTogc3RyaW5nO1xuXG4gICAgQENvbHVtbih7ZGVmYXVsdDogZmFsc2V9KVxuICAgIHVzZWQ6IGJvb2xlYW47XG5cbiAgICBAQ29sdW1uKFwiZGF0ZXRpbWVcIiwge251bGxhYmxlOiB0cnVlLCBkZWZhdWx0OiBudWxsfSlcbiAgICBleHBpcmVzOiBEYXRlIHwgbnVtYmVyO1xuXG4gICAgZXhwaXJlc1RpbWUoKTogRGF0ZSB7XG4gICAgICAgIGlmICh0aGlzLmV4cGlyZXMgaW5zdGFuY2VvZiBEYXRlKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5leHBpcmVzO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuIG5ldyBEYXRlKHRoaXMuZXhwaXJlcyk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBoYXNFeHBpcmVkKCk6IGJvb2xlYW4ge1xuICAgICAgICAvL0lmIG5vdCB1c2VkXG4gICAgICAgIGlmICh0aGlzLnVzZWQgfHwgdGhpcy5leHBpcmVzID09IG51bGwpIHtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vSWYgZXhwaXJlZFxuICAgICAgICByZXR1cm4gbmV3IERhdGUoKSA+IHRoaXMuZXhwaXJlc1RpbWUoKTtcblxuXG4gICAgfVxuXG4gICAgcG93ZXIoKTogUG93ZXIge1xuICAgICAgICByZXR1cm4gPFBvd2VyPmdldFBvd2VyKHRoaXMucG93ZXJOYW1lKTtcbiAgICB9XG5cbiAgICBhc3luYyB1c2UoKTogUHJvbWlzZTx2b2lkPiB7XG5cbiAgICAgICAgaWYgKHRoaXMuaGFzRXhwaXJlZCgpIHx8IHRoaXMudXNlZCkge1xuICAgICAgICAgICAgdGhyb3cgXCJQb3dlciBoYXMgZXhwaXJlZFwiO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy51c2VkID0gdHJ1ZTtcbiAgICAgICAgdGhpcy5leHBpcmVzID0gbW9tZW50KCkuYWRkKHRoaXMucG93ZXIoKS50aW1lLCBcInNlY29uZHNcIikudG9EYXRlKCk7XG5cbiAgICAgICAgYXdhaXQgZ2V0REJDb25uZWN0aW9uKCkuZ2V0UmVwb3NpdG9yeShVc2VyUG93ZXIpLnNhdmUodGhpcyk7XG4gICAgfVxufSJdfQ==