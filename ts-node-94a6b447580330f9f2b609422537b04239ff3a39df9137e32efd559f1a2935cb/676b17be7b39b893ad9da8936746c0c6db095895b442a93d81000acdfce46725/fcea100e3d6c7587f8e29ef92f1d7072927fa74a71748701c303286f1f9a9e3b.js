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
var Product_1;
const typeorm_1 = require("typeorm");
const connection_1 = require("../connection");
const products = [
    {
        name: "double_points",
        displayName: "Potion double points",
        description: "Gagner le double de points pendant une semaine !",
        amount: "0.99"
    },
    {
        name: "reduc_2",
        displayName: "Potion Reduc",
        description: "Réduit le prix du passage de 2 !",
        amount: "0.99"
    }
];
let Product = Product_1 = class Product extends typeorm_1.BaseEntity {
    apply(user) {
        return __awaiter(this, void 0, void 0, function* () {
            switch (this.name) {
                case "double_points":
                    yield user.addPower("double_points");
                    break;
            }
        });
    }
    static getProduct(name) {
        return __awaiter(this, void 0, void 0, function* () {
            const repo = connection_1.getDBConnection().getRepository(Product_1);
            return yield repo.findOne({ where: { name: name } });
        });
    }
    static getAllProducts() {
        return __awaiter(this, void 0, void 0, function* () {
            const repo = connection_1.getDBConnection().getRepository(Product_1);
            return repo.find({ select: ["name", "displayName", "description", "amount", "image"] });
        });
    }
    static productExist(name) {
        return __awaiter(this, void 0, void 0, function* () {
            const repo = connection_1.getDBConnection().getRepository(Product_1);
            return (yield repo.count({ where: { name: name } })) > 0;
        });
    }
};
__decorate([
    typeorm_1.PrimaryGeneratedColumn(),
    __metadata("design:type", Number)
], Product.prototype, "id", void 0);
__decorate([
    typeorm_1.Column(),
    __metadata("design:type", String)
], Product.prototype, "name", void 0);
__decorate([
    typeorm_1.Column(),
    __metadata("design:type", String)
], Product.prototype, "displayName", void 0);
__decorate([
    typeorm_1.Column(),
    __metadata("design:type", String)
], Product.prototype, "description", void 0);
__decorate([
    typeorm_1.Column(),
    __metadata("design:type", String)
], Product.prototype, "amount", void 0);
__decorate([
    typeorm_1.Column({ nullable: true }),
    __metadata("design:type", String)
], Product.prototype, "image", void 0);
Product = Product_1 = __decorate([
    typeorm_1.Entity()
], Product);
exports.Product = Product;
function syncProducts() {
    return __awaiter(this, void 0, void 0, function* () {
        const repo = connection_1.getDBConnection().getRepository(Product);
        for (let product of products) {
            //Find or create
            const tmp = yield repo.findOne({ where: { name: product.name } });
            let productModel = (tmp == undefined ? new Product() : tmp);
            productModel.name = product.name;
            productModel.displayName = product.displayName;
            productModel.description = product.description;
            productModel.amount = product.amount;
            productModel.image = product.image;
            yield repo.save(productModel);
        }
    });
}
exports.syncProducts = syncProducts;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiL1N0cmVhbVJ1bm5lcnMvVHdpdGNoVmlldy9kYXRhYmFzZS9lbnRpdHkvUHJvZHVjdC50cyIsInNvdXJjZXMiOlsiL1N0cmVhbVJ1bm5lcnMvVHdpdGNoVmlldy9kYXRhYmFzZS9lbnRpdHkvUHJvZHVjdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBLHFDQUFvSDtBQUdwSCw4Q0FBOEM7QUFXOUMsTUFBTSxRQUFRLEdBQXVCO0lBQ2pDO1FBQ0ksSUFBSSxFQUFFLGVBQWU7UUFDckIsV0FBVyxFQUFFLHNCQUFzQjtRQUNuQyxXQUFXLEVBQUUsa0RBQWtEO1FBQy9ELE1BQU0sRUFBRSxNQUFNO0tBQ2pCO0lBQ0Q7UUFDSSxJQUFJLEVBQUUsU0FBUztRQUNmLFdBQVcsRUFBRSxjQUFjO1FBQzNCLFdBQVcsRUFBRSxrQ0FBa0M7UUFDL0MsTUFBTSxFQUFFLE1BQU07S0FDakI7Q0FDSixDQUFDO0FBR0YsSUFBYSxPQUFPLGVBQXBCLE1BQWEsT0FBUSxTQUFRLG9CQUFVO0lBb0I3QixLQUFLLENBQUMsSUFBVTs7WUFDbEIsUUFBUSxJQUFJLENBQUMsSUFBSSxFQUFFO2dCQUNmLEtBQUssZUFBZTtvQkFDaEIsTUFBTSxJQUFJLENBQUMsUUFBUSxDQUFDLGVBQWUsQ0FBQyxDQUFDO29CQUNyQyxNQUFNO2FBQ2I7UUFFTCxDQUFDO0tBQUE7SUFFRCxNQUFNLENBQU8sVUFBVSxDQUFDLElBQVk7O1lBQ2hDLE1BQU0sSUFBSSxHQUFHLDRCQUFlLEVBQUUsQ0FBQyxhQUFhLENBQUMsU0FBTyxDQUFDLENBQUM7WUFDdEQsT0FBTyxNQUFNLElBQUksQ0FBQyxPQUFPLENBQUMsRUFBQyxLQUFLLEVBQUUsRUFBQyxJQUFJLEVBQUUsSUFBSSxFQUFDLEVBQUMsQ0FBQyxDQUFDO1FBRXJELENBQUM7S0FBQTtJQUVELE1BQU0sQ0FBTyxjQUFjOztZQUN2QixNQUFNLElBQUksR0FBRyw0QkFBZSxFQUFFLENBQUMsYUFBYSxDQUFDLFNBQU8sQ0FBQyxDQUFDO1lBQ3RELE9BQU8sSUFBSSxDQUFDLElBQUksQ0FBQyxFQUFDLE1BQU0sRUFBRSxDQUFDLE1BQU0sRUFBRSxhQUFhLEVBQUUsYUFBYSxFQUFFLFFBQVEsRUFBRSxPQUFPLENBQUMsRUFBQyxDQUFDLENBQUM7UUFDMUYsQ0FBQztLQUFBO0lBRUQsTUFBTSxDQUFPLFlBQVksQ0FBQyxJQUFZOztZQUNsQyxNQUFNLElBQUksR0FBRyw0QkFBZSxFQUFFLENBQUMsYUFBYSxDQUFDLFNBQU8sQ0FBQyxDQUFDO1lBQ3RELE9BQU8sQ0FBQSxNQUFNLElBQUksQ0FBQyxLQUFLLENBQUMsRUFBQyxLQUFLLEVBQUUsRUFBQyxJQUFJLEVBQUUsSUFBSSxFQUFDLEVBQUMsQ0FBQyxJQUFHLENBQUMsQ0FBQztRQUV2RCxDQUFDO0tBQUE7Q0FHSixDQUFBO0FBNUNHO0lBREMsZ0NBQXNCLEVBQUU7O21DQUNkO0FBR1g7SUFEQyxnQkFBTSxFQUFFOztxQ0FDSTtBQUdiO0lBREMsZ0JBQU0sRUFBRTs7NENBQ1c7QUFHcEI7SUFEQyxnQkFBTSxFQUFFOzs0Q0FDVztBQUdwQjtJQURDLGdCQUFNLEVBQUU7O3VDQUNNO0FBR2Y7SUFEQyxnQkFBTSxDQUFDLEVBQUMsUUFBUSxFQUFFLElBQUksRUFBQyxDQUFDOztzQ0FDWDtBQWxCTCxPQUFPO0lBRG5CLGdCQUFNLEVBQUU7R0FDSSxPQUFPLENBK0NuQjtBQS9DWSwwQkFBTztBQWlEcEIsU0FBc0IsWUFBWTs7UUFDOUIsTUFBTSxJQUFJLEdBQUcsNEJBQWUsRUFBRSxDQUFDLGFBQWEsQ0FBQyxPQUFPLENBQUMsQ0FBQztRQUV0RCxLQUFLLElBQUksT0FBTyxJQUFJLFFBQVEsRUFBRTtZQUUxQixnQkFBZ0I7WUFDaEIsTUFBTSxHQUFHLEdBQUcsTUFBTSxJQUFJLENBQUMsT0FBTyxDQUFDLEVBQUMsS0FBSyxFQUFFLEVBQUMsSUFBSSxFQUFFLE9BQU8sQ0FBQyxJQUFJLEVBQUMsRUFBQyxDQUFDLENBQUM7WUFDOUQsSUFBSSxZQUFZLEdBQUcsQ0FBQyxHQUFHLElBQUksU0FBUyxDQUFDLENBQUMsQ0FBQyxJQUFJLE9BQU8sRUFBRSxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQztZQUU1RCxZQUFZLENBQUMsSUFBSSxHQUFHLE9BQU8sQ0FBQyxJQUFJLENBQUM7WUFDakMsWUFBWSxDQUFDLFdBQVcsR0FBRyxPQUFPLENBQUMsV0FBVyxDQUFDO1lBQy9DLFlBQVksQ0FBQyxXQUFXLEdBQUcsT0FBTyxDQUFDLFdBQVcsQ0FBQztZQUMvQyxZQUFZLENBQUMsTUFBTSxHQUFHLE9BQU8sQ0FBQyxNQUFNLENBQUM7WUFDckMsWUFBWSxDQUFDLEtBQUssR0FBRyxPQUFPLENBQUMsS0FBSyxDQUFDO1lBRW5DLE1BQU0sSUFBSSxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsQ0FBQztTQUNqQztJQUNMLENBQUM7Q0FBQTtBQWpCRCxvQ0FpQkMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge0Jhc2VFbnRpdHksIENvbHVtbiwgQ3JlYXRlRGF0ZUNvbHVtbiwgRW50aXR5LCBNYW55VG9PbmUsIFByaW1hcnlHZW5lcmF0ZWRDb2x1bW4sIFJlcG9zaXRvcnl9IGZyb20gXCJ0eXBlb3JtXCI7XG5pbXBvcnQge1VzZXJ9IGZyb20gXCIuL1VzZXJcIjtcbmltcG9ydCB7U3RyZWFtUXVldWV9IGZyb20gXCIuL1N0cmVhbVF1ZXVlXCI7XG5pbXBvcnQge2dldERCQ29ubmVjdGlvbn0gZnJvbSBcIi4uL2Nvbm5lY3Rpb25cIjtcbmltcG9ydCB7Q2FzZX0gZnJvbSBcIi4vQ2FzZVwiO1xuXG5leHBvcnQgaW50ZXJmYWNlIFByb2R1Y3RJbnRlcmZhY2Uge1xuICAgIG5hbWU6IHN0cmluZztcbiAgICBkaXNwbGF5TmFtZTogc3RyaW5nO1xuICAgIGFtb3VudDogc3RyaW5nO1xuICAgIGRlc2NyaXB0aW9uOiBzdHJpbmc7XG4gICAgaW1hZ2U/OiBzdHJpbmc7XG59XG5cbmNvbnN0IHByb2R1Y3RzOiBQcm9kdWN0SW50ZXJmYWNlW10gPSBbXG4gICAge1xuICAgICAgICBuYW1lOiBcImRvdWJsZV9wb2ludHNcIixcbiAgICAgICAgZGlzcGxheU5hbWU6IFwiUG90aW9uIGRvdWJsZSBwb2ludHNcIixcbiAgICAgICAgZGVzY3JpcHRpb246IFwiR2FnbmVyIGxlIGRvdWJsZSBkZSBwb2ludHMgcGVuZGFudCB1bmUgc2VtYWluZSAhXCIsXG4gICAgICAgIGFtb3VudDogXCIwLjk5XCJcbiAgICB9LFxuICAgIHtcbiAgICAgICAgbmFtZTogXCJyZWR1Y18yXCIsXG4gICAgICAgIGRpc3BsYXlOYW1lOiBcIlBvdGlvbiBSZWR1Y1wiLFxuICAgICAgICBkZXNjcmlwdGlvbjogXCJSw6lkdWl0IGxlIHByaXggZHUgcGFzc2FnZSBkZSAyICFcIixcbiAgICAgICAgYW1vdW50OiBcIjAuOTlcIlxuICAgIH1cbl07XG5cbkBFbnRpdHkoKVxuZXhwb3J0IGNsYXNzIFByb2R1Y3QgZXh0ZW5kcyBCYXNlRW50aXR5IHtcblxuICAgIEBQcmltYXJ5R2VuZXJhdGVkQ29sdW1uKClcbiAgICBpZDogbnVtYmVyO1xuXG4gICAgQENvbHVtbigpXG4gICAgbmFtZTogc3RyaW5nO1xuXG4gICAgQENvbHVtbigpXG4gICAgZGlzcGxheU5hbWU6IHN0cmluZztcblxuICAgIEBDb2x1bW4oKVxuICAgIGRlc2NyaXB0aW9uOiBzdHJpbmc7XG5cbiAgICBAQ29sdW1uKClcbiAgICBhbW91bnQ6IHN0cmluZztcblxuICAgIEBDb2x1bW4oe251bGxhYmxlOiB0cnVlfSlcbiAgICBpbWFnZTogc3RyaW5nO1xuXG4gICAgYXN5bmMgYXBwbHkodXNlcjogVXNlcikge1xuICAgICAgICBzd2l0Y2ggKHRoaXMubmFtZSkge1xuICAgICAgICAgICAgY2FzZSBcImRvdWJsZV9wb2ludHNcIjpcbiAgICAgICAgICAgICAgICBhd2FpdCB1c2VyLmFkZFBvd2VyKFwiZG91YmxlX3BvaW50c1wiKTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuXG4gICAgfVxuXG4gICAgc3RhdGljIGFzeW5jIGdldFByb2R1Y3QobmFtZTogc3RyaW5nKTogUHJvbWlzZTxQcm9kdWN0IHwgdW5kZWZpbmVkPiB7XG4gICAgICAgIGNvbnN0IHJlcG8gPSBnZXREQkNvbm5lY3Rpb24oKS5nZXRSZXBvc2l0b3J5KFByb2R1Y3QpO1xuICAgICAgICByZXR1cm4gYXdhaXQgcmVwby5maW5kT25lKHt3aGVyZToge25hbWU6IG5hbWV9fSk7XG5cbiAgICB9XG5cbiAgICBzdGF0aWMgYXN5bmMgZ2V0QWxsUHJvZHVjdHMoKTogUHJvbWlzZTxQcm9kdWN0W10+IHtcbiAgICAgICAgY29uc3QgcmVwbyA9IGdldERCQ29ubmVjdGlvbigpLmdldFJlcG9zaXRvcnkoUHJvZHVjdCk7XG4gICAgICAgIHJldHVybiByZXBvLmZpbmQoe3NlbGVjdDogW1wibmFtZVwiLCBcImRpc3BsYXlOYW1lXCIsIFwiZGVzY3JpcHRpb25cIiwgXCJhbW91bnRcIiwgXCJpbWFnZVwiXX0pO1xuICAgIH1cblxuICAgIHN0YXRpYyBhc3luYyBwcm9kdWN0RXhpc3QobmFtZTogc3RyaW5nKTogUHJvbWlzZTxib29sZWFuPiB7XG4gICAgICAgIGNvbnN0IHJlcG8gPSBnZXREQkNvbm5lY3Rpb24oKS5nZXRSZXBvc2l0b3J5KFByb2R1Y3QpO1xuICAgICAgICByZXR1cm4gYXdhaXQgcmVwby5jb3VudCh7d2hlcmU6IHtuYW1lOiBuYW1lfX0pID4gMDtcblxuICAgIH1cblxuXG59XG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBzeW5jUHJvZHVjdHMoKSB7XG4gICAgY29uc3QgcmVwbyA9IGdldERCQ29ubmVjdGlvbigpLmdldFJlcG9zaXRvcnkoUHJvZHVjdCk7XG5cbiAgICBmb3IgKGxldCBwcm9kdWN0IG9mIHByb2R1Y3RzKSB7XG5cbiAgICAgICAgLy9GaW5kIG9yIGNyZWF0ZVxuICAgICAgICBjb25zdCB0bXAgPSBhd2FpdCByZXBvLmZpbmRPbmUoe3doZXJlOiB7bmFtZTogcHJvZHVjdC5uYW1lfX0pO1xuICAgICAgICBsZXQgcHJvZHVjdE1vZGVsID0gKHRtcCA9PSB1bmRlZmluZWQgPyBuZXcgUHJvZHVjdCgpIDogdG1wKTtcblxuICAgICAgICBwcm9kdWN0TW9kZWwubmFtZSA9IHByb2R1Y3QubmFtZTtcbiAgICAgICAgcHJvZHVjdE1vZGVsLmRpc3BsYXlOYW1lID0gcHJvZHVjdC5kaXNwbGF5TmFtZTtcbiAgICAgICAgcHJvZHVjdE1vZGVsLmRlc2NyaXB0aW9uID0gcHJvZHVjdC5kZXNjcmlwdGlvbjtcbiAgICAgICAgcHJvZHVjdE1vZGVsLmFtb3VudCA9IHByb2R1Y3QuYW1vdW50O1xuICAgICAgICBwcm9kdWN0TW9kZWwuaW1hZ2UgPSBwcm9kdWN0LmltYWdlO1xuXG4gICAgICAgIGF3YWl0IHJlcG8uc2F2ZShwcm9kdWN0TW9kZWwpO1xuICAgIH1cbn1cblxuIl19