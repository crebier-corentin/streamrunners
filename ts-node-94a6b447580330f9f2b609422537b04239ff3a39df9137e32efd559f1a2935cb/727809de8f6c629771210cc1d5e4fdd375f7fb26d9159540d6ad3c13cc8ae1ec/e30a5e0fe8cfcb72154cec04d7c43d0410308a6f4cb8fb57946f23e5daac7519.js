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
var Case_1;
Object.defineProperty(exports, "__esModule", { value: true });
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiL1N0cmVhbVJ1bm5lcnMvVHdpdGNoVmlldy9kYXRhYmFzZS9lbnRpdHkvQ2FzZS50cyIsInNvdXJjZXMiOlsiL1N0cmVhbVJ1bm5lcnMvVHdpdGNoVmlldy9kYXRhYmFzZS9lbnRpdHkvQ2FzZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQSxxQ0FBc0Y7QUFDdEYsK0NBQTBDO0FBQzFDLDJDQUFzQztBQUN0Qyw4Q0FBOEM7QUFDOUMseUNBQW9DO0FBR3BDLElBQWEsSUFBSSxZQUFqQixNQUFhLElBQUssU0FBUSxvQkFBVTtJQW9CMUIsZ0JBQWdCOztZQUVsQiw2QkFBNkI7WUFDN0IsSUFBSSxPQUFPLENBQUM7WUFDWixPQUFPLEdBQUcsQ0FBQyxJQUFJLENBQUMsT0FBTyxJQUFJLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLDRCQUFlLEVBQUUsQ0FBQyxhQUFhLENBQUMsTUFBSSxDQUFDLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDO1lBRTlILFNBQVMsb0JBQW9CO2dCQUV6QixJQUFJLE9BQU8sR0FBRyxFQUFFLENBQUMsQ0FBQyxlQUFlO2dCQUNqQyxLQUFLLE1BQU0sQ0FBQyxJQUFJLE9BQU8sRUFBRTtvQkFDckIsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUM7aUJBQzFCO2dCQUVELElBQUksT0FBTyxHQUFHLE9BQU8sQ0FBQyxDQUFDLG1CQUFtQjtnQkFHMUMsSUFBSSxHQUFHLEdBQUcsSUFBSSxDQUFDLE1BQU0sRUFBRSxHQUFHLEtBQUssRUFDM0IsQ0FBQyxHQUFHLENBQUMsRUFDTCxTQUFTLEdBQUcsT0FBTyxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUM7Z0JBRW5DLEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxTQUFT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Q0FBQTtBQWpERCw4QkFpREMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge0Jhc2VFbnRpdHksIENvbHVtbiwgRW50aXR5LCBPbmVUb01hbnksIFByaW1hcnlHZW5lcmF0ZWRDb2x1bW59IGZyb20gXCJ0eXBlb3JtXCI7XG5pbXBvcnQge0Nhc2VDb250ZW50fSBmcm9tIFwiLi9DYXNlQ29udGVudFwiO1xuaW1wb3J0IHtDYXNlT3duZWR9IGZyb20gXCIuL0Nhc2VPd25lZFwiO1xuaW1wb3J0IHtnZXREQkNvbm5lY3Rpb259IGZyb20gXCIuLi9jb25uZWN0aW9uXCI7XG5pbXBvcnQge1N0ZWFtS2V5fSBmcm9tIFwiLi9TdGVhbUtleVwiO1xuXG5ARW50aXR5KClcbmV4cG9ydCBjbGFzcyBDYXNlIGV4dGVuZHMgQmFzZUVudGl0eSB7XG5cbiAgICBAUHJpbWFyeUdlbmVyYXRlZENvbHVtbigpXG4gICAgaWQ6IG51bWJlcjtcblxuICAgIEBDb2x1bW4oe3VuaXF1ZTogdHJ1ZX0pXG4gICAgbmFtZTogc3RyaW5nO1xuXG4gICAgQENvbHVtbih7bnVsbGFibGU6IHRydWV9KVxuICAgIG9wZW5JbWFnZTogc3RyaW5nO1xuXG4gICAgQENvbHVtbih7bnVsbGFibGU6IHRydWV9KVxuICAgIGNsb3NlSW1hZ2U6IHN0cmluZztcblxuICAgIEBPbmVUb01hbnkodHlwZSA9PiBDYXNlQ29udGVudCwgQ2FzZUNvbnRlbnQgPT4gQ2FzZUNvbnRlbnQuY2FzZSwge2VhZ2VyOiB0cnVlfSlcbiAgICBjb250ZW50OiBDYXNlQ29udGVudFtdO1xuXG4gICAgQE9uZVRvTWFueSh0eXBlID0+IENhc2VPd25lZCwgQ2FzZU93bmVkID0+IENhc2VPd25lZC5jYXNlKVxuICAgIGNhc2VPd25lZDogQ2FzZU93bmVkW107XG5cbiAgICBhc3luYyBnZXRSYW5kb21Db250ZW50KCk6IFByb21pc2U8Q2FzZUNvbnRlbnQ+IHtcblxuICAgICAgICAvL0NoZWNrIGlmIHJlbGF0aW9uIGlzIGxvYWRlZFxuICAgICAgICBsZXQgY29udGVudDtcbiAgICAgICAgY29udGVudCA9ICh0aGlzLmNvbnRlbnQgPT0gdW5kZWZpbmVkID8gKGF3YWl0IGdldERCQ29ubmVjdGlvbigpLmdldFJlcG9zaXRvcnkoQ2FzZSkuZmluZE9uZSh0aGlzLmlkKSkuY29udGVudCA6IHRoaXMuY29udGVudCk7XG5cbiAgICAgICAgZnVuY3Rpb24gcmVhbEdldFJhbmRvbUNvbnRlbnQoKTogQ2FzZUNvbnRlbnQge1xuXG4gICAgICAgICAgICBsZXQgd2VpZ2h0cyA9IFtdOyAvL1Byb2JhYmlsaXRpZXNcbiAgICAgICAgICAgIGZvciAoY29uc3QgYyBvZiBjb250ZW50KSB7XG4gICAgICAgICAgICAgICAgd2VpZ2h0cy5wdXNoKGMuY2hhbmNlKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgbGV0IHJlc3VsdHMgPSBjb250ZW50OyAvLyB2YWx1ZXMgdG8gcmV0dXJuXG5cblxuICAgICAgICAgICAgbGV0IG51bSA9IE1hdGgucmFuZG9tKCkgKiAxMDAwMCxcbiAgICAgICAgICAgICAgICBzID0gMCxcbiAgICAgICAgICAgICAgICBsYXN0SW5kZXggPSB3ZWlnaHRzLmxlbmd0aCAtIDE7XG5cbiAgICAgICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgbGFzdEluZGV4OyArK2kpIHtcbiAgICAgICAgICAgICAgICBzICs9IHdlaWdodHNbaV07XG4gICAgICAgICAgICAgICAgaWYgKG51bSA8IHMpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHJlc3VsdHNbaV07XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXR1cm4gcmVzdWx0c1tsYXN0SW5kZXhdO1xuICAgICAgICB9XG5cbiAgICAgICAgbGV0IHJlc3VsdDogQ2FzZUNvbnRlbnQ7XG5cbiAgICAgICAgLy9JZiBubyBtb3JlIGtleSBhdmFpbGFibGVcbiAgICAgICAgaWYgKCEoYXdhaXQgU3RlYW1LZXkuaXNBdmFpbGFibGUoKSkpIHtcbiAgICAgICAgICAgIGRvIHtcbiAgICAgICAgICAgICAgICByZXN1bHQgPSByZWFsR2V0UmFuZG9tQ29udGVudCgpO1xuICAgICAgICAgICAgfSB3aGlsZSAocmVzdWx0LnNwZWNpYWwgPT09IFwic3RlYW1cIik7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICByZXN1bHQgPSByZWFsR2V0UmFuZG9tQ29udGVudCgpO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcblxuICAgIH1cblxuXG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgQ2FzZUludGVyZmFjZSB7XG4gICAgaWQ/OiBudW1iZXI7XG4gICAgbmFtZTogc3RyaW5nO1xuICAgIG9wZW5JbWFnZT86IHN0cmluZztcbiAgICBjbG9zZUltYWdlPzogc3RyaW5nO1xuICAgIGNvbnRlbnQ6IENhc2VDb250ZW50SW50ZXJmYWNlW107XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgQ2FzZUNvbnRlbnRJbnRlcmZhY2Uge1xuICAgIGlkPzogbnVtYmVyO1xuICAgIG5hbWU6IHN0cmluZztcbiAgICBpbWFnZT86IHN0cmluZztcbiAgICBhbW91bnQ6IG51bWJlciB8IG51bGw7XG4gICAgY2hhbmNlOiBudW1iZXI7XG4gICAgc3BlY2lhbDogc3RyaW5nIHwgbnVsbDtcbiAgICBjYXNlPzogQ2FzZUludGVyZmFjZTtcbn1cblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHN5bmNDYXNlcyhjYXNlczogQXJyYXk8Q2FzZUludGVyZmFjZT4pIHtcblxuICAgIGNvbnN0IGNhc2VSZXBvID0gZ2V0REJDb25uZWN0aW9uKCkuZ2V0UmVwb3NpdG9yeShDYXNlKTtcbiAgICBjb25zdCBjYXNlQ29udGVudFJlcG8gPSBnZXREQkNvbm5lY3Rpb24oKS5nZXRSZXBvc2l0b3J5KENhc2VDb250ZW50KTtcblxuICAgIGZvciAobGV0IGMgb2YgY2FzZXMpIHtcblxuICAgICAgICAvL0ZpbmQgb3IgY3JlYXRlXG4gICAgICAgIGNvbnN0IHRtcCA9IGF3YWl0IGNhc2VSZXBvLmZpbmRPbmUoe3doZXJlOiB7bmFtZTogYy5uYW1lfX0pO1xuICAgICAgICBsZXQgY2FzZU1vZGVsID0gKHRtcCA9PSB1bmRlZmluZWQgPyBuZXcgQ2FzZSgpIDogdG1wKTtcblxuICAgICAgICAvL1VwZGF0ZSBhbmQgc2F2ZVxuICAgICAgICBjYXNlTW9kZWwubmFtZSA9IGMubmFtZTtcblxuICAgICAgICBjYXNlTW9kZWwub3BlbkltYWdlID0gKGMub3BlbkltYWdlID09IHVuZGVmaW5lZCA/IG51bGwgOiBjLm9wZW5JbWFnZSk7XG5cbiAgICAgICAgY2FzZU1vZGVsLmNsb3NlSW1hZ2UgPSAoYy5jbG9zZUltYWdlID09IHVuZGVmaW5lZCA/IG51bGwgOiBjLmNsb3NlSW1hZ2UpO1xuICAgICAgICBhd2FpdCBjYXNlUmVwby5zYXZlKGNhc2VNb2RlbCk7XG5cbiAgICAgICAgLy9SZWxvYWQgY2FzZU1vZGVsXG4gICAgICAgIGNhc2VNb2RlbCA9IGF3YWl0IGNhc2VSZXBvLmZpbmRPbmUoe3doZXJlOiB7bmFtZTogY2FzZU1vZGVsLm5hbWV9fSk7XG5cbiAgICAgICAgLy9DYXNlIGNvbnRlbnRcbiAgICAgICAgZm9yIChsZXQgY29udGVudCBvZiBjLmNvbnRlbnQpIHtcblxuICAgICAgICAgICAgLy9GaW5kIG9yIGNyZWF0ZVxuICAgICAgICAgICAgY29uc3QgdG1wMiA9IGF3YWl0IGNhc2VDb250ZW50UmVwby5jcmVhdGVRdWVyeUJ1aWxkZXIoXCJjb250ZW50XCIpXG4gICAgICAgICAgICAgICAgLmxlZnRKb2luQW5kU2VsZWN0KFwiY29udGVudC5jYXNlXCIsIFwiY1wiKVxuICAgICAgICAgICAgICAgIC53aGVyZShcIkxPV0VSKGNvbnRlbnQubmFtZSkgPSBMT1dFUig6bmFtZSlcIiwge25hbWU6IGNvbnRlbnQubmFtZX0pXG4gICAgICAgICAgICAgICAgLmFuZFdoZXJlKFwiYy5pZCA9IDppZFwiLCB7aWQ6IGNhc2VNb2RlbC5pZH0pXG4gICAgICAgICAgICAgICAgLmdldE9uZSgpO1xuICAgICAgICAgICAgbGV0IGNhc2VDb250ZW50TW9kZWwgPSAodG1wMiA9PSB1bmRlZmluZWQgPyBuZXcgQ2FzZUNvbnRlbnQoKSA6IHRtcDIpO1xuXG4gICAgICAgICAgICAvL1VwZGF0ZSBhbmQgc2F2ZVxuICAgICAgICAgICAgY2FzZUNvbnRlbnRNb2RlbC5uYW1lID0gY29udGVudC5uYW1lO1xuICAgICAgICAgICAgY2FzZUNvbnRlbnRNb2RlbC5hbW91bnQgPSBjb250ZW50LmFtb3VudDtcbiAgICAgICAgICAgIGNhc2VDb250ZW50TW9kZWwuY2hhbmNlID0gY29udGVudC5jaGFuY2U7XG4gICAgICAgICAgICBjYXNlQ29udGVudE1vZGVsLnNwZWNpYWwgPSBjb250ZW50LnNwZWNpYWw7XG4gICAgICAgICAgICBjYXNlQ29udGVudE1vZGVsLmNhc2UgPSBjYXNlTW9kZWw7XG5cbiAgICAgICAgICAgIGNhc2VDb250ZW50TW9kZWwuaW1hZ2UgPSAoY29udGVudC5pbWFnZSA9PSB1bmRlZmluZWQgPyBudWxsIDogY29udGVudC5pbWFnZSk7XG5cbiAgICAgICAgICAgIGF3YWl0IGNhc2VDb250ZW50UmVwby5zYXZlKGNhc2VDb250ZW50TW9kZWwpO1xuXG4gICAgICAgIH1cblxuXG4gICAgfVxuXG59XG4iXX0=