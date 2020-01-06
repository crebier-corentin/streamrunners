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
var SteamKey_1;
Object.defineProperty(exports, "__esModule", { value: true });
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiL1N0cmVhbVJ1bm5lcnMvVHdpdGNoVmlldy9kYXRhYmFzZS9lbnRpdHkvU3RlYW1LZXkudHMiLCJzb3VyY2VzIjpbIi9TdHJlYW1SdW5uZXJzL1R3aXRjaFZpZXcvZGF0YWJhc2UvZW50aXR5L1N0ZWFtS2V5LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBLHFDQVVpQjtBQUVqQiwyQ0FBc0M7QUFDdEMsOENBQThDO0FBSTlDLElBQWEsUUFBUSxnQkFBckIsTUFBYSxRQUFTLFNBQVEsb0JBQVU7SUFlcEMsa0NBQWtDO0lBQ2xDLE1BQU0sQ0FBTyxXQUFXOztZQUVwQixJQUFJLElBQUksR0FBRyxNQUFNLDRCQUFlLEVBQUUsQ0FBQyxhQUFhLENBQUMsVUFBUSxDQUFDLENBQUMsa0JBQWtCLENBQUMsS0FBSyxDQUFDO2lCQUMvRSxLQUFLLENBQUMscUJBQXFCLENBQUM7aUJBQzVCLE9BQU8sRUFBRSxDQUFDO1lBRWYsT0FBTyxJQUFJLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQztRQUMzQixDQUFDO0tBQUE7SUFFRCxNQUFNLENBQU8sTUFBTTs7WUFDZixTQUFTLE9BQU8sQ0FBQyxDQUFDO2dCQUNkLEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLE1BQU0sR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRTtvQkFDbkMsTUFBTSxDQUFDLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsTUFBTSxFQUFFLEdBQUcsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQztvQkFDOUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7aUJBQy9CO2dCQUNELE9BQU8sQ0FBQyxDQUFDO1lBQ2IsQ0FBQztZQUdELElBQUksSUFBSSxHQUFHLE1BQU0sNEJBQWUsRUFBRSxDQUFDLGFBQWEsQ0FBQyxVQUFRLENBQUMsQ0FBQyxrQkFBa0IsQ0FBQyxLQUFLLENBQUM7aUJBQy9FLEtBQUssQ0FBQyxxQkFBcUIsQ0FBQztpQkFDNUIsT0FBTyxFQUFFLENBQUM7WUFHZixPQUFPLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUM1QixDQUFDO0tBQUE7Q0FFSixDQUFBO0FBeENHO0lBREMsZ0NBQXNCLEVBQUU7O29DQUNkO0FBR1g7SUFEQyxnQkFBTSxDQUFDLEVBQUMsTUFBTSxFQUFFLElBQUksRUFBQyxDQUFDOztxQ0FDWDtBQUdaO0lBREMsZ0JBQU0sRUFBRTs7c0NBQ0k7QUFJYjtJQUZDLG1CQUFTLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxxQkFBUyxFQUFFLFNBQVMsQ0FBQyxFQUFFLENBQUMsU0FBUyxDQUFDLGdCQUFnQixFQUFFLEVBQUMsUUFBUSxFQUFFLElBQUksRUFBQyxDQUFDO0lBQ3ZGLG9CQUFVLENBQUMsRUFBQyxJQUFJLEVBQUUsYUFBYSxFQUFDLENBQUM7OEJBQ3ZCLHFCQUFTOzJDQUFDO0FBYlosUUFBUTtJQURwQixnQkFBTSxFQUFFO0dBQ0ksUUFBUSxDQTJDcEI7QUEzQ1ksNEJBQVEiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge1xuICAgIEJhc2VFbnRpdHksXG4gICAgQ29sdW1uLFxuICAgIEVudGl0eSxcbiAgICBKb2luQ29sdW1uLFxuICAgIE1hbnlUb01hbnksXG4gICAgTWFueVRvT25lLFxuICAgIE9uZVRvTWFueSxcbiAgICBPbmVUb09uZSxcbiAgICBQcmltYXJ5R2VuZXJhdGVkQ29sdW1uXG59IGZyb20gXCJ0eXBlb3JtXCI7XG5pbXBvcnQge1VzZXJ9IGZyb20gXCIuL1VzZXJcIjtcbmltcG9ydCB7Q2FzZU93bmVkfSBmcm9tIFwiLi9DYXNlT3duZWRcIjtcbmltcG9ydCB7Z2V0REJDb25uZWN0aW9ufSBmcm9tIFwiLi4vY29ubmVjdGlvblwiO1xuaW1wb3J0IHtDYXNlQ29udGVudH0gZnJvbSBcIi4vQ2FzZUNvbnRlbnRcIjtcblxuQEVudGl0eSgpXG5leHBvcnQgY2xhc3MgU3RlYW1LZXkgZXh0ZW5kcyBCYXNlRW50aXR5IHtcblxuICAgIEBQcmltYXJ5R2VuZXJhdGVkQ29sdW1uKClcbiAgICBpZDogbnVtYmVyO1xuXG4gICAgQENvbHVtbih7dW5pcXVlOiB0cnVlfSlcbiAgICBrZXk6IHN0cmluZztcblxuICAgIEBDb2x1bW4oKVxuICAgIGdhbWU6IHN0cmluZztcblxuICAgIEBNYW55VG9PbmUodHlwZSA9PiBDYXNlT3duZWQsIGNhc2VPd25lZCA9PiBjYXNlT3duZWQucmVsYXRpb25TdGVhbUtleSwge251bGxhYmxlOiB0cnVlfSlcbiAgICBASm9pbkNvbHVtbih7bmFtZTogXCJjYXNlT3duZWRJZFwifSlcbiAgICBjYXNlT3duZWQ6IENhc2VPd25lZDtcblxuICAgIC8vQ2hlY2sgaWYgYWxsIGtleXMgaGFzIGJlZW4gdGFrZW5cbiAgICBzdGF0aWMgYXN5bmMgaXNBdmFpbGFibGUoKTogUHJvbWlzZTxib29sZWFuPiB7XG5cbiAgICAgICAgbGV0IGtleXMgPSBhd2FpdCBnZXREQkNvbm5lY3Rpb24oKS5nZXRSZXBvc2l0b3J5KFN0ZWFtS2V5KS5jcmVhdGVRdWVyeUJ1aWxkZXIoXCJrZXlcIilcbiAgICAgICAgICAgIC53aGVyZShcImNhc2VPd25lZElkIElTIE5VTExcIilcbiAgICAgICAgICAgIC5nZXRNYW55KCk7XG5cbiAgICAgICAgcmV0dXJuIGtleXMubGVuZ3RoID4gMDtcbiAgICB9XG5cbiAgICBzdGF0aWMgYXN5bmMgcmFuZG9tKCk6IFByb21pc2U8U3RlYW1LZXk+IHtcbiAgICAgICAgZnVuY3Rpb24gc2h1ZmZsZShhKSB7XG4gICAgICAgICAgICBmb3IgKGxldCBpID0gYS5sZW5ndGggLSAxOyBpID4gMDsgaS0tKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgaiA9IE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIChpICsgMSkpO1xuICAgICAgICAgICAgICAgIFthW2ldLCBhW2pdXSA9IFthW2pdLCBhW2ldXTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBhO1xuICAgICAgICB9XG5cblxuICAgICAgICBsZXQga2V5cyA9IGF3YWl0IGdldERCQ29ubmVjdGlvbigpLmdldFJlcG9zaXRvcnkoU3RlYW1LZXkpLmNyZWF0ZVF1ZXJ5QnVpbGRlcihcImtleVwiKVxuICAgICAgICAgICAgLndoZXJlKFwiY2FzZU93bmVkSWQgSVMgTlVMTFwiKVxuICAgICAgICAgICAgLmdldE1hbnkoKTtcblxuXG4gICAgICAgIHJldHVybiBzaHVmZmxlKGtleXMpWzBdO1xuICAgIH1cblxufVxuIl19