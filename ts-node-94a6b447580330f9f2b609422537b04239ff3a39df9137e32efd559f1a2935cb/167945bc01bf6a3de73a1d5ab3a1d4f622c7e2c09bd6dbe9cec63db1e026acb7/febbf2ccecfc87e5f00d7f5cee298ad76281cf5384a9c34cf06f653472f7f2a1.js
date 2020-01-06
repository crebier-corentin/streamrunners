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
var User_1;
Object.defineProperty(exports, "__esModule", { value: true });
const typeorm_1 = require("typeorm");
const StreamQueue_1 = require("./StreamQueue");
const connection_1 = require("../connection");
const Coupon_1 = require("./Coupon");
const CaseOwned_1 = require("./CaseOwned");
const UserPower_1 = require("./UserPower");
const CacheService_1 = require("../../other/CacheService");
const Transaction_1 = require("./Transaction");
const moment = require("moment");
const uuidv4 = require('uuid/v4');
const cache = new CacheService_1.default(120);
let User = User_1 = class User extends typeorm_1.BaseEntity {
    changePoints(amount) {
        return __awaiter(this, void 0, void 0, function* () {
            let repository = connection_1.getDBConnection().getRepository(User_1);
            if (this.points != undefined) {
                this.points = Math.round(this.points + amount);
                yield repository.save(this);
            }
            else {
                this.points = Math.round(amount);
                yield repository.save(this);
            }
        });
    }
    lastUpdateTime() {
        if (this.lastUpdate instanceof Date) {
            return this.lastUpdate;
        }
        else {
            return new Date(this.lastUpdate);
        }
    }
    //Add a power
    addPower(name) {
        return __awaiter(this, void 0, void 0, function* () {
            //Check if power exist
            if (UserPower_1.getPower(name) !== false) {
                //Save Power
                let uPower = connection_1.getDBConnection().getRepository(UserPower_1.UserPower).create();
                uPower.powerName = name;
                uPower.id = 0;
                yield connection_1.getDBConnection().getRepository(UserPower_1.UserPower).save(uPower).catch(e => console.log(e));
                this.powers.push(uPower);
                yield connection_1.getDBConnection().getRepository(User_1).save(this).catch(e => console.log(e));
                // this.powers.push(uPower);
                //await getDBConnection().getRepository(User).save(this).catch(e => console.log(e));
            }
            else {
                throw "Power do not exist";
            }
        });
    }
    //Return current power or false
    currentPower() {
        for (const power of this.powers) {
            if (power.used && !power.hasExpired()) {
                return power;
            }
        }
        return false;
    }
    /*    //Parrain
        @Column({unique: true, default: uuidv4()})
        parrainage_id: string;

        @OneToMany(type => User, User => User.parrain)
        @JoinColumn({referencedColumnName: "parrainage_id"})
        parraine: User[];

        @ManyToOne(type => User, User => User.parraine)
        parrain: User;*/
    static viewers() {
        return __awaiter(this, void 0, void 0, function* () {
            let repository = connection_1.getDBConnection().getRepository(User_1);
            return (yield repository.createQueryBuilder("user")
                .where("user.lastUpdate > :current", { current: moment().subtract(30, "seconds").utc().format("YYYY-MM-DD HH:mm:ss") })
                .getCount());
        });
    }
    static mostPoints() {
        return __awaiter(this, void 0, void 0, function* () {
            const userRepository = connection_1.getDBConnection().getRepository(User_1);
            return yield cache.get("mostPoints", () => __awaiter(this, void 0, void 0, function* () {
                return yield userRepository.createQueryBuilder("user")
                    .select(["user.username", "user.display_name", "user.points"])
                    .orderBy("user.points", "DESC")
                    .limit(10)
                    .getMany();
            }));
        });
    }
    static mostPlace() {
        return __awaiter(this, void 0, void 0, function* () {
            const userRepository = connection_1.getDBConnection().getRepository(User_1);
            return yield cache.get("mostPlace", () => __awaiter(this, void 0, void 0, function* () {
                const users = yield userRepository.createQueryBuilder("user")
                    .leftJoin("user.streamQueue", "queue")
                    .select(["user.username", "user.display_name", "queue.time"])
                    .getMany();
                return users.map((value) => {
                    value['time'] = 0;
                    for (const queue of value.streamQueue) {
                        value['time'] += queue.time;
                    }
                    delete value.streamQueue;
                    return value;
                }).sort((a, b) => {
                    return b['time'] - a['time'];
                })
                    .splice(0, 10);
            }));
        });
    }
};
__decorate([
    typeorm_1.PrimaryGeneratedColumn(),
    __metadata("design:type", Number)
], User.prototype, "id", void 0);
__decorate([
    typeorm_1.Column(),
    __metadata("design:type", String)
], User.prototype, "twitchId", void 0);
__decorate([
    typeorm_1.Column(),
    __metadata("design:type", String)
], User.prototype, "username", void 0);
__decorate([
    typeorm_1.Column(),
    __metadata("design:type", String)
], User.prototype, "display_name", void 0);
__decorate([
    typeorm_1.Column(),
    __metadata("design:type", String)
], User.prototype, "avatar", void 0);
__decorate([
    typeorm_1.Column({ default: 0 }),
    __metadata("design:type", Number)
], User.prototype, "points", void 0);
__decorate([
    typeorm_1.Column({ default: false }),
    __metadata("design:type", Boolean)
], User.prototype, "moderator", void 0);
__decorate([
    typeorm_1.Column("datetime", { default: () => 'CURRENT_TIMESTAMP' }),
    __metadata("design:type", Object)
], User.prototype, "lastUpdate", void 0);
__decorate([
    typeorm_1.OneToMany(type => StreamQueue_1.StreamQueue, StreamQueue => StreamQueue.user, { eager: true }),
    __metadata("design:type", Array)
], User.prototype, "streamQueue", void 0);
__decorate([
    typeorm_1.OneToMany(type => CaseOwned_1.CaseOwned, CaseOwned => CaseOwned.user, { eager: true }),
    __metadata("design:type", Array)
], User.prototype, "cases", void 0);
__decorate([
    typeorm_1.ManyToMany(type => Coupon_1.Coupon, coupon => coupon.users),
    typeorm_1.JoinTable(),
    __metadata("design:type", Array)
], User.prototype, "coupons", void 0);
__decorate([
    typeorm_1.OneToMany(type => UserPower_1.UserPower, power => power.user, { eager: true }),
    __metadata("design:type", Array)
], User.prototype, "powers", void 0);
__decorate([
    typeorm_1.OneToMany(type => Transaction_1.Transaction, transaction => transaction.user, { eager: true }),
    __metadata("design:type", Array)
], User.prototype, "transactions", void 0);
__decorate([
    typeorm_1.Column({ default: false }),
    __metadata("design:type", Boolean)
], User.prototype, "betaBage", void 0);
User = User_1 = __decorate([
    typeorm_1.Entity()
], User);
exports.User = User;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiL1N0cmVhbVJ1bm5lcnMvVHdpdGNoVmlldy9kYXRhYmFzZS9lbnRpdHkvVXNlci50cyIsInNvdXJjZXMiOlsiL1N0cmVhbVJ1bm5lcnMvVHdpdGNoVmlldy9kYXRhYmFzZS9lbnRpdHkvVXNlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQSxxQ0FTaUI7QUFDakIsK0NBQTBDO0FBRTFDLDhDQUE4QztBQUM5QyxxQ0FBZ0M7QUFDaEMsMkNBQXNDO0FBQ3RDLDJDQUErRDtBQUMvRCwyREFBb0Q7QUFDcEQsK0NBQTBDO0FBSTFDLE1BQU0sTUFBTSxHQUFHLE9BQU8sQ0FBQyxRQUFRLENBQUMsQ0FBQztBQUNqQyxNQUFNLE1BQU0sR0FBRyxPQUFPLENBQUMsU0FBUyxDQUFDLENBQUM7QUFFbEMsTUFBTSxLQUFLLEdBQUcsSUFBSSxzQkFBWSxDQUFDLEdBQUcsQ0FBQyxDQUFDO0FBSXBDLElBQWEsSUFBSSxZQUFqQixNQUFhLElBQUssU0FBUSxvQkFBVTtJQW1CMUIsWUFBWSxDQUFDLE1BQWM7O1lBQzdCLElBQUksVUFBVSxHQUFHLDRCQUFlLEVBQUUsQ0FBQyxhQUFhLENBQUMsTUFBSSxDQUFDLENBQUM7WUFFdkQsSUFBSSxJQUFJLENBQUMsTUFBTSxJQUFJLFNBQVMsRUFBRTtnQkFDMUIsSUFBSSxDQUFDLE1BQU0sR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxNQUFNLEdBQUcsTUFBTSxDQUFDLENBQUM7Z0JBQy9DLE1BQU0sVUFBVSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQzthQUMvQjtpQkFDSTtnQkFDRCxJQUFJLENBQUMsTUFBTSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLENBQUM7Z0JBQ2pDLE1BQU0sVUFBVSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQzthQUMvQjtRQUNMLENBQUM7S0FBQTtJQUtELGNBQWM7UUFDVixJQUFJLElBQUksQ0FBQyxVQUFV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Q0ksSUFBSSxDQTZLaEI7QUE3S1ksb0JBQUkiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge1xuICAgIEJhc2VFbnRpdHksXG4gICAgQ29sdW1uLFxuICAgIEVudGl0eSxcbiAgICBKb2luQ29sdW1uLFxuICAgIEpvaW5UYWJsZSxcbiAgICBNYW55VG9NYW55LCBNYW55VG9PbmUsXG4gICAgT25lVG9NYW55LFxuICAgIFByaW1hcnlHZW5lcmF0ZWRDb2x1bW5cbn0gZnJvbSBcInR5cGVvcm1cIjtcbmltcG9ydCB7U3RyZWFtUXVldWV9IGZyb20gXCIuL1N0cmVhbVF1ZXVlXCI7XG5pbXBvcnQge1ZJUH0gZnJvbSBcIi4vVklQXCI7XG5pbXBvcnQge2dldERCQ29ubmVjdGlvbn0gZnJvbSBcIi4uL2Nvbm5lY3Rpb25cIjtcbmltcG9ydCB7Q291cG9ufSBmcm9tIFwiLi9Db3Vwb25cIjtcbmltcG9ydCB7Q2FzZU93bmVkfSBmcm9tIFwiLi9DYXNlT3duZWRcIjtcbmltcG9ydCB7Z2V0UG93ZXIsIFBvd2VyLCBwb3dlcnMsIFVzZXJQb3dlcn0gZnJvbSBcIi4vVXNlclBvd2VyXCI7XG5pbXBvcnQgQ2FjaGVTZXJ2aWNlIGZyb20gXCIuLi8uLi9vdGhlci9DYWNoZVNlcnZpY2VcIjtcbmltcG9ydCB7VHJhbnNhY3Rpb259IGZyb20gXCIuL1RyYW5zYWN0aW9uXCI7XG5pbXBvcnQge1Byb2R1Y3R9IGZyb20gXCIuL1Byb2R1Y3RcIjtcbmltcG9ydCB7Q2xpZW50fSBmcm9tIFwiZGlzY29yZC5qc1wiO1xuXG5jb25zdCBtb21lbnQgPSByZXF1aXJlKFwibW9tZW50XCIpO1xuY29uc3QgdXVpZHY0ID0gcmVxdWlyZSgndXVpZC92NCcpO1xuXG5jb25zdCBjYWNoZSA9IG5ldyBDYWNoZVNlcnZpY2UoMTIwKTtcblxuXG5ARW50aXR5KClcbmV4cG9ydCBjbGFzcyBVc2VyIGV4dGVuZHMgQmFzZUVudGl0eSB7XG5cbiAgICBAUHJpbWFyeUdlbmVyYXRlZENvbHVtbigpXG4gICAgaWQ6IG51bWJlcjtcbiAgICBAQ29sdW1uKClcbiAgICB0d2l0Y2hJZDogc3RyaW5nO1xuICAgIEBDb2x1bW4oKVxuICAgIHVzZXJuYW1lOiBzdHJpbmc7XG4gICAgQENvbHVtbigpXG4gICAgZGlzcGxheV9uYW1lOiBzdHJpbmc7XG4gICAgQENvbHVtbigpXG4gICAgYXZhdGFyOiBzdHJpbmc7XG5cbiAgICBAQ29sdW1uKHtkZWZhdWx0OiAwfSlcbiAgICBwb2ludHM6IG51bWJlcjtcblxuICAgIEBDb2x1bW4oe2RlZmF1bHQ6IGZhbHNlfSlcbiAgICBtb2RlcmF0b3I6IGJvb2xlYW47XG5cbiAgICBhc3luYyBjaGFuZ2VQb2ludHMoYW1vdW50OiBudW1iZXIpIHtcbiAgICAgICAgbGV0IHJlcG9zaXRvcnkgPSBnZXREQkNvbm5lY3Rpb24oKS5nZXRSZXBvc2l0b3J5KFVzZXIpO1xuXG4gICAgICAgIGlmICh0aGlzLnBvaW50cyAhPSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgIHRoaXMucG9pbnRzID0gTWF0aC5yb3VuZCh0aGlzLnBvaW50cyArIGFtb3VudCk7XG4gICAgICAgICAgICBhd2FpdCByZXBvc2l0b3J5LnNhdmUodGhpcyk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICB0aGlzLnBvaW50cyA9IE1hdGgucm91bmQoYW1vdW50KTtcbiAgICAgICAgICAgIGF3YWl0IHJlcG9zaXRvcnkuc2F2ZSh0aGlzKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIEBDb2x1bW4oXCJkYXRldGltZVwiLCB7ZGVmYXVsdDogKCkgPT4gJ0NVUlJFTlRfVElNRVNUQU1QJ30pXG4gICAgbGFzdFVwZGF0ZTogRGF0ZSB8IG51bWJlcjtcblxuICAgIGxhc3RVcGRhdGVUaW1lKCk6IERhdGUge1xuICAgICAgICBpZiAodGhpcy5sYXN0VXBkYXRlIGluc3RhbmNlb2YgRGF0ZSkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMubGFzdFVwZGF0ZTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiBuZXcgRGF0ZSh0aGlzLmxhc3RVcGRhdGUpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgQE9uZVRvTWFueSh0eXBlID0+IFN0cmVhbVF1ZXVlLCBTdHJlYW1RdWV1ZSA9PiBTdHJlYW1RdWV1ZS51c2VyLCB7ZWFnZXI6IHRydWV9KVxuICAgIHN0cmVhbVF1ZXVlOiBTdHJlYW1RdWV1ZVtdO1xuXG4gICAgLyogQE9uZVRvTWFueSh0eXBlID0+IFZJUCwgVklQID0+IFZJUC51c2VyLCB7ZWFnZXI6IHRydWV9KVxuICAgICB2aXA6IFZJUFtdOyovXG5cbiAgICBAT25lVG9NYW55KHR5cGUgPT4gQ2FzZU93bmVkLCBDYXNlT3duZWQgPT4gQ2FzZU93bmVkLnVzZXIsIHtlYWdlcjogdHJ1ZX0pXG4gICAgY2FzZXM6IENhc2VPd25lZFtdO1xuXG4gICAgQE1hbnlUb01hbnkodHlwZSA9PiBDb3Vwb24sIGNvdXBvbiA9PiBjb3Vwb24udXNlcnMpXG4gICAgQEpvaW5UYWJsZSgpXG4gICAgY291cG9uczogQ291cG9uW107XG5cbiAgICAvL1Bvd2Vyc1xuICAgIEBPbmVUb01hbnkodHlwZSA9PiBVc2VyUG93ZXIsIHBvd2VyID0+IHBvd2VyLnVzZXIsIHtlYWdlcjogdHJ1ZX0pXG4gICAgcG93ZXJzOiBVc2VyUG93ZXJbXTtcblxuICAgIC8vQWRkIGEgcG93ZXJcbiAgICBhc3luYyBhZGRQb3dlcihuYW1lOiBzdHJpbmcpOiBQcm9taXNlPHZvaWQ+IHtcblxuICAgICAgICAvL0NoZWNrIGlmIHBvd2VyIGV4aXN0XG4gICAgICAgIGlmIChnZXRQb3dlcihuYW1lKSAhPT0gZmFsc2UpIHtcblxuICAgICAgICAgICAgLy9TYXZlIFBvd2VyXG4gICAgICAgICAgICBsZXQgdVBvd2VyID0gZ2V0REJDb25uZWN0aW9uKCkuZ2V0UmVwb3NpdG9yeShVc2VyUG93ZXIpLmNyZWF0ZSgpO1xuICAgICAgICAgICAgdVBvd2VyLnBvd2VyTmFtZSA9IG5hbWU7XG4gICAgICAgICAgICB1UG93ZXIuaWQgPSAwO1xuXG4gICAgICAgICAgICBhd2FpdCBnZXREQkNvbm5lY3Rpb24oKS5nZXRSZXBvc2l0b3J5KFVzZXJQb3dlcikuc2F2ZSh1UG93ZXIpLmNhdGNoKGUgPT4gY29uc29sZS5sb2coZSkpO1xuXG4gICAgICAgICAgICB0aGlzLnBvd2Vycy5wdXNoKHVQb3dlcik7XG4gICAgICAgICAgICBhd2FpdCBnZXREQkNvbm5lY3Rpb24oKS5nZXRSZXBvc2l0b3J5KFVzZXIpLnNhdmUodGhpcykuY2F0Y2goZSA9PiBjb25zb2xlLmxvZyhlKSk7XG5cblxuICAgICAgICAgICAgLy8gdGhpcy5wb3dlcnMucHVzaCh1UG93ZXIpO1xuICAgICAgICAgICAgLy9hd2FpdCBnZXREQkNvbm5lY3Rpb24oKS5nZXRSZXBvc2l0b3J5KFVzZXIpLnNhdmUodGhpcykuY2F0Y2goZSA9PiBjb25zb2xlLmxvZyhlKSk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICB0aHJvdyBcIlBvd2VyIGRvIG5vdCBleGlzdFwiO1xuICAgICAgICB9XG5cbiAgICB9XG5cbiAgICAvL1JldHVybiBjdXJyZW50IHBvd2VyIG9yIGZhbHNlXG4gICAgY3VycmVudFBvd2VyKCk6IFVzZXJQb3dlciB8IGZhbHNlIHtcblxuICAgICAgICBmb3IgKGNvbnN0IHBvd2VyIG9mIHRoaXMucG93ZXJzKSB7XG4gICAgICAgICAgICBpZiAocG93ZXIudXNlZCAmJiAhcG93ZXIuaGFzRXhwaXJlZCgpKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHBvd2VyO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIEBPbmVUb01hbnkodHlwZSA9PiBUcmFuc2FjdGlvbiwgdHJhbnNhY3Rpb24gPT4gdHJhbnNhY3Rpb24udXNlciwge2VhZ2VyOiB0cnVlfSlcbiAgICB0cmFuc2FjdGlvbnM6IFRyYW5zYWN0aW9uW107XG5cbiAgICBAQ29sdW1uKHtkZWZhdWx0OiBmYWxzZX0pXG4gICAgYmV0YUJhZ2U6IGJvb2xlYW47XG5cblxuICAgIC8qICAgIC8vUGFycmFpblxuICAgICAgICBAQ29sdW1uKHt1bmlxdWU6IHRydWUsIGRlZmF1bHQ6IHV1aWR2NCgpfSlcbiAgICAgICAgcGFycmFpbmFnZV9pZDogc3RyaW5nO1xuXG4gICAgICAgIEBPbmVUb01hbnkodHlwZSA9PiBVc2VyLCBVc2VyID0+IFVzZXIucGFycmFpbilcbiAgICAgICAgQEpvaW5Db2x1bW4oe3JlZmVyZW5jZWRDb2x1bW5OYW1lOiBcInBhcnJhaW5hZ2VfaWRcIn0pXG4gICAgICAgIHBhcnJhaW5lOiBVc2VyW107XG5cbiAgICAgICAgQE1hbnlUb09uZSh0eXBlID0+IFVzZXIsIFVzZXIgPT4gVXNlci5wYXJyYWluZSlcbiAgICAgICAgcGFycmFpbjogVXNlcjsqL1xuXG4gICAgc3RhdGljIGFzeW5jIHZpZXdlcnMoKTogUHJvbWlzZTxudW1iZXI+IHtcbiAgICAgICAgbGV0IHJlcG9zaXRvcnkgPSBnZXREQkNvbm5lY3Rpb24oKS5nZXRSZXBvc2l0b3J5KFVzZXIpO1xuXG4gICAgICAgIHJldHVybiAoYXdhaXQgcmVwb3NpdG9yeS5jcmVhdGVRdWVyeUJ1aWxkZXIoXCJ1c2VyXCIpXG4gICAgICAgICAgICAud2hlcmUoXCJ1c2VyLmxhc3RVcGRhdGUgPiA6Y3VycmVudFwiLCB7Y3VycmVudDogbW9tZW50KCkuc3VidHJhY3QoMzAsIFwic2Vjb25kc1wiKS51dGMoKS5mb3JtYXQoXCJZWVlZLU1NLUREIEhIOm1tOnNzXCIpfSlcbiAgICAgICAgICAgIC5nZXRDb3VudCgpKTtcbiAgICB9XG5cbiAgICBzdGF0aWMgYXN5bmMgbW9zdFBvaW50cygpOiBQcm9taXNlPGFueT4ge1xuXG4gICAgICAgIGNvbnN0IHVzZXJSZXBvc2l0b3J5ID0gZ2V0REJDb25uZWN0aW9uKCkuZ2V0UmVwb3NpdG9yeShVc2VyKTtcblxuICAgICAgICByZXR1cm4gYXdhaXQgY2FjaGUuZ2V0KFwibW9zdFBvaW50c1wiLCBhc3luYyAoKSA9PiB7XG5cbiAgICAgICAgICAgIHJldHVybiBhd2FpdCB1c2VyUmVwb3NpdG9yeS5jcmVhdGVRdWVyeUJ1aWxkZXIoXCJ1c2VyXCIpXG4gICAgICAgICAgICAgICAgLnNlbGVjdChbXCJ1c2VyLnVzZXJuYW1lXCIsIFwidXNlci5kaXNwbGF5X25hbWVcIiwgXCJ1c2VyLnBvaW50c1wiXSlcbiAgICAgICAgICAgICAgICAub3JkZXJCeShcInVzZXIucG9pbnRzXCIsIFwiREVTQ1wiKVxuICAgICAgICAgICAgICAgIC5saW1pdCgxMClcbiAgICAgICAgICAgICAgICAuZ2V0TWFueSgpO1xuXG5cbiAgICAgICAgfSk7XG5cbiAgICB9XG5cbiAgICBzdGF0aWMgYXN5bmMgbW9zdFBsYWNlKCk6IFByb21pc2U8YW55PiB7XG4gICAgICAgIGNvbnN0IHVzZXJSZXBvc2l0b3J5ID0gZ2V0REJDb25uZWN0aW9uKCkuZ2V0UmVwb3NpdG9yeShVc2VyKTtcblxuICAgICAgICByZXR1cm4gYXdhaXQgY2FjaGUuZ2V0KFwibW9zdFBsYWNlXCIsIGFzeW5jICgpID0+IHtcblxuICAgICAgICAgICAgY29uc3QgdXNlcnMgPSBhd2FpdCB1c2VyUmVwb3NpdG9yeS5jcmVhdGVRdWVyeUJ1aWxkZXIoXCJ1c2VyXCIpXG4gICAgICAgICAgICAgICAgLmxlZnRKb2luKFwidXNlci5zdHJlYW1RdWV1ZVwiLCBcInF1ZXVlXCIpXG4gICAgICAgICAgICAgICAgLnNlbGVjdChbXCJ1c2VyLnVzZXJuYW1lXCIsIFwidXNlci5kaXNwbGF5X25hbWVcIiwgXCJxdWV1ZS50aW1lXCJdKVxuICAgICAgICAgICAgICAgIC5nZXRNYW55KCk7XG5cbiAgICAgICAgICAgIHJldHVybiB1c2Vycy5tYXAoKHZhbHVlOiBVc2VyKSA9PiB7XG5cbiAgICAgICAgICAgICAgICB2YWx1ZVsndGltZSddID0gMDtcblxuICAgICAgICAgICAgICAgIGZvciAoY29uc3QgcXVldWUgb2YgdmFsdWUuc3RyZWFtUXVldWUpIHtcbiAgICAgICAgICAgICAgICAgICAgdmFsdWVbJ3RpbWUnXSArPSBxdWV1ZS50aW1lO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGRlbGV0ZSB2YWx1ZS5zdHJlYW1RdWV1ZTtcblxuICAgICAgICAgICAgICAgIHJldHVybiB2YWx1ZTtcblxuICAgICAgICAgICAgfSkuc29ydCgoYSwgYikgPT4ge1xuICAgICAgICAgICAgICAgIHJldHVybiBiWyd0aW1lJ10gLSBhWyd0aW1lJ107XG4gICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgIC5zcGxpY2UoMCwgMTApO1xuXG5cbiAgICAgICAgfSk7XG4gICAgfVxuXG59XG5cblxuZGVjbGFyZSBnbG9iYWwge1xuICAgIG5hbWVzcGFjZSBFeHByZXNzIHtcbiAgICAgICAgaW50ZXJmYWNlIFJlcXVlc3Qge1xuICAgICAgICAgICAgdXNlcj86IFVzZXI7XG4gICAgICAgICAgICBkaXNjb3JkPzogQ2xpZW50O1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgbmFtZXNwYWNlIGUge1xuICAgICAgICBpbnRlcmZhY2UgUmVxdWVzdCB7XG4gICAgICAgICAgICB1c2VyPzogVXNlcjtcbiAgICAgICAgICAgIGRpc2NvcmQ/OiBDbGllbnQ7XG4gICAgICAgIH1cbiAgICB9XG59Il19