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
var User_1;
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
], User.prototype, "email", void 0);
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiL1N0cmVhbVJ1bm5lcnMvVHdpdGNoVmlldy9kYXRhYmFzZS9lbnRpdHkvVXNlci50cyIsInNvdXJjZXMiOlsiL1N0cmVhbVJ1bm5lcnMvVHdpdGNoVmlldy9kYXRhYmFzZS9lbnRpdHkvVXNlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBLHFDQVNpQjtBQUNqQiwrQ0FBMEM7QUFFMUMsOENBQThDO0FBQzlDLHFDQUFnQztBQUNoQywyQ0FBc0M7QUFDdEMsMkNBQStEO0FBQy9ELDJEQUFvRDtBQUNwRCwrQ0FBMEM7QUFJMUMsTUFBTSxNQUFNLEdBQUcsT0FBTyxDQUFDLFFBQVEsQ0FBQyxDQUFDO0FBQ2pDLE1BQU0sTUFBTSxHQUFHLE9BQU8sQ0FBQyxTQUFTLENBQUMsQ0FBQztBQUVsQyxNQUFNLEtBQUssR0FBRyxJQUFJLHNCQUFZLENBQUMsR0FBRyxDQUFDLENBQUM7QUFJcEMsSUFBYSxJQUFJLFlBQWpCLE1BQWEsSUFBSyxTQUFRLG9CQUFVO0lBcUIxQixZQUFZLENBQUMsTUFBYzs7WUFDN0IsSUFBSSxVQUFVLEdBQUcsNEJBQWUsRUFBRSxDQUFDLGFBQWEsQ0FBQyxNQUFJLENBQUMsQ0FBQztZQUV2RCxJQUFJLElBQUksQ0FBQyxNQUFNLElBQUksU0FBUyxFQUFFO2dCQUMxQixJQUFJLENBQUMsTUFBTSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLE1BQU0sR0FBRyxNQUFNLENBQUMsQ0FBQztnQkFDL0MsTUFBTSxVQUFVLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO2FBQy9CO2lCQUNJO2dCQUNELElBQUksQ0FBQyxNQUFNLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsQ0FBQztnQkFDakMsTUFBTSxVQUFVLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO2FBQy9CO1FBQ0wsQ0FBQztLQUFBO0lBS0QsY0FBYztRQUNWLElBQUksSUFBSSxDQUFDLFVBQVUs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R1QsSUFBSTtJQURoQixnQkFBTSxFQUFFO0dBQ0ksSUFBSSxDQStLaEI7QUEvS1ksb0JBQUkiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge1xuICAgIEJhc2VFbnRpdHksXG4gICAgQ29sdW1uLFxuICAgIEVudGl0eSxcbiAgICBKb2luQ29sdW1uLFxuICAgIEpvaW5UYWJsZSxcbiAgICBNYW55VG9NYW55LCBNYW55VG9PbmUsXG4gICAgT25lVG9NYW55LFxuICAgIFByaW1hcnlHZW5lcmF0ZWRDb2x1bW5cbn0gZnJvbSBcInR5cGVvcm1cIjtcbmltcG9ydCB7U3RyZWFtUXVldWV9IGZyb20gXCIuL1N0cmVhbVF1ZXVlXCI7XG5pbXBvcnQge1ZJUH0gZnJvbSBcIi4vVklQXCI7XG5pbXBvcnQge2dldERCQ29ubmVjdGlvbn0gZnJvbSBcIi4uL2Nvbm5lY3Rpb25cIjtcbmltcG9ydCB7Q291cG9ufSBmcm9tIFwiLi9Db3Vwb25cIjtcbmltcG9ydCB7Q2FzZU93bmVkfSBmcm9tIFwiLi9DYXNlT3duZWRcIjtcbmltcG9ydCB7Z2V0UG93ZXIsIFBvd2VyLCBwb3dlcnMsIFVzZXJQb3dlcn0gZnJvbSBcIi4vVXNlclBvd2VyXCI7XG5pbXBvcnQgQ2FjaGVTZXJ2aWNlIGZyb20gXCIuLi8uLi9vdGhlci9DYWNoZVNlcnZpY2VcIjtcbmltcG9ydCB7VHJhbnNhY3Rpb259IGZyb20gXCIuL1RyYW5zYWN0aW9uXCI7XG5pbXBvcnQge1Byb2R1Y3R9IGZyb20gXCIuL1Byb2R1Y3RcIjtcbmltcG9ydCB7Q2xpZW50fSBmcm9tIFwiZGlzY29yZC5qc1wiO1xuXG5jb25zdCBtb21lbnQgPSByZXF1aXJlKFwibW9tZW50XCIpO1xuY29uc3QgdXVpZHY0ID0gcmVxdWlyZSgndXVpZC92NCcpO1xuXG5jb25zdCBjYWNoZSA9IG5ldyBDYWNoZVNlcnZpY2UoMTIwKTtcblxuXG5ARW50aXR5KClcbmV4cG9ydCBjbGFzcyBVc2VyIGV4dGVuZHMgQmFzZUVudGl0eSB7XG5cbiAgICBAUHJpbWFyeUdlbmVyYXRlZENvbHVtbigpXG4gICAgaWQ6IG51bWJlcjtcbiAgICBAQ29sdW1uKClcbiAgICB0d2l0Y2hJZDogc3RyaW5nO1xuICAgIEBDb2x1bW4oKVxuICAgIHVzZXJuYW1lOiBzdHJpbmc7XG4gICAgQENvbHVtbigpXG4gICAgZGlzcGxheV9uYW1lOiBzdHJpbmc7XG4gICAgQENvbHVtbigpXG4gICAgZW1haWw6IHN0cmluZztcbiAgICBAQ29sdW1uKClcbiAgICBhdmF0YXI6IHN0cmluZztcblxuICAgIEBDb2x1bW4oe2RlZmF1bHQ6IDB9KVxuICAgIHBvaW50czogbnVtYmVyO1xuXG4gICAgQENvbHVtbih7ZGVmYXVsdDogZmFsc2V9KVxuICAgIG1vZGVyYXRvcjogYm9vbGVhbjtcblxuICAgIGFzeW5jIGNoYW5nZVBvaW50cyhhbW91bnQ6IG51bWJlcikge1xuICAgICAgICBsZXQgcmVwb3NpdG9yeSA9IGdldERCQ29ubmVjdGlvbigpLmdldFJlcG9zaXRvcnkoVXNlcik7XG5cbiAgICAgICAgaWYgKHRoaXMucG9pbnRzICE9IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgdGhpcy5wb2ludHMgPSBNYXRoLnJvdW5kKHRoaXMucG9pbnRzICsgYW1vdW50KTtcbiAgICAgICAgICAgIGF3YWl0IHJlcG9zaXRvcnkuc2F2ZSh0aGlzKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMucG9pbnRzID0gTWF0aC5yb3VuZChhbW91bnQpO1xuICAgICAgICAgICAgYXdhaXQgcmVwb3NpdG9yeS5zYXZlKHRoaXMpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgQENvbHVtbihcImRhdGV0aW1lXCIsIHtkZWZhdWx0OiAoKSA9PiAnQ1VSUkVOVF9USU1FU1RBTVAnfSlcbiAgICBsYXN0VXBkYXRlOiBEYXRlIHwgbnVtYmVyO1xuXG4gICAgbGFzdFVwZGF0ZVRpbWUoKTogRGF0ZSB7XG4gICAgICAgIGlmICh0aGlzLmxhc3RVcGRhdGUgaW5zdGFuY2VvZiBEYXRlKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5sYXN0VXBkYXRlO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuIG5ldyBEYXRlKHRoaXMubGFzdFVwZGF0ZSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBAT25lVG9NYW55KHR5cGUgPT4gU3RyZWFtUXVldWUsIFN0cmVhbVF1ZXVlID0+IFN0cmVhbVF1ZXVlLnVzZXIsIHtlYWdlcjogdHJ1ZX0pXG4gICAgc3RyZWFtUXVldWU6IFN0cmVhbVF1ZXVlW107XG5cbiAgICAvKiBAT25lVG9NYW55KHR5cGUgPT4gVklQLCBWSVAgPT4gVklQLnVzZXIsIHtlYWdlcjogdHJ1ZX0pXG4gICAgIHZpcDogVklQW107Ki9cblxuICAgIEBPbmVUb01hbnkodHlwZSA9PiBDYXNlT3duZWQsIENhc2VPd25lZCA9PiBDYXNlT3duZWQudXNlciwge2VhZ2VyOiB0cnVlfSlcbiAgICBjYXNlczogQ2FzZU93bmVkW107XG5cbiAgICBATWFueVRvTWFueSh0eXBlID0+IENvdXBvbiwgY291cG9uID0+IGNvdXBvbi51c2VycylcbiAgICBASm9pblRhYmxlKClcbiAgICBjb3Vwb25zOiBDb3Vwb25bXTtcblxuICAgIC8vUG93ZXJzXG4gICAgQE9uZVRvTWFueSh0eXBlID0+IFVzZXJQb3dlciwgcG93ZXIgPT4gcG93ZXIudXNlciwge2VhZ2VyOiB0cnVlfSlcbiAgICBwb3dlcnM6IFVzZXJQb3dlcltdO1xuXG4gICAgLy9BZGQgYSBwb3dlclxuICAgIGFzeW5jIGFkZFBvd2VyKG5hbWU6IHN0cmluZyk6IFByb21pc2U8dm9pZD4ge1xuXG4gICAgICAgIC8vQ2hlY2sgaWYgcG93ZXIgZXhpc3RcbiAgICAgICAgaWYgKGdldFBvd2VyKG5hbWUpICE9PSBmYWxzZSkge1xuXG4gICAgICAgICAgICAvL1NhdmUgUG93ZXJcbiAgICAgICAgICAgIGxldCB1UG93ZXIgPSBnZXREQkNvbm5lY3Rpb24oKS5nZXRSZXBvc2l0b3J5KFVzZXJQb3dlcikuY3JlYXRlKCk7XG4gICAgICAgICAgICB1UG93ZXIucG93ZXJOYW1lID0gbmFtZTtcbiAgICAgICAgICAgIHVQb3dlci5pZCA9IDA7XG5cbiAgICAgICAgICAgIGF3YWl0IGdldERCQ29ubmVjdGlvbigpLmdldFJlcG9zaXRvcnkoVXNlclBvd2VyKS5zYXZlKHVQb3dlcikuY2F0Y2goZSA9PiBjb25zb2xlLmxvZyhlKSk7XG5cbiAgICAgICAgICAgIHRoaXMucG93ZXJzLnB1c2godVBvd2VyKTtcbiAgICAgICAgICAgIGF3YWl0IGdldERCQ29ubmVjdGlvbigpLmdldFJlcG9zaXRvcnkoVXNlcikuc2F2ZSh0aGlzKS5jYXRjaChlID0+IGNvbnNvbGUubG9nKGUpKTtcblxuXG4gICAgICAgICAgICAvLyB0aGlzLnBvd2Vycy5wdXNoKHVQb3dlcik7XG4gICAgICAgICAgICAvL2F3YWl0IGdldERCQ29ubmVjdGlvbigpLmdldFJlcG9zaXRvcnkoVXNlcikuc2F2ZSh0aGlzKS5jYXRjaChlID0+IGNvbnNvbGUubG9nKGUpKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIHRocm93IFwiUG93ZXIgZG8gbm90IGV4aXN0XCI7XG4gICAgICAgIH1cblxuICAgIH1cblxuICAgIC8vUmV0dXJuIGN1cnJlbnQgcG93ZXIgb3IgZmFsc2VcbiAgICBjdXJyZW50UG93ZXIoKTogVXNlclBvd2VyIHwgZmFsc2Uge1xuXG4gICAgICAgIGZvciAoY29uc3QgcG93ZXIgb2YgdGhpcy5wb3dlcnMpIHtcbiAgICAgICAgICAgIGlmIChwb3dlci51c2VkICYmICFwb3dlci5oYXNFeHBpcmVkKCkpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gcG93ZXI7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgQE9uZVRvTWFueSh0eXBlID0+IFRyYW5zYWN0aW9uLCB0cmFuc2FjdGlvbiA9PiB0cmFuc2FjdGlvbi51c2VyLCB7ZWFnZXI6IHRydWV9KVxuICAgIHRyYW5zYWN0aW9uczogVHJhbnNhY3Rpb25bXTtcblxuICAgIEBDb2x1bW4oe2RlZmF1bHQ6IGZhbHNlfSlcbiAgICBiZXRhQmFnZTogYm9vbGVhbjtcblxuXG4gICAgLyogICAgLy9QYXJyYWluXG4gICAgICAgIEBDb2x1bW4oe3VuaXF1ZTogdHJ1ZSwgZGVmYXVsdDogdXVpZHY0KCl9KVxuICAgICAgICBwYXJyYWluYWdlX2lkOiBzdHJpbmc7XG5cbiAgICAgICAgQE9uZVRvTWFueSh0eXBlID0+IFVzZXIsIFVzZXIgPT4gVXNlci5wYXJyYWluKVxuICAgICAgICBASm9pbkNvbHVtbih7cmVmZXJlbmNlZENvbHVtbk5hbWU6IFwicGFycmFpbmFnZV9pZFwifSlcbiAgICAgICAgcGFycmFpbmU6IFVzZXJbXTtcblxuICAgICAgICBATWFueVRvT25lKHR5cGUgPT4gVXNlciwgVXNlciA9PiBVc2VyLnBhcnJhaW5lKVxuICAgICAgICBwYXJyYWluOiBVc2VyOyovXG5cbiAgICBzdGF0aWMgYXN5bmMgdmlld2VycygpOiBQcm9taXNlPG51bWJlcj4ge1xuICAgICAgICBsZXQgcmVwb3NpdG9yeSA9IGdldERCQ29ubmVjdGlvbigpLmdldFJlcG9zaXRvcnkoVXNlcik7XG5cbiAgICAgICAgcmV0dXJuIChhd2FpdCByZXBvc2l0b3J5LmNyZWF0ZVF1ZXJ5QnVpbGRlcihcInVzZXJcIilcbiAgICAgICAgICAgIC53aGVyZShcInVzZXIubGFzdFVwZGF0ZSA+IDpjdXJyZW50XCIsIHtjdXJyZW50OiBtb21lbnQoKS5zdWJ0cmFjdCgzMCwgXCJzZWNvbmRzXCIpLnV0YygpLmZvcm1hdChcIllZWVktTU0tREQgSEg6bW06c3NcIil9KVxuICAgICAgICAgICAgLmdldENvdW50KCkpO1xuICAgIH1cblxuICAgIHN0YXRpYyBhc3luYyBtb3N0UG9pbnRzKCk6IFByb21pc2U8YW55PiB7XG5cbiAgICAgICAgY29uc3QgdXNlclJlcG9zaXRvcnkgPSBnZXREQkNvbm5lY3Rpb24oKS5nZXRSZXBvc2l0b3J5KFVzZXIpO1xuXG4gICAgICAgIHJldHVybiBhd2FpdCBjYWNoZS5nZXQoXCJtb3N0UG9pbnRzXCIsIGFzeW5jICgpID0+IHtcblxuICAgICAgICAgICAgcmV0dXJuIGF3YWl0IHVzZXJSZXBvc2l0b3J5LmNyZWF0ZVF1ZXJ5QnVpbGRlcihcInVzZXJcIilcbiAgICAgICAgICAgICAgICAuc2VsZWN0KFtcInVzZXIudXNlcm5hbWVcIiwgXCJ1c2VyLmRpc3BsYXlfbmFtZVwiLCBcInVzZXIucG9pbnRzXCJdKVxuICAgICAgICAgICAgICAgIC5vcmRlckJ5KFwidXNlci5wb2ludHNcIiwgXCJERVNDXCIpXG4gICAgICAgICAgICAgICAgLmxpbWl0KDEwKVxuICAgICAgICAgICAgICAgIC5nZXRNYW55KCk7XG5cblxuICAgICAgICB9KTtcblxuICAgIH1cblxuICAgIHN0YXRpYyBhc3luYyBtb3N0UGxhY2UoKTogUHJvbWlzZTxhbnk+IHtcbiAgICAgICAgY29uc3QgdXNlclJlcG9zaXRvcnkgPSBnZXREQkNvbm5lY3Rpb24oKS5nZXRSZXBvc2l0b3J5KFVzZXIpO1xuXG4gICAgICAgIHJldHVybiBhd2FpdCBjYWNoZS5nZXQoXCJtb3N0UGxhY2VcIiwgYXN5bmMgKCkgPT4ge1xuXG4gICAgICAgICAgICBjb25zdCB1c2VycyA9IGF3YWl0IHVzZXJSZXBvc2l0b3J5LmNyZWF0ZVF1ZXJ5QnVpbGRlcihcInVzZXJcIilcbiAgICAgICAgICAgICAgICAubGVmdEpvaW4oXCJ1c2VyLnN0cmVhbVF1ZXVlXCIsIFwicXVldWVcIilcbiAgICAgICAgICAgICAgICAuc2VsZWN0KFtcInVzZXIudXNlcm5hbWVcIiwgXCJ1c2VyLmRpc3BsYXlfbmFtZVwiLCBcInF1ZXVlLnRpbWVcIl0pXG4gICAgICAgICAgICAgICAgLmdldE1hbnkoKTtcblxuICAgICAgICAgICAgcmV0dXJuIHVzZXJzLm1hcCgodmFsdWU6IFVzZXIpID0+IHtcblxuICAgICAgICAgICAgICAgIHZhbHVlWyd0aW1lJ10gPSAwO1xuXG4gICAgICAgICAgICAgICAgZm9yIChjb25zdCBxdWV1ZSBvZiB2YWx1ZS5zdHJlYW1RdWV1ZSkge1xuICAgICAgICAgICAgICAgICAgICB2YWx1ZVsndGltZSddICs9IHF1ZXVlLnRpbWU7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgZGVsZXRlIHZhbHVlLnN0cmVhbVF1ZXVlO1xuXG4gICAgICAgICAgICAgICAgcmV0dXJuIHZhbHVlO1xuXG4gICAgICAgICAgICB9KS5zb3J0KChhLCBiKSA9PiB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGJbJ3RpbWUnXSAtIGFbJ3RpbWUnXTtcbiAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgLnNwbGljZSgwLCAxMCk7XG5cblxuICAgICAgICB9KTtcbiAgICB9XG5cbn1cblxuXG5kZWNsYXJlIGdsb2JhbCB7XG4gICAgbmFtZXNwYWNlIEV4cHJlc3Mge1xuICAgICAgICBpbnRlcmZhY2UgUmVxdWVzdCB7XG4gICAgICAgICAgICB1c2VyPzogVXNlcjtcbiAgICAgICAgICAgIGRpc2NvcmQ/OiBDbGllbnQ7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBuYW1lc3BhY2UgZSB7XG4gICAgICAgIGludGVyZmFjZSBSZXF1ZXN0IHtcbiAgICAgICAgICAgIHVzZXI/OiBVc2VyO1xuICAgICAgICAgICAgZGlzY29yZD86IENsaWVudDtcbiAgICAgICAgfVxuICAgIH1cbn0iXX0=