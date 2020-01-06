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
var Case_1;
const typeorm_1 = require("typeorm");
const CaseContent_1 = require("./CaseContent");
const CaseOwned_1 = require("./CaseOwned");
const connection_1 = require("../connection");
const SteamKey_1 = require("./SteamKey");
let Case = Case_1 = class Case extends typeorm_1.BaseEntity {
    getRandomContent() {
        return __awaiter(this, void 0, void 0, function* () {
            //Check if relation is loaded
            let content;
            content = (this.content == undefined ? (yield connection_1.getDBConnection().getRepository(Case_1).findOne(this.id)).content : this.content);
            function realGetRandomContent() {
                let weights = []; //Probabilities
                for (const c of content) {
                    weights.push(c.chance);
                }
                let results = content; // values to return
                let num = Math.random() * 10000, s = 0, lastIndex = weights.length - 1;
                for (let i = 0; i < lastIndex; ++i) {
                    s += weights[i];
                    if (num < s) {
                        return results[i];
                    }
                }
                return results[lastIndex];
            }
            let result;
            //If no more key available
            if (!(yield SteamKey_1.SteamKey.isAvailable())) {
                do {
                    result = realGetRandomContent();
                } while (result.special === "steam");
            }
            else {
                result = realGetRandomContent();
            }
            return result;
        });
    }
};
__decorate([
    typeorm_1.PrimaryGeneratedColumn(),
    __metadata("design:type", Number)
], Case.prototype, "id", void 0);
__decorate([
    typeorm_1.Column({ unique: true }),
    __metadata("design:type", String)
], Case.prototype, "name", void 0);
__decorate([
    typeorm_1.Column({ nullable: true }),
    __metadata("design:type", String)
], Case.prototype, "openImage", void 0);
__decorate([
    typeorm_1.Column({ nullable: true }),
    __metadata("design:type", String)
], Case.prototype, "closeImage", void 0);
__decorate([
    typeorm_1.OneToMany(type => CaseContent_1.CaseContent, CaseContent => CaseContent.case, { eager: true }),
    __metadata("design:type", Array)
], Case.prototype, "content", void 0);
__decorate([
    typeorm_1.OneToMany(type => CaseOwned_1.CaseOwned, CaseOwned => CaseOwned.case),
    __metadata("design:type", Array)
], Case.prototype, "caseOwned", void 0);
Case = Case_1 = __decorate([
    typeorm_1.Entity()
], Case);
exports.Case = Case;
function syncCases(cases) {
    return __awaiter(this, void 0, void 0, function* () {
        const caseRepo = connection_1.getDBConnection().getRepository(Case);
        const caseContentRepo = connection_1.getDBConnection().getRepository(CaseContent_1.CaseContent);
        for (let c of cases) {
            //Find or create
            const tmp = yield caseRepo.findOne({ where: { name: c.name } });
            let caseModel = (tmp == undefined ? new Case() : tmp);
            //Update and save
            caseModel.name = c.name;
            caseModel.openImage = (c.openImage == undefined ? null : c.openImage);
            caseModel.closeImage = (c.closeImage == undefined ? null : c.closeImage);
            yield caseRepo.save(caseModel);
            //Reload caseModel
            caseModel = yield caseRepo.findOne({ where: { name: caseModel.name } });
            //Case content
            for (let content of c.content) {
                //Find or create
                const tmp2 = yield caseContentRepo.createQueryBuilder("content")
                    .leftJoinAndSelect("content.case", "c")
                    .where("LOWER(content.name) = LOWER(:name)", { name: content.name })
                    .andWhere("c.id = :id", { id: caseModel.id })
                    .getOne();
                let caseContentModel = (tmp2 == undefined ? new CaseContent_1.CaseContent() : tmp2);
                //Update and save
                caseContentModel.name = content.name;
                caseContentModel.amount = content.amount;
                caseContentModel.chance = content.chance;
                caseContentModel.special = content.special;
                caseContentModel.case = caseModel;
                caseContentModel.image = (content.image == undefined ? null : content.image);
                yield caseContentRepo.save(caseContentModel);
            }
        }
    });
}
exports.syncCases = syncCases;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiL1N0cmVhbVJ1bm5lcnMvVHdpdGNoVmlldy9kYXRhYmFzZS9lbnRpdHkvQ2FzZS50cyIsInNvdXJjZXMiOlsiL1N0cmVhbVJ1bm5lcnMvVHdpdGNoVmlldy9kYXRhYmFzZS9lbnRpdHkvQ2FzZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBLHFDQUFzRjtBQUN0RiwrQ0FBMEM7QUFDMUMsMkNBQXNDO0FBQ3RDLDhDQUE4QztBQUM5Qyx5Q0FBb0M7QUFHcEMsSUFBYSxJQUFJLFlBQWpCLE1BQWEsSUFBSyxTQUFRLG9CQUFVO0lBb0IxQixnQkFBZ0I7O1lBRWxCLDZCQUE2QjtZQUM3QixJQUFJLE9BQU8sQ0FBQztZQUNaLE9BQU8sR0FBRyxDQUFDLElBQUksQ0FBQyxPQUFPLElBQUksU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sNEJBQWUsRUFBRSxDQUFDLGFBQWEsQ0FBQyxNQUFJLENBQUMsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUM7WUFFOUgsU0FBUyxvQkFBb0I7Z0JBRXpCLElBQUksT0FBTyxHQUFHLEVBQUUsQ0FBQyxDQUFDLGVBQWU7Z0JBQ2pDLEtBQUssTUFBTSxDQUFDLElBQUksT0FBTyxFQUFFO29CQUNyQixPQUFPLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQztpQkFDMUI7Z0JBRUQsSUFBSSxPQUFPLEdBQUcsT0FBTyxDQUFDLENBQUMsbUJBQW1CO2dCQUcxQyxJQUFJLEdBQUcsR0FBRyxJQUFJLENBQUMsTUFBTSxFQUFFLEdBQUcsS0FBSyxFQUMzQixDQUFDLEdBQUcsQ0FBQyxFQUNMLFNBQVMsR0FBRyxPQUFPLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQztnQkFFbkMsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLFNBQVMs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QUFBO0FBakRELDhCQWlEQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7QmFzZUVudGl0eSwgQ29sdW1uLCBFbnRpdHksIE9uZVRvTWFueSwgUHJpbWFyeUdlbmVyYXRlZENvbHVtbn0gZnJvbSBcInR5cGVvcm1cIjtcbmltcG9ydCB7Q2FzZUNvbnRlbnR9IGZyb20gXCIuL0Nhc2VDb250ZW50XCI7XG5pbXBvcnQge0Nhc2VPd25lZH0gZnJvbSBcIi4vQ2FzZU93bmVkXCI7XG5pbXBvcnQge2dldERCQ29ubmVjdGlvbn0gZnJvbSBcIi4uL2Nvbm5lY3Rpb25cIjtcbmltcG9ydCB7U3RlYW1LZXl9IGZyb20gXCIuL1N0ZWFtS2V5XCI7XG5cbkBFbnRpdHkoKVxuZXhwb3J0IGNsYXNzIENhc2UgZXh0ZW5kcyBCYXNlRW50aXR5IHtcblxuICAgIEBQcmltYXJ5R2VuZXJhdGVkQ29sdW1uKClcbiAgICBpZDogbnVtYmVyO1xuXG4gICAgQENvbHVtbih7dW5pcXVlOiB0cnVlfSlcbiAgICBuYW1lOiBzdHJpbmc7XG5cbiAgICBAQ29sdW1uKHtudWxsYWJsZTogdHJ1ZX0pXG4gICAgb3BlbkltYWdlOiBzdHJpbmc7XG5cbiAgICBAQ29sdW1uKHtudWxsYWJsZTogdHJ1ZX0pXG4gICAgY2xvc2VJbWFnZTogc3RyaW5nO1xuXG4gICAgQE9uZVRvTWFueSh0eXBlID0+IENhc2VDb250ZW50LCBDYXNlQ29udGVudCA9PiBDYXNlQ29udGVudC5jYXNlLCB7ZWFnZXI6IHRydWV9KVxuICAgIGNvbnRlbnQ6IENhc2VDb250ZW50W107XG5cbiAgICBAT25lVG9NYW55KHR5cGUgPT4gQ2FzZU93bmVkLCBDYXNlT3duZWQgPT4gQ2FzZU93bmVkLmNhc2UpXG4gICAgY2FzZU93bmVkOiBDYXNlT3duZWRbXTtcblxuICAgIGFzeW5jIGdldFJhbmRvbUNvbnRlbnQoKTogUHJvbWlzZTxDYXNlQ29udGVudD4ge1xuXG4gICAgICAgIC8vQ2hlY2sgaWYgcmVsYXRpb24gaXMgbG9hZGVkXG4gICAgICAgIGxldCBjb250ZW50O1xuICAgICAgICBjb250ZW50ID0gKHRoaXMuY29udGVudCA9PSB1bmRlZmluZWQgPyAoYXdhaXQgZ2V0REJDb25uZWN0aW9uKCkuZ2V0UmVwb3NpdG9yeShDYXNlKS5maW5kT25lKHRoaXMuaWQpKS5jb250ZW50IDogdGhpcy5jb250ZW50KTtcblxuICAgICAgICBmdW5jdGlvbiByZWFsR2V0UmFuZG9tQ29udGVudCgpOiBDYXNlQ29udGVudCB7XG5cbiAgICAgICAgICAgIGxldCB3ZWlnaHRzID0gW107IC8vUHJvYmFiaWxpdGllc1xuICAgICAgICAgICAgZm9yIChjb25zdCBjIG9mIGNvbnRlbnQpIHtcbiAgICAgICAgICAgICAgICB3ZWlnaHRzLnB1c2goYy5jaGFuY2UpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBsZXQgcmVzdWx0cyA9IGNvbnRlbnQ7IC8vIHZhbHVlcyB0byByZXR1cm5cblxuXG4gICAgICAgICAgICBsZXQgbnVtID0gTWF0aC5yYW5kb20oKSAqIDEwMDAwLFxuICAgICAgICAgICAgICAgIHMgPSAwLFxuICAgICAgICAgICAgICAgIGxhc3RJbmRleCA9IHdlaWdodHMubGVuZ3RoIC0gMTtcblxuICAgICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBsYXN0SW5kZXg7ICsraSkge1xuICAgICAgICAgICAgICAgIHMgKz0gd2VpZ2h0c1tpXTtcbiAgICAgICAgICAgICAgICBpZiAobnVtIDwgcykge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gcmVzdWx0c1tpXTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHJldHVybiByZXN1bHRzW2xhc3RJbmRleF07XG4gICAgICAgIH1cblxuICAgICAgICBsZXQgcmVzdWx0OiBDYXNlQ29udGVudDtcblxuICAgICAgICAvL0lmIG5vIG1vcmUga2V5IGF2YWlsYWJsZVxuICAgICAgICBpZiAoIShhd2FpdCBTdGVhbUtleS5pc0F2YWlsYWJsZSgpKSkge1xuICAgICAgICAgICAgZG8ge1xuICAgICAgICAgICAgICAgIHJlc3VsdCA9IHJlYWxHZXRSYW5kb21Db250ZW50KCk7XG4gICAgICAgICAgICB9IHdoaWxlIChyZXN1bHQuc3BlY2lhbCA9PT0gXCJzdGVhbVwiKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIHJlc3VsdCA9IHJlYWxHZXRSYW5kb21Db250ZW50KCk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gcmVzdWx0O1xuXG4gICAgfVxuXG5cbn1cblxuZXhwb3J0IGludGVyZmFjZSBDYXNlSW50ZXJmYWNlIHtcbiAgICBpZD86IG51bWJlcjtcbiAgICBuYW1lOiBzdHJpbmc7XG4gICAgb3BlbkltYWdlPzogc3RyaW5nO1xuICAgIGNsb3NlSW1hZ2U/OiBzdHJpbmc7XG4gICAgY29udGVudDogQ2FzZUNvbnRlbnRJbnRlcmZhY2VbXTtcbn1cblxuZXhwb3J0IGludGVyZmFjZSBDYXNlQ29udGVudEludGVyZmFjZSB7XG4gICAgaWQ/OiBudW1iZXI7XG4gICAgbmFtZTogc3RyaW5nO1xuICAgIGltYWdlPzogc3RyaW5nO1xuICAgIGFtb3VudDogbnVtYmVyIHwgbnVsbDtcbiAgICBjaGFuY2U6IG51bWJlcjtcbiAgICBzcGVjaWFsOiBzdHJpbmcgfCBudWxsO1xuICAgIGNhc2U/OiBDYXNlSW50ZXJmYWNlO1xufVxuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gc3luY0Nhc2VzKGNhc2VzOiBBcnJheTxDYXNlSW50ZXJmYWNlPikge1xuXG4gICAgY29uc3QgY2FzZVJlcG8gPSBnZXREQkNvbm5lY3Rpb24oKS5nZXRSZXBvc2l0b3J5KENhc2UpO1xuICAgIGNvbnN0IGNhc2VDb250ZW50UmVwbyA9IGdldERCQ29ubmVjdGlvbigpLmdldFJlcG9zaXRvcnkoQ2FzZUNvbnRlbnQpO1xuXG4gICAgZm9yIChsZXQgYyBvZiBjYXNlcykge1xuXG4gICAgICAgIC8vRmluZCBvciBjcmVhdGVcbiAgICAgICAgY29uc3QgdG1wID0gYXdhaXQgY2FzZVJlcG8uZmluZE9uZSh7d2hlcmU6IHtuYW1lOiBjLm5hbWV9fSk7XG4gICAgICAgIGxldCBjYXNlTW9kZWwgPSAodG1wID09IHVuZGVmaW5lZCA/IG5ldyBDYXNlKCkgOiB0bXApO1xuXG4gICAgICAgIC8vVXBkYXRlIGFuZCBzYXZlXG4gICAgICAgIGNhc2VNb2RlbC5uYW1lID0gYy5uYW1lO1xuXG4gICAgICAgIGNhc2VNb2RlbC5vcGVuSW1hZ2UgPSAoYy5vcGVuSW1hZ2UgPT0gdW5kZWZpbmVkID8gbnVsbCA6IGMub3BlbkltYWdlKTtcblxuICAgICAgICBjYXNlTW9kZWwuY2xvc2VJbWFnZSA9IChjLmNsb3NlSW1hZ2UgPT0gdW5kZWZpbmVkID8gbnVsbCA6IGMuY2xvc2VJbWFnZSk7XG4gICAgICAgIGF3YWl0IGNhc2VSZXBvLnNhdmUoY2FzZU1vZGVsKTtcblxuICAgICAgICAvL1JlbG9hZCBjYXNlTW9kZWxcbiAgICAgICAgY2FzZU1vZGVsID0gYXdhaXQgY2FzZVJlcG8uZmluZE9uZSh7d2hlcmU6IHtuYW1lOiBjYXNlTW9kZWwubmFtZX19KTtcblxuICAgICAgICAvL0Nhc2UgY29udGVudFxuICAgICAgICBmb3IgKGxldCBjb250ZW50IG9mIGMuY29udGVudCkge1xuXG4gICAgICAgICAgICAvL0ZpbmQgb3IgY3JlYXRlXG4gICAgICAgICAgICBjb25zdCB0bXAyID0gYXdhaXQgY2FzZUNvbnRlbnRSZXBvLmNyZWF0ZVF1ZXJ5QnVpbGRlcihcImNvbnRlbnRcIilcbiAgICAgICAgICAgICAgICAubGVmdEpvaW5BbmRTZWxlY3QoXCJjb250ZW50LmNhc2VcIiwgXCJjXCIpXG4gICAgICAgICAgICAgICAgLndoZXJlKFwiTE9XRVIoY29udGVudC5uYW1lKSA9IExPV0VSKDpuYW1lKVwiLCB7bmFtZTogY29udGVudC5uYW1lfSlcbiAgICAgICAgICAgICAgICAuYW5kV2hlcmUoXCJjLmlkID0gOmlkXCIsIHtpZDogY2FzZU1vZGVsLmlkfSlcbiAgICAgICAgICAgICAgICAuZ2V0T25lKCk7XG4gICAgICAgICAgICBsZXQgY2FzZUNvbnRlbnRNb2RlbCA9ICh0bXAyID09IHVuZGVmaW5lZCA/IG5ldyBDYXNlQ29udGVudCgpIDogdG1wMik7XG5cbiAgICAgICAgICAgIC8vVXBkYXRlIGFuZCBzYXZlXG4gICAgICAgICAgICBjYXNlQ29udGVudE1vZGVsLm5hbWUgPSBjb250ZW50Lm5hbWU7XG4gICAgICAgICAgICBjYXNlQ29udGVudE1vZGVsLmFtb3VudCA9IGNvbnRlbnQuYW1vdW50O1xuICAgICAgICAgICAgY2FzZUNvbnRlbnRNb2RlbC5jaGFuY2UgPSBjb250ZW50LmNoYW5jZTtcbiAgICAgICAgICAgIGNhc2VDb250ZW50TW9kZWwuc3BlY2lhbCA9IGNvbnRlbnQuc3BlY2lhbDtcbiAgICAgICAgICAgIGNhc2VDb250ZW50TW9kZWwuY2FzZSA9IGNhc2VNb2RlbDtcblxuICAgICAgICAgICAgY2FzZUNvbnRlbnRNb2RlbC5pbWFnZSA9IChjb250ZW50LmltYWdlID09IHVuZGVmaW5lZCA/IG51bGwgOiBjb250ZW50LmltYWdlKTtcblxuICAgICAgICAgICAgYXdhaXQgY2FzZUNvbnRlbnRSZXBvLnNhdmUoY2FzZUNvbnRlbnRNb2RlbCk7XG5cbiAgICAgICAgfVxuXG5cbiAgICB9XG5cbn1cbiJdfQ==