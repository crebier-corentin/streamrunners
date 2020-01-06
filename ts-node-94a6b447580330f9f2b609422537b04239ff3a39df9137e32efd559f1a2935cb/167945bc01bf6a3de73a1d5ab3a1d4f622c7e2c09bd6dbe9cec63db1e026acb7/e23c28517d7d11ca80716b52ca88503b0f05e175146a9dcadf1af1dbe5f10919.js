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
var UserPower_1;
Object.defineProperty(exports, "__esModule", { value: true });
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiL1N0cmVhbVJ1bm5lcnMvVHdpdGNoVmlldy9kYXRhYmFzZS9lbnRpdHkvVXNlclBvd2VyLnRzIiwic291cmNlcyI6WyIvU3RyZWFtUnVubmVycy9Ud2l0Y2hWaWV3L2RhdGFiYXNlL2VudGl0eS9Vc2VyUG93ZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQUEscUNBU2lCO0FBRWpCLGlDQUE0QjtBQUM1QixNQUFNLE1BQU0sR0FBRyxPQUFPLENBQUMsUUFBUSxDQUFDLENBQUM7QUFDakMsOENBQThDO0FBU2pDLFFBQUEsTUFBTSxHQUFZO0lBQzNCO1FBQ0ksSUFBSSxFQUFFLGVBQWU7UUFDckIsV0FBVyxFQUFFLDZCQUE2QjtRQUMxQyxJQUFJLEVBQUUsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsQ0FBQztLQUN6QjtDQUNKLENBQUM7QUFFRixTQUFnQixRQUFRLENBQUMsSUFBWTtJQUVqQyxLQUFLLE1BQU0sS0FBSyxJQUFJLGNBQU0sRUFBRTtRQUN4QixJQUFJLEtBQUssQ0FBQyxJQUFJLEtBQUssSUFBSSxFQUFFO1lBQ3JCLE9BQU8sS0FBSyxDQUFDO1NBQ2hCO0tBQ0o7SUFFRCxPQUFPLEtBQUssQ0FBQztBQUVqQixDQUFDO0FBVkQsNEJBVUM7QUFJRCxJQUFhLFNBQVMsaUJBQXRCLE1BQWEsU0FBVSxTQUFRLG9CQUFVO0lBa0JyQyxXQUFXO1FBQ1AsSUFBSSxJQUFJLENBQUMsT0FBTyxZQUFZLElBQUksRUFBRTtZQUM5QixPQUFPLElBQUksQ0FBQyxPQUFPLENBQUM7U0FDdkI7YUFDSTtZQUNELE9BQU8sSUFBSSxJQUFJLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDO1NBQ2pDO0lBQ0wsQ0FBQztJQUVELFVBQVU7UUFDTixhQUFhO1FBQ2IsSUFBSSxJQUFJLENBQUMsSUFBSSxJQUFJLElBQUksQ0FBQyxPQUFPLElBQUksSUFBSSxFQUFFO1lBQ25DLE9BQU8sS0FBSyxDQUFDO1NBQ2hCO1FBRUQsWUFBWTtRQUNaLE9BQU8sSUFBSSxJQUFJLEVBQUUsR0FBRyxJQUFJLENBQUMsV0FBVyxFQUFFLENBQUM7SUFHM0MsQ0FBQztJQUVELEtBQUs7UUFDRCxPQUFjLFFBQVEsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUM7SUFDM0MsQ0FBQztJQUVLLEdBQUc7O1lBRUwsSUFBSSxJQUFJLENBQUMsVUFBVSxFQUFFLElBQUksSUFBSSxDQUFDLElBQUksRUFBRTtnQkFDaEMsTUFBTSxtQkFBbUIsQ0FBQzthQUM3QjtZQUVELElBQUksQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDO1lBQ2pCLElBQUksQ0FBQyxPQUFPLEdBQUcsTUFBTSxFQUFFLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxLQUFLLEVBQUUsQ0FBQyxJQUFJLEVBQUUsU0FBUyxDQUFDLENBQUMsTUFBTSxFQUFFLENBQUM7WUFFbkUsTUFBTSw0QkFBZSxFQUFFLENBQUMsYUFBYSxDQUFDLFdBQVMsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUNoRSxDQUFDO0tBQUE7Q0FDSixDQUFBO0FBbkRHO0lBREMsZ0NBQXNCLEVBQUU7O3FDQUNkO0FBSVg7SUFGQyxtQkFBUyxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsV0FBSSxFQUFFLElBQUksQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRSxFQUFDLE9BQU8sRUFBRSxJQUFJLEVBQUMsQ0FBQztJQUM3RCxvQkFBVSxDQUFDLEVBQUMsSUFBSSxFQUFFLFFBQVEsRUFBQyxDQUFDOzhCQUN2QixXQUFJO3VDQUFDO0FBR1g7SUFEQyxnQkFBTSxFQUFFOzs0Q0FDUztBQUdsQjtJQURDLGdCQUFNLENBQUMsRUFBQyxPQUFPLEVBQUUsS0FBSyxFQUFDLENBQUM7O3VDQUNYO0FBR2Q7SUFEQyxnQkFBTSxDQUFDLFVBQVUsRUFBRSxFQUFDLFFBQVEsRUFBRSxJQUFJLEVBQUUsT0FBTyxFQUFFLElBQUksRUFBQyxDQUFDOzswQ0FDN0I7QUFoQmQsU0FBUztJQURyQixnQkFBTSxFQUFFO0dBQ0ksU0FBUyxDQXNEckI7QUF0RFksOEJBQVMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge1xuICAgIEJhc2VFbnRpdHksXG4gICAgQ29sdW1uLFxuICAgIEVudGl0eSxcbiAgICBKb2luQ29sdW1uLFxuICAgIEpvaW5UYWJsZSxcbiAgICBNYW55VG9NYW55LCBNYW55VG9PbmUsXG4gICAgT25lVG9NYW55LFxuICAgIFByaW1hcnlHZW5lcmF0ZWRDb2x1bW5cbn0gZnJvbSBcInR5cGVvcm1cIjtcblxuaW1wb3J0IHtVc2VyfSBmcm9tIFwiLi9Vc2VyXCI7XG5jb25zdCBtb21lbnQgPSByZXF1aXJlKFwibW9tZW50XCIpO1xuaW1wb3J0IHtnZXREQkNvbm5lY3Rpb259IGZyb20gXCIuLi9jb25uZWN0aW9uXCI7XG5cbmV4cG9ydCBpbnRlcmZhY2UgUG93ZXIge1xuICAgIG5hbWU6IHN0cmluZztcbiAgICBkZXNjcmlwdGlvbjogc3RyaW5nO1xuICAgIHRpbWU6IG51bWJlcjtcbiAgICBpbWFnZT86IHN0cmluZztcbn1cblxuZXhwb3J0IGNvbnN0IHBvd2VyczogUG93ZXJbXSA9IFtcbiAgICB7XG4gICAgICAgIG5hbWU6IFwiZG91YmxlX3BvaW50c1wiLFxuICAgICAgICBkZXNjcmlwdGlvbjogXCJHYWduZSBsZSBkb3VibGUgZGUgcG9pbnRzICFcIixcbiAgICAgICAgdGltZTogNjAgKiA2MCAqIDI0ICogN1xuICAgIH0sXG5dO1xuXG5leHBvcnQgZnVuY3Rpb24gZ2V0UG93ZXIobmFtZTogc3RyaW5nKTogUG93ZXIgfCBmYWxzZSB7XG5cbiAgICBmb3IgKGNvbnN0IHBvd2VyIG9mIHBvd2Vycykge1xuICAgICAgICBpZiAocG93ZXIubmFtZSA9PT0gbmFtZSkge1xuICAgICAgICAgICAgcmV0dXJuIHBvd2VyO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIGZhbHNlO1xuXG59XG5cblxuQEVudGl0eSgpXG5leHBvcnQgY2xhc3MgVXNlclBvd2VyIGV4dGVuZHMgQmFzZUVudGl0eSB7XG5cbiAgICBAUHJpbWFyeUdlbmVyYXRlZENvbHVtbigpXG4gICAgaWQ6IG51bWJlcjtcblxuICAgIEBNYW55VG9PbmUodHlwZSA9PiBVc2VyLCB1c2VyID0+IHVzZXIucG93ZXJzLCB7Y2FzY2FkZTogdHJ1ZX0pXG4gICAgQEpvaW5Db2x1bW4oe25hbWU6IFwidXNlcklkXCJ9KVxuICAgIHVzZXI6IFVzZXI7XG5cbiAgICBAQ29sdW1uKClcbiAgICBwb3dlck5hbWU6IHN0cmluZztcblxuICAgIEBDb2x1bW4oe2RlZmF1bHQ6IGZhbHNlfSlcbiAgICB1c2VkOiBib29sZWFuO1xuXG4gICAgQENvbHVtbihcImRhdGV0aW1lXCIsIHtudWxsYWJsZTogdHJ1ZSwgZGVmYXVsdDogbnVsbH0pXG4gICAgZXhwaXJlczogRGF0ZSB8IG51bWJlcjtcblxuICAgIGV4cGlyZXNUaW1lKCk6IERhdGUge1xuICAgICAgICBpZiAodGhpcy5leHBpcmVzIGluc3RhbmNlb2YgRGF0ZSkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuZXhwaXJlcztcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiBuZXcgRGF0ZSh0aGlzLmV4cGlyZXMpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgaGFzRXhwaXJlZCgpOiBib29sZWFuIHtcbiAgICAgICAgLy9JZiBub3QgdXNlZFxuICAgICAgICBpZiAodGhpcy51c2VkIHx8IHRoaXMuZXhwaXJlcyA9PSBudWxsKSB7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cblxuICAgICAgICAvL0lmIGV4cGlyZWRcbiAgICAgICAgcmV0dXJuIG5ldyBEYXRlKCkgPiB0aGlzLmV4cGlyZXNUaW1lKCk7XG5cblxuICAgIH1cblxuICAgIHBvd2VyKCk6IFBvd2VyIHtcbiAgICAgICAgcmV0dXJuIDxQb3dlcj5nZXRQb3dlcih0aGlzLnBvd2VyTmFtZSk7XG4gICAgfVxuXG4gICAgYXN5bmMgdXNlKCk6IFByb21pc2U8dm9pZD4ge1xuXG4gICAgICAgIGlmICh0aGlzLmhhc0V4cGlyZWQoKSB8fCB0aGlzLnVzZWQpIHtcbiAgICAgICAgICAgIHRocm93IFwiUG93ZXIgaGFzIGV4cGlyZWRcIjtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMudXNlZCA9IHRydWU7XG4gICAgICAgIHRoaXMuZXhwaXJlcyA9IG1vbWVudCgpLmFkZCh0aGlzLnBvd2VyKCkudGltZSwgXCJzZWNvbmRzXCIpLnRvRGF0ZSgpO1xuXG4gICAgICAgIGF3YWl0IGdldERCQ29ubmVjdGlvbigpLmdldFJlcG9zaXRvcnkoVXNlclBvd2VyKS5zYXZlKHRoaXMpO1xuICAgIH1cbn0iXX0=