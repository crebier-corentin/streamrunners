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
            console.log(`https://api.twitch.tv/kraken/streams/${channel}`);
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiL1N0cmVhbVJ1bm5lcnMvVHdpdGNoVmlldy9kYXRhYmFzZS9lbnRpdHkvU3RyZWFtUXVldWUudHMiLCJzb3VyY2VzIjpbIi9TdHJlYW1SdW5uZXJzL1R3aXRjaFZpZXcvZGF0YWJhc2UvZW50aXR5L1N0cmVhbVF1ZXVlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQUEscUNBQW9IO0FBQ3BILGlDQUE0QjtBQUM1QixpQ0FBMEI7QUFDMUIsOENBQThDO0FBRzlDLElBQWEsV0FBVyxtQkFBeEIsTUFBYSxXQUFZLFNBQVEsb0JBQVU7SUFtQnZDLFNBQVM7UUFDTCxJQUFJLElBQUksQ0FBQyxLQUFLLFlBQVksSUFBSSxFQUFFO1lBQzVCLE9BQU8sSUFBSSxDQUFDLEtBQUssQ0FBQztTQUNyQjthQUNJO1lBQ0QsT0FBTyxJQUFJLElBQUksQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUM7U0FDL0I7SUFDTCxDQUFDO0lBUUQsc0JBQXNCO0lBQ3RCLEtBQUs7UUFDRCxPQUFPLElBQUksQ0FBQyxPQUFPLElBQUksSUFBSSxDQUFDLElBQUksQ0FBQztJQUNyQyxDQUFDO0lBRUQsZ0NBQWdDO0lBQ2hDLE1BQU0sQ0FBTyxhQUFhOztZQUV0QixJQUFJLFVBQVUsR0FBNEIsNEJBQWUsRUFBRSxDQUFDLGFBQWEsQ0FBQyxhQUFXLENBQUMsQ0FBQztZQUV2RixPQUFPLE1BQU0sVUFBVSxDQUFDLGtCQUFrQixDQUFDLE9BQU8sQ0FBQztpQkFDOUMsaUJBQWlCLENBQUMsWUFBWSxFQUFFLE1BQU0sQ0FBQztpQkFDdkMsS0FBSyxDQUFDLDRCQUE0QixDQUFDO2lCQUNuQyxPQUFPLENBQUMsaUJBQWlCLEVBQUUsS0FBSyxDQUFDO2lCQUNqQyxNQUFNLEVBQUUsQ0FBQztRQUVsQixDQUFDO0tBQUE7SUFFRCxNQUFNLENBQU8sZUFBZSxDQUFDLFFBQWlCOztZQUUxQyxJQUFJLE9BQU8sR0FBRyxRQUFRLElBQUksU0FBUyxDQUFDLENBQUMs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SyxDQUFDLGFBQWEsQ0FBQyxTQUFTLEVBQUUsQ0FBQyxPQUFPLEVBQUUsR0FBRyxJQUFJLENBQUMsQ0FBQztZQUV2RSxhQUFhLENBQUMsT0FBTyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxJQUFJLEVBQUUsQ0FBQyxPQUFPLEVBQUUsR0FBRyxJQUFJLENBQUMsR0FBRyxTQUFTLENBQUM7WUFDNUUsVUFBVSxDQUFDLElBQUksQ0FBQyxhQUFhLENBQUMsQ0FBQztTQUVsQztJQUVMLENBQUM7Q0FBQTtBQXpCRCw4Q0F5QkMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge0Jhc2VFbnRpdHksIENvbHVtbiwgQ3JlYXRlRGF0ZUNvbHVtbiwgRW50aXR5LCBNYW55VG9PbmUsIFByaW1hcnlHZW5lcmF0ZWRDb2x1bW4sIFJlcG9zaXRvcnl9IGZyb20gXCJ0eXBlb3JtXCI7XG5pbXBvcnQge1VzZXJ9IGZyb20gXCIuL1VzZXJcIjtcbmltcG9ydCBheGlvcyBmcm9tIFwiYXhpb3NcIjtcbmltcG9ydCB7Z2V0REJDb25uZWN0aW9ufSBmcm9tIFwiLi4vY29ubmVjdGlvblwiO1xuXG5ARW50aXR5KClcbmV4cG9ydCBjbGFzcyBTdHJlYW1RdWV1ZSBleHRlbmRzIEJhc2VFbnRpdHkge1xuXG4gICAgQFByaW1hcnlHZW5lcmF0ZWRDb2x1bW4oKVxuICAgIGlkOiBudW1iZXI7XG5cbiAgICAvL1ByaWNlIGluIHBvaW50c0Z1bmNcbiAgICBAQ29sdW1uKHtkZWZhdWx0OiAxMDB9KVxuICAgIGFtb3VudDogbnVtYmVyO1xuXG4gICAgLy9UaW1lIGluIHNlY29uZHNcbiAgICBAQ29sdW1uKHtkZWZhdWx0OiA2MH0pXG4gICAgdGltZTogbnVtYmVyO1xuXG4gICAgQENvbHVtbih7ZGVmYXVsdDogMH0pXG4gICAgY3VycmVudDogbnVtYmVyO1xuXG4gICAgQENvbHVtbihcImRhdGV0aW1lXCIsIHtudWxsYWJsZTogdHJ1ZSwgZGVmYXVsdDogbnVsbH0pXG4gICAgc3RhcnQ6IERhdGUgfCBudW1iZXI7XG5cbiAgICBzdGFydFRpbWUoKTogRGF0ZSB7XG4gICAgICAgIGlmICh0aGlzLnN0YXJ0IGluc3RhbmNlb2YgRGF0ZSkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuc3RhcnQ7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICByZXR1cm4gbmV3IERhdGUodGhpcy5zdGFydCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBATWFueVRvT25lKHR5cGUgPT4gVXNlciwgdXNlciA9PiB1c2VyLnN0cmVhbVF1ZXVlLCB7Y2FzY2FkZTogdHJ1ZX0pXG4gICAgdXNlcjogVXNlcjtcblxuICAgIEBDcmVhdGVEYXRlQ29sdW1uKClcbiAgICBjcmVhdGVkQXQ6IERhdGU7XG5cbiAgICAvL0lmIHNlc3Npb24gaGFzIGVuZGVkXG4gICAgZW5kZWQoKTogYm9vbGVhbiB7XG4gICAgICAgIHJldHVybiB0aGlzLmN1cnJlbnQgPj0gdGhpcy50aW1lO1xuICAgIH1cblxuICAgIC8vUmV0dXJuIGZhbHNlIGlmIHF1ZXVlIGlzIGVtcHR5XG4gICAgc3RhdGljIGFzeW5jIGN1cnJlbnRTdHJlYW0oKTogUHJvbWlzZTxTdHJlYW1RdWV1ZT4ge1xuXG4gICAgICAgIGxldCByZXBvc2l0b3J5OiBSZXBvc2l0b3J5PFN0cmVhbVF1ZXVlPiA9IGdldERCQ29ubmVjdGlvbigpLmdldFJlcG9zaXRvcnkoU3RyZWFtUXVldWUpO1xuXG4gICAgICAgIHJldHVybiBhd2FpdCByZXBvc2l0b3J5LmNyZWF0ZVF1ZXJ5QnVpbGRlcihcInF1ZXVlXCIpXG4gICAgICAgICAgICAubGVmdEpvaW5BbmRTZWxlY3QoXCJxdWV1ZS51c2VyXCIsIFwidXNlclwiKVxuICAgICAgICAgICAgLndoZXJlKFwicXVldWUuY3VycmVudCA8IHF1ZXVlLnRpbWVcIilcbiAgICAgICAgICAgIC5vcmRlckJ5KFwicXVldWUuY3JlYXRlZEF0XCIsIFwiQVNDXCIpXG4gICAgICAgICAgICAuZ2V0T25lKCk7XG5cbiAgICB9XG5cbiAgICBzdGF0aWMgYXN5bmMgaXNDdXJyZW50T25saW5lKHR3aXRjaElkPzogc3RyaW5nKTogUHJvbWlzZTxib29sZWFuPiB7XG5cbiAgICAgICAgbGV0IGNoYW5uZWwgPSB0d2l0Y2hJZCA9PSB1bmRlZmluZWQgPyAoYXdhaXQgU3RyZWFtUXVldWUuY3VycmVudFN0cmVhbSgpKS51c2VyLnR3aXRjaElkIDogdHdpdGNoSWQ7XG5cbiAgICAgICAgY29uc29sZS5sb2coYGh0dHBzOi8vYXBpLnR3aXRjaC50di9rcmFrZW4vc3RyZWFtcy8ke2NoYW5uZWx9YCk7XG4gICAgICAgIGxldCByZXF1ZXN0ID0gYXdhaXQgYXhpb3MuZ2V0KGBodHRwczovL2FwaS50d2l0Y2gudHYva3Jha2VuL3N0cmVhbXMvJHtjaGFubmVsfWAsIHtoZWFkZXJzOiB7XCJDbGllbnQtSURcIjogcHJvY2Vzcy5lbnYuVFdJVENIX0NMSUVOVF9JRH19KTtcblxuICAgICAgICByZXR1cm4gcmVxdWVzdC5kYXRhLnN0cmVhbSAhPT0gbnVsbDtcblxuICAgIH1cblxuICAgIHN0YXRpYyBhc3luYyBjdXJyZW50QW5kTmV4dFN0cmVhbXMoKTogUHJvbWlzZTxBcnJheTxTdHJlYW1RdWV1ZT4+IHtcblxuICAgICAgICBsZXQgcmVwb3NpdG9yeTogUmVwb3NpdG9yeTxTdHJlYW1RdWV1ZT4gPSBnZXREQkNvbm5lY3Rpb24oKS5nZXRSZXBvc2l0b3J5KFN0cmVhbVF1ZXVlKTtcblxuICAgICAgICByZXR1cm4gYXdhaXQgcmVwb3NpdG9yeS5jcmVhdGVRdWVyeUJ1aWxkZXIoXCJxdWV1ZVwiKVxuICAgICAgICAgICAgLnNlbGVjdChbXCJxdWV1ZS50aW1lXCIsIFwicXVldWUuY3VycmVudFwiLCBcInF1ZXVlLmlkXCJdKVxuICAgICAgICAgICAgLmxlZnRKb2luKFwicXVldWUudXNlclwiLCBcInVzZXJcIilcbiAgICAgICAgICAgIC5hZGRTZWxlY3QoW1widXNlci51c2VybmFtZVwiLCBcInVzZXIuYXZhdGFyXCIsIFwidXNlci5kaXNwbGF5X25hbWVcIl0pXG4gICAgICAgICAgICAud2hlcmUoXCJxdWV1ZS5jdXJyZW50IDwgcXVldWUudGltZVwiKVxuICAgICAgICAgICAgLm9yZGVyQnkoXCJxdWV1ZS5jcmVhdGVkQXRcIiwgXCJBU0NcIilcbiAgICAgICAgICAgIC5nZXRNYW55KCk7XG5cbiAgICB9XG5cbiAgICBzdGF0aWMgYXN5bmMgaXNFbXB0eSgpOiBQcm9taXNlPGJvb2xlYW4+IHtcblxuICAgICAgICBsZXQgc3RyZWFtID0gYXdhaXQgU3RyZWFtUXVldWUuY3VycmVudFN0cmVhbSgpO1xuXG4gICAgICAgIHJldHVybiAoc3RyZWFtID09IHVuZGVmaW5lZCk7XG5cbiAgICB9XG5cblxufVxuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gdXBkYXRlU3RyZWFtUXVldWUoKSB7XG5cbiAgICBsZXQgcmVwb3NpdG9yeTogUmVwb3NpdG9yeTxTdHJlYW1RdWV1ZT4gPSBnZXREQkNvbm5lY3Rpb24oKS5nZXRSZXBvc2l0b3J5KFN0cmVhbVF1ZXVlKTtcblxuICAgIGxldCBjdXJyZW50U3RyZWFtID0gYXdhaXQgU3RyZWFtUXVldWUuY3VycmVudFN0cmVhbSgpO1xuXG4gICAgLy9JZiBxdWV1ZSBpcyBlbXB0eSBkbyBub3RoaW5nXG4gICAgaWYgKGN1cnJlbnRTdHJlYW0gPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICAvL1N0YXJ0IGlmIG51bGxcbiAgICBpZiAoY3VycmVudFN0cmVhbS5zdGFydCA9PSBudWxsKSB7XG4gICAgICAgIGN1cnJlbnRTdHJlYW0uc3RhcnQgPSBuZXcgRGF0ZSgpO1xuICAgICAgICByZXBvc2l0b3J5LnNhdmUoY3VycmVudFN0cmVhbSk7XG4gICAgfVxuICAgIC8vVXBkYXRlIGN1cnJlbnRcbiAgICBlbHNlIHtcbiAgICAgICAgbGV0IHN0YXJ0VGltZSA9IE1hdGgucm91bmQoY3VycmVudFN0cmVhbS5zdGFydFRpbWUoKS5nZXRUaW1lKCkgLyAxMDAwKTtcblxuICAgICAgICBjdXJyZW50U3RyZWFtLmN1cnJlbnQgPSBNYXRoLnJvdW5kKG5ldyBEYXRlKCkuZ2V0VGltZSgpIC8gMTAwMCkgLSBzdGFydFRpbWU7XG4gICAgICAgIHJlcG9zaXRvcnkuc2F2ZShjdXJyZW50U3RyZWFtKTtcblxuICAgIH1cblxufVxuIl19