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
var StreamQueue_1;
const typeorm_1 = require("typeorm");
const User_1 = require("./User");
const axios_1 = require("axios");
const connection_1 = require("../connection");
let StreamQueue = StreamQueue_1 = class StreamQueue extends typeorm_1.BaseEntity {
    startTime() {
        if (this.start instanceof Date) {
            return this.start;
        }
        else {
            return new Date(this.start);
        }
    }
    //If session has ended
    ended() {
        return this.current >= this.time;
    }
    //Return false if queue is empty
    static currentStream() {
        return __awaiter(this, void 0, void 0, function* () {
            let repository = connection_1.getDBConnection().getRepository(StreamQueue_1);
            return yield repository.createQueryBuilder("queue")
                .leftJoinAndSelect("queue.user", "user")
                .where("queue.current < queue.time")
                .orderBy("queue.createdAt", "ASC")
                .getOne();
        });
    }
    static isCurrentOnline(twitchId) {
        return __awaiter(this, void 0, void 0, function* () {
            let channel = twitchId == undefined ? (yield StreamQueue_1.currentStream()).user.twitchId : twitchId;
            let request = yield axios_1.default.get(`https://api.twitch.tv/kraken/streams/${channel}`, { headers: { "Client-ID": process.env.TWITCH_CLIENT_ID } });
            return request.data.stream !== null;
        });
    }
    static currentAndNextStreams() {
        return __awaiter(this, void 0, void 0, function* () {
            let repository = connection_1.getDBConnection().getRepository(StreamQueue_1);
            return yield repository.createQueryBuilder("queue")
                .select(["queue.time", "queue.current", "queue.id"])
                .leftJoin("queue.user", "user")
                .addSelect(["user.username", "user.avatar", "user.display_name"])
                .where("queue.current < queue.time")
                .orderBy("queue.createdAt", "ASC")
                .getMany();
        });
    }
    static isEmpty() {
        return __awaiter(this, void 0, void 0, function* () {
            let stream = yield StreamQueue_1.currentStream();
            return (stream == undefined);
        });
    }
};
__decorate([
    typeorm_1.PrimaryGeneratedColumn(),
    __metadata("design:type", Number)
], StreamQueue.prototype, "id", void 0);
__decorate([
    typeorm_1.Column({ default: 100 }),
    __metadata("design:type", Number)
], StreamQueue.prototype, "amount", void 0);
__decorate([
    typeorm_1.Column({ default: 60 }),
    __metadata("design:type", Number)
], StreamQueue.prototype, "time", void 0);
__decorate([
    typeorm_1.Column({ default: 0 }),
    __metadata("design:type", Number)
], StreamQueue.prototype, "current", void 0);
__decorate([
    typeorm_1.Column("datetime", { nullable: true, default: null }),
    __metadata("design:type", Object)
], StreamQueue.prototype, "start", void 0);
__decorate([
    typeorm_1.ManyToOne(type => User_1.User, user => user.streamQueue, { cascade: true }),
    __metadata("design:type", User_1.User)
], StreamQueue.prototype, "user", void 0);
__decorate([
    typeorm_1.CreateDateColumn(),
    __metadata("design:type", Date)
], StreamQueue.prototype, "createdAt", void 0);
StreamQueue = StreamQueue_1 = __decorate([
    typeorm_1.Entity()
], StreamQueue);
exports.StreamQueue = StreamQueue;
function updateStreamQueue() {
    return __awaiter(this, void 0, void 0, function* () {
        let repository = connection_1.getDBConnection().getRepository(StreamQueue);
        let currentStream = yield StreamQueue.currentStream();
        //If queue is empty do nothing
        if (currentStream == undefined) {
            return;
        }
        //Start if null
        if (currentStream.start == null) {
            currentStream.start = new Date();
            repository.save(currentStream);
        }
        //Update current
        else {
            let startTime = Math.round(currentStream.startTime().getTime() / 1000);
            currentStream.current = Math.round(new Date().getTime() / 1000) - startTime;
            repository.save(currentStream);
        }
    });
}
exports.updateStreamQueue = updateStreamQueue;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiL1N0cmVhbVJ1bm5lcnMvVHdpdGNoVmlldy9kYXRhYmFzZS9lbnRpdHkvU3RyZWFtUXVldWUudHMiLCJzb3VyY2VzIjpbIi9TdHJlYW1SdW5uZXJzL1R3aXRjaFZpZXcvZGF0YWJhc2UvZW50aXR5L1N0cmVhbVF1ZXVlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQUEscUNBQW9IO0FBQ3BILGlDQUE0QjtBQUM1QixpQ0FBMEI7QUFDMUIsOENBQThDO0FBRzlDLElBQWEsV0FBVyxtQkFBeEIsTUFBYSxXQUFZLFNBQVEsb0JBQVU7SUFtQnZDLFNBQVM7UUFDTCxJQUFJLElBQUksQ0FBQyxLQUFLLFlBQVksSUFBSSxFQUFFO1lBQzVCLE9BQU8sSUFBSSxDQUFDLEtBQUssQ0FBQztTQUNyQjthQUNJO1lBQ0QsT0FBTyxJQUFJLElBQUksQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUM7U0FDL0I7SUFDTCxDQUFDO0lBUUQsc0JBQXNCO0lBQ3RCLEtBQUs7UUFDRCxPQUFPLElBQUksQ0FBQyxPQUFPLElBQUksSUFBSSxDQUFDLElBQUksQ0FBQztJQUNyQyxDQUFDO0lBRUQsZ0NBQWdDO0lBQ2hDLE1BQU0sQ0FBTyxhQUFhOztZQUV0QixJQUFJLFVBQVUsR0FBNEIsNEJBQWUsRUFBRSxDQUFDLGFBQWEsQ0FBQyxhQUFXLENBQUMsQ0FBQztZQUV2RixPQUFPLE1BQU0sVUFBVSxDQUFDLGtCQUFrQixDQUFDLE9BQU8sQ0FBQztpQkFDOUMsaUJBQWlCLENBQUMsWUFBWSxFQUFFLE1BQU0sQ0FBQztpQkFDdkMsS0FBSyxDQUFDLDRCQUE0QixDQUFDO2lCQUNuQyxPQUFPLENBQUMsaUJBQWlCLEVBQUUsS0FBSyxDQUFDO2lCQUNqQyxNQUFNLEVBQUUsQ0FBQztRQUVsQixDQUFDO0tBQUE7SUFFRCxNQUFNLENBQU8sZUFBZSxDQUFDLFFBQWlCOztZQUUxQyxJQUFJLE9BQU8sR0FBRyxRQUFRLElBQUksU0FBUyxDQUFDLENBQUMs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QUFDLENBQUM7WUFFdkUsYUFBYSxDQUFDLE9BQU8sR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksSUFBSSxFQUFFLENBQUMsT0FBTyxFQUFFLEdBQUcsSUFBSSxDQUFDLEdBQUcsU0FBUyxDQUFDO1lBQzVFLFVBQVUsQ0FBQyxJQUFJLENBQUMsYUFBYSxDQUFDLENBQUM7U0FFbEM7SUFFTCxDQUFDO0NBQUE7QUF6QkQsOENBeUJDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtCYXNlRW50aXR5LCBDb2x1bW4sIENyZWF0ZURhdGVDb2x1bW4sIEVudGl0eSwgTWFueVRvT25lLCBQcmltYXJ5R2VuZXJhdGVkQ29sdW1uLCBSZXBvc2l0b3J5fSBmcm9tIFwidHlwZW9ybVwiO1xuaW1wb3J0IHtVc2VyfSBmcm9tIFwiLi9Vc2VyXCI7XG5pbXBvcnQgYXhpb3MgZnJvbSBcImF4aW9zXCI7XG5pbXBvcnQge2dldERCQ29ubmVjdGlvbn0gZnJvbSBcIi4uL2Nvbm5lY3Rpb25cIjtcblxuQEVudGl0eSgpXG5leHBvcnQgY2xhc3MgU3RyZWFtUXVldWUgZXh0ZW5kcyBCYXNlRW50aXR5IHtcblxuICAgIEBQcmltYXJ5R2VuZXJhdGVkQ29sdW1uKClcbiAgICBpZDogbnVtYmVyO1xuXG4gICAgLy9QcmljZSBpbiBwb2ludHNGdW5jXG4gICAgQENvbHVtbih7ZGVmYXVsdDogMTAwfSlcbiAgICBhbW91bnQ6IG51bWJlcjtcblxuICAgIC8vVGltZSBpbiBzZWNvbmRzXG4gICAgQENvbHVtbih7ZGVmYXVsdDogNjB9KVxuICAgIHRpbWU6IG51bWJlcjtcblxuICAgIEBDb2x1bW4oe2RlZmF1bHQ6IDB9KVxuICAgIGN1cnJlbnQ6IG51bWJlcjtcblxuICAgIEBDb2x1bW4oXCJkYXRldGltZVwiLCB7bnVsbGFibGU6IHRydWUsIGRlZmF1bHQ6IG51bGx9KVxuICAgIHN0YXJ0OiBEYXRlIHwgbnVtYmVyO1xuXG4gICAgc3RhcnRUaW1lKCk6IERhdGUge1xuICAgICAgICBpZiAodGhpcy5zdGFydCBpbnN0YW5jZW9mIERhdGUpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLnN0YXJ0O1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuIG5ldyBEYXRlKHRoaXMuc3RhcnQpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgQE1hbnlUb09uZSh0eXBlID0+IFVzZXIsIHVzZXIgPT4gdXNlci5zdHJlYW1RdWV1ZSwge2Nhc2NhZGU6IHRydWV9KVxuICAgIHVzZXI6IFVzZXI7XG5cbiAgICBAQ3JlYXRlRGF0ZUNvbHVtbigpXG4gICAgY3JlYXRlZEF0OiBEYXRlO1xuXG4gICAgLy9JZiBzZXNzaW9uIGhhcyBlbmRlZFxuICAgIGVuZGVkKCk6IGJvb2xlYW4ge1xuICAgICAgICByZXR1cm4gdGhpcy5jdXJyZW50ID49IHRoaXMudGltZTtcbiAgICB9XG5cbiAgICAvL1JldHVybiBmYWxzZSBpZiBxdWV1ZSBpcyBlbXB0eVxuICAgIHN0YXRpYyBhc3luYyBjdXJyZW50U3RyZWFtKCk6IFByb21pc2U8U3RyZWFtUXVldWU+IHtcblxuICAgICAgICBsZXQgcmVwb3NpdG9yeTogUmVwb3NpdG9yeTxTdHJlYW1RdWV1ZT4gPSBnZXREQkNvbm5lY3Rpb24oKS5nZXRSZXBvc2l0b3J5KFN0cmVhbVF1ZXVlKTtcblxuICAgICAgICByZXR1cm4gYXdhaXQgcmVwb3NpdG9yeS5jcmVhdGVRdWVyeUJ1aWxkZXIoXCJxdWV1ZVwiKVxuICAgICAgICAgICAgLmxlZnRKb2luQW5kU2VsZWN0KFwicXVldWUudXNlclwiLCBcInVzZXJcIilcbiAgICAgICAgICAgIC53aGVyZShcInF1ZXVlLmN1cnJlbnQgPCBxdWV1ZS50aW1lXCIpXG4gICAgICAgICAgICAub3JkZXJCeShcInF1ZXVlLmNyZWF0ZWRBdFwiLCBcIkFTQ1wiKVxuICAgICAgICAgICAgLmdldE9uZSgpO1xuXG4gICAgfVxuXG4gICAgc3RhdGljIGFzeW5jIGlzQ3VycmVudE9ubGluZSh0d2l0Y2hJZD86IHN0cmluZyk6IFByb21pc2U8Ym9vbGVhbj4ge1xuXG4gICAgICAgIGxldCBjaGFubmVsID0gdHdpdGNoSWQgPT0gdW5kZWZpbmVkID8gKGF3YWl0IFN0cmVhbVF1ZXVlLmN1cnJlbnRTdHJlYW0oKSkudXNlci50d2l0Y2hJZCA6IHR3aXRjaElkO1xuXG4gICAgICAgIGxldCByZXF1ZXN0ID0gYXdhaXQgYXhpb3MuZ2V0KGBodHRwczovL2FwaS50d2l0Y2gudHYva3Jha2VuL3N0cmVhbXMvJHtjaGFubmVsfWAsIHtoZWFkZXJzOiB7XCJDbGllbnQtSURcIjogcHJvY2Vzcy5lbnYuVFdJVENIX0NMSUVOVF9JRH19KTtcblxuICAgICAgICByZXR1cm4gcmVxdWVzdC5kYXRhLnN0cmVhbSAhPT0gbnVsbDtcblxuICAgIH1cblxuICAgIHN0YXRpYyBhc3luYyBjdXJyZW50QW5kTmV4dFN0cmVhbXMoKTogUHJvbWlzZTxBcnJheTxTdHJlYW1RdWV1ZT4+IHtcblxuICAgICAgICBsZXQgcmVwb3NpdG9yeTogUmVwb3NpdG9yeTxTdHJlYW1RdWV1ZT4gPSBnZXREQkNvbm5lY3Rpb24oKS5nZXRSZXBvc2l0b3J5KFN0cmVhbVF1ZXVlKTtcblxuICAgICAgICByZXR1cm4gYXdhaXQgcmVwb3NpdG9yeS5jcmVhdGVRdWVyeUJ1aWxkZXIoXCJxdWV1ZVwiKVxuICAgICAgICAgICAgLnNlbGVjdChbXCJxdWV1ZS50aW1lXCIsIFwicXVldWUuY3VycmVudFwiLCBcInF1ZXVlLmlkXCJdKVxuICAgICAgICAgICAgLmxlZnRKb2luKFwicXVldWUudXNlclwiLCBcInVzZXJcIilcbiAgICAgICAgICAgIC5hZGRTZWxlY3QoW1widXNlci51c2VybmFtZVwiLCBcInVzZXIuYXZhdGFyXCIsIFwidXNlci5kaXNwbGF5X25hbWVcIl0pXG4gICAgICAgICAgICAud2hlcmUoXCJxdWV1ZS5jdXJyZW50IDwgcXVldWUudGltZVwiKVxuICAgICAgICAgICAgLm9yZGVyQnkoXCJxdWV1ZS5jcmVhdGVkQXRcIiwgXCJBU0NcIilcbiAgICAgICAgICAgIC5nZXRNYW55KCk7XG5cbiAgICB9XG5cbiAgICBzdGF0aWMgYXN5bmMgaXNFbXB0eSgpOiBQcm9taXNlPGJvb2xlYW4+IHtcblxuICAgICAgICBsZXQgc3RyZWFtID0gYXdhaXQgU3RyZWFtUXVldWUuY3VycmVudFN0cmVhbSgpO1xuXG4gICAgICAgIHJldHVybiAoc3RyZWFtID09IHVuZGVmaW5lZCk7XG5cbiAgICB9XG5cblxufVxuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gdXBkYXRlU3RyZWFtUXVldWUoKSB7XG5cbiAgICBsZXQgcmVwb3NpdG9yeTogUmVwb3NpdG9yeTxTdHJlYW1RdWV1ZT4gPSBnZXREQkNvbm5lY3Rpb24oKS5nZXRSZXBvc2l0b3J5KFN0cmVhbVF1ZXVlKTtcblxuICAgIGxldCBjdXJyZW50U3RyZWFtID0gYXdhaXQgU3RyZWFtUXVldWUuY3VycmVudFN0cmVhbSgpO1xuXG4gICAgLy9JZiBxdWV1ZSBpcyBlbXB0eSBkbyBub3RoaW5nXG4gICAgaWYgKGN1cnJlbnRTdHJlYW0gPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICAvL1N0YXJ0IGlmIG51bGxcbiAgICBpZiAoY3VycmVudFN0cmVhbS5zdGFydCA9PSBudWxsKSB7XG4gICAgICAgIGN1cnJlbnRTdHJlYW0uc3RhcnQgPSBuZXcgRGF0ZSgpO1xuICAgICAgICByZXBvc2l0b3J5LnNhdmUoY3VycmVudFN0cmVhbSk7XG4gICAgfVxuICAgIC8vVXBkYXRlIGN1cnJlbnRcbiAgICBlbHNlIHtcbiAgICAgICAgbGV0IHN0YXJ0VGltZSA9IE1hdGgucm91bmQoY3VycmVudFN0cmVhbS5zdGFydFRpbWUoKS5nZXRUaW1lKCkgLyAxMDAwKTtcblxuICAgICAgICBjdXJyZW50U3RyZWFtLmN1cnJlbnQgPSBNYXRoLnJvdW5kKG5ldyBEYXRlKCkuZ2V0VGltZSgpIC8gMTAwMCkgLSBzdGFydFRpbWU7XG4gICAgICAgIHJlcG9zaXRvcnkuc2F2ZShjdXJyZW50U3RyZWFtKTtcblxuICAgIH1cblxufVxuIl19