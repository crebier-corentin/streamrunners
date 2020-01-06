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
var SteamKey_1;
const typeorm_1 = require("typeorm");
const CaseOwned_1 = require("./CaseOwned");
const connection_1 = require("../connection");
let SteamKey = SteamKey_1 = class SteamKey extends typeorm_1.BaseEntity {
    //Check if all keys has been taken
    static isAvailable() {
        return __awaiter(this, void 0, void 0, function* () {
            let keys = yield connection_1.getDBConnection().getRepository(SteamKey_1).createQueryBuilder("key")
                .where("caseOwnedId IS NULL")
                .getMany();
            return keys.length > 0;
        });
    }
    static random() {
        return __awaiter(this, void 0, void 0, function* () {
            function shuffle(a) {
                for (let i = a.length - 1; i > 0; i--) {
                    const j = Math.floor(Math.random() * (i + 1));
                    [a[i], a[j]] = [a[j], a[i]];
                }
                return a;
            }
            let keys = yield connection_1.getDBConnection().getRepository(SteamKey_1).createQueryBuilder("key")
                .where("caseOwnedId IS NULL")
                .getMany();
            return shuffle(keys)[0];
        });
    }
};
__decorate([
    typeorm_1.PrimaryGeneratedColumn(),
    __metadata("design:type", Number)
], SteamKey.prototype, "id", void 0);
__decorate([
    typeorm_1.Column({ unique: true }),
    __metadata("design:type", String)
], SteamKey.prototype, "key", void 0);
__decorate([
    typeorm_1.Column(),
    __metadata("design:type", String)
], SteamKey.prototype, "game", void 0);
__decorate([
    typeorm_1.ManyToOne(type => CaseOwned_1.CaseOwned, caseOwned => caseOwned.relationSteamKey, { nullable: true }),
    typeorm_1.JoinColumn({ name: "caseOwnedId" }),
    __metadata("design:type", CaseOwned_1.CaseOwned)
], SteamKey.prototype, "caseOwned", void 0);
SteamKey = SteamKey_1 = __decorate([
    typeorm_1.Entity()
], SteamKey);
exports.SteamKey = SteamKey;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiL1N0cmVhbVJ1bm5lcnMvVHdpdGNoVmlldy9kYXRhYmFzZS9lbnRpdHkvU3RlYW1LZXkudHMiLCJzb3VyY2VzIjpbIi9TdHJlYW1SdW5uZXJzL1R3aXRjaFZpZXcvZGF0YWJhc2UvZW50aXR5L1N0ZWFtS2V5LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQUEscUNBVWlCO0FBRWpCLDJDQUFzQztBQUN0Qyw4Q0FBOEM7QUFJOUMsSUFBYSxRQUFRLGdCQUFyQixNQUFhLFFBQVMsU0FBUSxvQkFBVTtJQWVwQyxrQ0FBa0M7SUFDbEMsTUFBTSxDQUFPLFdBQVc7O1lBRXBCLElBQUksSUFBSSxHQUFHLE1BQU0sNEJBQWUsRUFBRSxDQUFDLGFBQWEsQ0FBQyxVQUFRLENBQUMsQ0FBQyxrQkFBa0IsQ0FBQyxLQUFLLENBQUM7aUJBQy9FLEtBQUssQ0FBQyxxQkFBcUIsQ0FBQztpQkFDNUIsT0FBTyxFQUFFLENBQUM7WUFFZixPQUFPLElBQUksQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDO1FBQzNCLENBQUM7S0FBQTtJQUVELE1BQU0sQ0FBTyxNQUFNOztZQUNmLFNBQVMsT0FBTyxDQUFDLENBQUM7Z0JBQ2QsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsTUFBTSxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFO29CQUNuQyxNQUFNLENBQUMsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxNQUFNLEVBQUUsR0FBRyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDO29CQUM5QyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztpQkFDL0I7Z0JBQ0QsT0FBTyxDQUFDLENBQUM7WUFDYixDQUFDO1lBR0QsSUFBSSxJQUFJLEdBQUcsTUFBTSw0QkFBZSxFQUFFLENBQUMsYUFBYSxDQUFDLFVBQVEsQ0FBQyxDQUFDLGtCQUFrQixDQUFDLEtBQUssQ0FBQztpQkFDL0UsS0FBSyxDQUFDLHFCQUFxQixDQUFDO2lCQUM1QixPQUFPLEVBQUUsQ0FBQztZQUdmLE9BQU8sT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQzVCLENBQUM7S0FBQTtDQUVKLENBQUE7QUF4Q0c7SUFEQyxnQ0FBc0IsRUFBRTs7b0NBQ2Q7QUFHWDtJQURDLGdCQUFNLENBQUMsRUFBQyxNQUFNLEVBQUUsSUFBSSxFQUFDLENBQUM7O3FDQUNYO0FBR1o7SUFEQyxnQkFBTSxFQUFFOztzQ0FDSTtBQUliO0lBRkMsbUJBQVMsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLHFCQUFTLEVBQUUsU0FBUyxDQUFDLEVBQUUsQ0FBQyxTQUFTLENBQUMsZ0JBQWdCLEVBQUUsRUFBQyxRQUFRLEVBQUUsSUFBSSxFQUFDLENBQUM7SUFDdkYsb0JBQVUsQ0FBQyxFQUFDLElBQUksRUFBRSxhQUFhLEVBQUMsQ0FBQzs4QkFDdkIscUJBQVM7MkNBQUM7QUFiWixRQUFRO0lBRHBCLGdCQUFNLEVBQUU7R0FDSSxRQUFRLENBMkNwQjtBQTNDWSw0QkFBUSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7XG4gICAgQmFzZUVudGl0eSxcbiAgICBDb2x1bW4sXG4gICAgRW50aXR5LFxuICAgIEpvaW5Db2x1bW4sXG4gICAgTWFueVRvTWFueSxcbiAgICBNYW55VG9PbmUsXG4gICAgT25lVG9NYW55LFxuICAgIE9uZVRvT25lLFxuICAgIFByaW1hcnlHZW5lcmF0ZWRDb2x1bW5cbn0gZnJvbSBcInR5cGVvcm1cIjtcbmltcG9ydCB7VXNlcn0gZnJvbSBcIi4vVXNlclwiO1xuaW1wb3J0IHtDYXNlT3duZWR9IGZyb20gXCIuL0Nhc2VPd25lZFwiO1xuaW1wb3J0IHtnZXREQkNvbm5lY3Rpb259IGZyb20gXCIuLi9jb25uZWN0aW9uXCI7XG5pbXBvcnQge0Nhc2VDb250ZW50fSBmcm9tIFwiLi9DYXNlQ29udGVudFwiO1xuXG5ARW50aXR5KClcbmV4cG9ydCBjbGFzcyBTdGVhbUtleSBleHRlbmRzIEJhc2VFbnRpdHkge1xuXG4gICAgQFByaW1hcnlHZW5lcmF0ZWRDb2x1bW4oKVxuICAgIGlkOiBudW1iZXI7XG5cbiAgICBAQ29sdW1uKHt1bmlxdWU6IHRydWV9KVxuICAgIGtleTogc3RyaW5nO1xuXG4gICAgQENvbHVtbigpXG4gICAgZ2FtZTogc3RyaW5nO1xuXG4gICAgQE1hbnlUb09uZSh0eXBlID0+IENhc2VPd25lZCwgY2FzZU93bmVkID0+IGNhc2VPd25lZC5yZWxhdGlvblN0ZWFtS2V5LCB7bnVsbGFibGU6IHRydWV9KVxuICAgIEBKb2luQ29sdW1uKHtuYW1lOiBcImNhc2VPd25lZElkXCJ9KVxuICAgIGNhc2VPd25lZDogQ2FzZU93bmVkO1xuXG4gICAgLy9DaGVjayBpZiBhbGwga2V5cyBoYXMgYmVlbiB0YWtlblxuICAgIHN0YXRpYyBhc3luYyBpc0F2YWlsYWJsZSgpOiBQcm9taXNlPGJvb2xlYW4+IHtcblxuICAgICAgICBsZXQga2V5cyA9IGF3YWl0IGdldERCQ29ubmVjdGlvbigpLmdldFJlcG9zaXRvcnkoU3RlYW1LZXkpLmNyZWF0ZVF1ZXJ5QnVpbGRlcihcImtleVwiKVxuICAgICAgICAgICAgLndoZXJlKFwiY2FzZU93bmVkSWQgSVMgTlVMTFwiKVxuICAgICAgICAgICAgLmdldE1hbnkoKTtcblxuICAgICAgICByZXR1cm4ga2V5cy5sZW5ndGggPiAwO1xuICAgIH1cblxuICAgIHN0YXRpYyBhc3luYyByYW5kb20oKTogUHJvbWlzZTxTdGVhbUtleT4ge1xuICAgICAgICBmdW5jdGlvbiBzaHVmZmxlKGEpIHtcbiAgICAgICAgICAgIGZvciAobGV0IGkgPSBhLmxlbmd0aCAtIDE7IGkgPiAwOyBpLS0pIHtcbiAgICAgICAgICAgICAgICBjb25zdCBqID0gTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogKGkgKyAxKSk7XG4gICAgICAgICAgICAgICAgW2FbaV0sIGFbal1dID0gW2Fbal0sIGFbaV1dO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIGE7XG4gICAgICAgIH1cblxuXG4gICAgICAgIGxldCBrZXlzID0gYXdhaXQgZ2V0REJDb25uZWN0aW9uKCkuZ2V0UmVwb3NpdG9yeShTdGVhbUtleSkuY3JlYXRlUXVlcnlCdWlsZGVyKFwia2V5XCIpXG4gICAgICAgICAgICAud2hlcmUoXCJjYXNlT3duZWRJZCBJUyBOVUxMXCIpXG4gICAgICAgICAgICAuZ2V0TWFueSgpO1xuXG5cbiAgICAgICAgcmV0dXJuIHNodWZmbGUoa2V5cylbMF07XG4gICAgfVxuXG59XG4iXX0=