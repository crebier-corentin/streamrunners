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
let Coupon = class Coupon extends typeorm_1.BaseEntity {
    expiresTime() {
        if (this.expires instanceof Date) {
            return this.expires;
        }
        else {
            return new Date(this.expires);
        }
    }
    isValid() {
        //Is not expired and used less than max
        return this.expiresTime() > new Date() && this.users.length < this.max;
    }
};
__decorate([
    typeorm_1.PrimaryGeneratedColumn(),
    __metadata("design:type", Number)
], Coupon.prototype, "id", void 0);
__decorate([
    typeorm_1.Column({ unique: true }),
    __metadata("design:type", String)
], Coupon.prototype, "name", void 0);
__decorate([
    typeorm_1.Column(),
    __metadata("design:type", Number)
], Coupon.prototype, "amount", void 0);
__decorate([
    typeorm_1.Column(),
    __metadata("design:type", Number)
], Coupon.prototype, "max", void 0);
__decorate([
    typeorm_1.Column("datetime"),
    __metadata("design:type", Object)
], Coupon.prototype, "expires", void 0);
__decorate([
    typeorm_1.ManyToMany(type => User_1.User, user => user.coupons, { cascade: true }),
    __metadata("design:type", Array)
], Coupon.prototype, "users", void 0);
Coupon = __decorate([
    typeorm_1.Entity()
], Coupon);
exports.Coupon = Coupon;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiL1N0cmVhbVJ1bm5lcnMvVHdpdGNoVmlldy9kYXRhYmFzZS9lbnRpdHkvQ291cG9uLnRzIiwic291cmNlcyI6WyIvU3RyZWFtUnVubmVycy9Ud2l0Y2hWaWV3L2RhdGFiYXNlL2VudGl0eS9Db3Vwb24udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7QUFBQSxxQ0FBOEc7QUFDOUcsaUNBQTRCO0FBRzVCLElBQWEsTUFBTSxHQUFuQixNQUFhLE1BQU8sU0FBUSxvQkFBVTtJQWlCbEMsV0FBVztRQUNQLElBQUksSUFBSSxDQUFDLE9BQU8sWUFBWSxJQUFJLEVBQUU7WUFDOUIsT0FBTyxJQUFJLENBQUMsT0FBTyxDQUFDO1NBQ3ZCO2FBQ0k7WUFDRCxPQUFPLElBQUksSUFBSSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQztTQUNqQztJQUNMLENBQUM7SUFLRCxPQUFPO1FBQ0gsdUNBQXVDO1FBQ3ZDLE9BQU8sSUFBSSxDQUFDLFdBQVcsRUFBRSxHQUFHLElBQUksSUFBSSxFQUFFLElBQUksSUFBSSxDQUFDLEtBQUssQ0FBQyxNQUFNLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQztJQUUzRSxDQUFDO0NBR0osQ0FBQTtBQWpDRztJQURDLGdDQUFzQixFQUFFOztrQ0FDZDtBQUdYO0lBREMsZ0JBQU0sQ0FBQyxFQUFDLE1BQU0sRUFBRSxJQUFJLEVBQUMsQ0FBQzs7b0NBQ1Y7QUFHYjtJQURDLGdCQUFNLEVBQUU7O3NDQUNNO0FBR2Y7SUFEQyxnQkFBTSxFQUFFOzttQ0FDRztBQUdaO0lBREMsZ0JBQU0sQ0FBQyxVQUFVLENBQUM7O3VDQUNJO0FBWXZCO0lBREMsb0JBQVUsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLFdBQUksRUFBRSxJQUFJLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxPQUFPLEVBQUUsRUFBQyxPQUFPLEVBQUUsSUFBSSxFQUFDLENBQUM7O3FDQUNsRDtBQTNCTCxNQUFNO0lBRGxCLGdCQUFNLEVBQUU7R0FDSSxNQUFNLENBb0NsQjtBQXBDWSx3QkFBTSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7QmFzZUVudGl0eSwgQ29sdW1uLCBFbnRpdHksIEpvaW5Db2x1bW4sIE1hbnlUb01hbnksIE9uZVRvTWFueSwgUHJpbWFyeUdlbmVyYXRlZENvbHVtbn0gZnJvbSBcInR5cGVvcm1cIjtcbmltcG9ydCB7VXNlcn0gZnJvbSBcIi4vVXNlclwiO1xuXG5ARW50aXR5KClcbmV4cG9ydCBjbGFzcyBDb3Vwb24gZXh0ZW5kcyBCYXNlRW50aXR5IHtcblxuICAgIEBQcmltYXJ5R2VuZXJhdGVkQ29sdW1uKClcbiAgICBpZDogbnVtYmVyO1xuXG4gICAgQENvbHVtbih7dW5pcXVlOiB0cnVlfSlcbiAgICBuYW1lOiBzdHJpbmc7XG5cbiAgICBAQ29sdW1uKClcbiAgICBhbW91bnQ6IG51bWJlcjtcblxuICAgIEBDb2x1bW4oKVxuICAgIG1heDogbnVtYmVyO1xuXG4gICAgQENvbHVtbihcImRhdGV0aW1lXCIpXG4gICAgZXhwaXJlczogRGF0ZSB8IG51bWJlcjtcblxuICAgIGV4cGlyZXNUaW1lKCk6IERhdGUge1xuICAgICAgICBpZiAodGhpcy5leHBpcmVzIGluc3RhbmNlb2YgRGF0ZSkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuZXhwaXJlcztcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiBuZXcgRGF0ZSh0aGlzLmV4cGlyZXMpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgQE1hbnlUb01hbnkodHlwZSA9PiBVc2VyLCB1c2VyID0+IHVzZXIuY291cG9ucywge2Nhc2NhZGU6IHRydWV9KVxuICAgIHVzZXJzOiBVc2VyW107XG5cbiAgICBpc1ZhbGlkKCk6IGJvb2xlYW4ge1xuICAgICAgICAvL0lzIG5vdCBleHBpcmVkIGFuZCB1c2VkIGxlc3MgdGhhbiBtYXhcbiAgICAgICAgcmV0dXJuIHRoaXMuZXhwaXJlc1RpbWUoKSA+IG5ldyBEYXRlKCkgJiYgdGhpcy51c2Vycy5sZW5ndGggPCB0aGlzLm1heDtcblxuICAgIH1cblxuXG59XG4iXX0=