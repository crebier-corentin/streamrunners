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
var Product_1;
Object.defineProperty(exports, "__esModule", { value: true });
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiL1N0cmVhbVJ1bm5lcnMvVHdpdGNoVmlldy9kYXRhYmFzZS9lbnRpdHkvUHJvZHVjdC50cyIsInNvdXJjZXMiOlsiL1N0cmVhbVJ1bm5lcnMvVHdpdGNoVmlldy9kYXRhYmFzZS9lbnRpdHkvUHJvZHVjdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQSxxQ0FBb0g7QUFHcEgsOENBQThDO0FBVzlDLE1BQU0sUUFBUSxHQUF1QjtJQUNqQztRQUNJLElBQUksRUFBRSxlQUFlO1FBQ3JCLFdBQVcsRUFBRSxzQkFBc0I7UUFDbkMsV0FBVyxFQUFFLGtEQUFrRDtRQUMvRCxNQUFNLEVBQUUsTUFBTTtLQUNqQjtJQUNEO1FBQ0ksSUFBSSxFQUFFLFNBQVM7UUFDZixXQUFXLEVBQUUsY0FBYztRQUMzQixXQUFXLEVBQUUsa0NBQWtDO1FBQy9DLE1BQU0sRUFBRSxNQUFNO0tBQ2pCO0NBQ0osQ0FBQztBQUdGLElBQWEsT0FBTyxlQUFwQixNQUFhLE9BQVEsU0FBUSxvQkFBVTtJQW9CN0IsS0FBSyxDQUFDLElBQVU7O1lBQ2xCLFFBQVEsSUFBSSxDQUFDLElBQUksRUFBRTtnQkFDZixLQUFLLGVBQWU7b0JBQ2hCLE1BQU0sSUFBSSxDQUFDLFFBQVEsQ0FBQyxlQUFlLENBQUMsQ0FBQztvQkFDckMsTUFBTTthQUNiO1FBRUwsQ0FBQztLQUFBO0lBRUQsTUFBTSxDQUFPLFVBQVUsQ0FBQyxJQUFZOztZQUNoQyxNQUFNLElBQUksR0FBRyw0QkFBZSxFQUFFLENBQUMsYUFBYSxDQUFDLFNBQU8sQ0FBQyxDQUFDO1lBQ3RELE9BQU8sTUFBTSxJQUFJLENBQUMsT0FBTyxDQUFDLEVBQUMsS0FBSyxFQUFFLEVBQUMsSUFBSSxFQUFFLElBQUksRUFBQyxFQUFDLENBQUMsQ0FBQztRQUVyRCxDQUFDO0tBQUE7SUFFRCxNQUFNLENBQU8sY0FBYzs7WUFDdkIsTUFBTSxJQUFJLEdBQUcsNEJBQWUsRUFBRSxDQUFDLGFBQWEsQ0FBQyxTQUFPLENBQUMsQ0FBQztZQUN0RCxPQUFPLElBQUksQ0FBQyxJQUFJLENBQUMsRUFBQyxNQUFNLEVBQUUsQ0FBQyxNQUFNLEVBQUUsYUFBYSxFQUFFLGFBQWEsRUFBRSxRQUFRLEVBQUUsT0FBTyxDQUFDLEVBQUMsQ0FBQyxDQUFDO1FBQzFGLENBQUM7S0FBQTtJQUVELE1BQU0sQ0FBTyxZQUFZLENBQUMsSUFBWTs7WUFDbEMsTUFBTSxJQUFJLEdBQUcsNEJBQWUsRUFBRSxDQUFDLGFBQWEsQ0FBQyxTQUFPLENBQUMsQ0FBQztZQUN0RCxPQUFPLENBQUEsTUFBTSxJQUFJLENBQUMsS0FBSyxDQUFDLEVBQUMsS0FBSyxFQUFFLEVBQUMsSUFBSSxFQUFFLElBQUksRUFBQyxFQUFDLENBQUMsSUFBRyxDQUFDLENBQUM7UUFFdkQsQ0FBQztLQUFBO0NBR0osQ0FBQTtBQTVDRztJQURDLGdDQUFzQixFQUFFOzttQ0FDZDtBQUdYO0lBREMsZ0JBQU0sRUFBRTs7cUNBQ0k7QUFHYjtJQURDLGdCQUFNLEVBQUU7OzRDQUNXO0FBR3BCO0lBREMsZ0JBQU0sRUFBRTs7NENBQ1c7QUFHcEI7SUFEQyxnQkFBTSxFQUFFOzt1Q0FDTTtBQUdmO0lBREMsZ0JBQU0sQ0FBQyxFQUFDLFFBQVEsRUFBRSxJQUFJLEVBQUMsQ0FBQzs7c0NBQ1g7QUFsQkwsT0FBTztJQURuQixnQkFBTSxFQUFFO0dBQ0ksT0FBTyxDQStDbkI7QUEvQ1ksMEJBQU87QUFpRHBCLFNBQXNCLFlBQVk7O1FBQzlCLE1BQU0sSUFBSSxHQUFHLDRCQUFlLEVBQUUsQ0FBQyxhQUFhLENBQUMsT0FBTyxDQUFDLENBQUM7UUFFdEQsS0FBSyxJQUFJLE9BQU8sSUFBSSxRQUFRLEVBQUU7WUFFMUIsZ0JBQWdCO1lBQ2hCLE1BQU0sR0FBRyxHQUFHLE1BQU0sSUFBSSxDQUFDLE9BQU8sQ0FBQyxFQUFDLEtBQUssRUFBRSxFQUFDLElBQUksRUFBRSxPQUFPLENBQUMsSUFBSSxFQUFDLEVBQUMsQ0FBQyxDQUFDO1lBQzlELElBQUksWUFBWSxHQUFHLENBQUMsR0FBRyxJQUFJLFNBQVMsQ0FBQyxDQUFDLENBQUMsSUFBSSxPQUFPLEVBQUUsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUM7WUFFNUQsWUFBWSxDQUFDLElBQUksR0FBRyxPQUFPLENBQUMsSUFBSSxDQUFDO1lBQ2pDLFlBQVksQ0FBQyxXQUFXLEdBQUcsT0FBTyxDQUFDLFdBQVcsQ0FBQztZQUMvQyxZQUFZLENBQUMsV0FBVyxHQUFHLE9BQU8sQ0FBQyxXQUFXLENBQUM7WUFDL0MsWUFBWSxDQUFDLE1BQU0sR0FBRyxPQUFPLENBQUMsTUFBTSxDQUFDO1lBQ3JDLFlBQVksQ0FBQyxLQUFLLEdBQUcsT0FBTyxDQUFDLEtBQUssQ0FBQztZQUVuQyxNQUFNLElBQUksQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLENBQUM7U0FDakM7SUFDTCxDQUFDO0NBQUE7QUFqQkQsb0NBaUJDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtCYXNlRW50aXR5LCBDb2x1bW4sIENyZWF0ZURhdGVDb2x1bW4sIEVudGl0eSwgTWFueVRvT25lLCBQcmltYXJ5R2VuZXJhdGVkQ29sdW1uLCBSZXBvc2l0b3J5fSBmcm9tIFwidHlwZW9ybVwiO1xuaW1wb3J0IHtVc2VyfSBmcm9tIFwiLi9Vc2VyXCI7XG5pbXBvcnQge1N0cmVhbVF1ZXVlfSBmcm9tIFwiLi9TdHJlYW1RdWV1ZVwiO1xuaW1wb3J0IHtnZXREQkNvbm5lY3Rpb259IGZyb20gXCIuLi9jb25uZWN0aW9uXCI7XG5pbXBvcnQge0Nhc2V9IGZyb20gXCIuL0Nhc2VcIjtcblxuZXhwb3J0IGludGVyZmFjZSBQcm9kdWN0SW50ZXJmYWNlIHtcbiAgICBuYW1lOiBzdHJpbmc7XG4gICAgZGlzcGxheU5hbWU6IHN0cmluZztcbiAgICBhbW91bnQ6IHN0cmluZztcbiAgICBkZXNjcmlwdGlvbjogc3RyaW5nO1xuICAgIGltYWdlPzogc3RyaW5nO1xufVxuXG5jb25zdCBwcm9kdWN0czogUHJvZHVjdEludGVyZmFjZVtdID0gW1xuICAgIHtcbiAgICAgICAgbmFtZTogXCJkb3VibGVfcG9pbnRzXCIsXG4gICAgICAgIGRpc3BsYXlOYW1lOiBcIlBvdGlvbiBkb3VibGUgcG9pbnRzXCIsXG4gICAgICAgIGRlc2NyaXB0aW9uOiBcIkdhZ25lciBsZSBkb3VibGUgZGUgcG9pbnRzIHBlbmRhbnQgdW5lIHNlbWFpbmUgIVwiLFxuICAgICAgICBhbW91bnQ6IFwiMC45OVwiXG4gICAgfSxcbiAgICB7XG4gICAgICAgIG5hbWU6IFwicmVkdWNfMlwiLFxuICAgICAgICBkaXNwbGF5TmFtZTogXCJQb3Rpb24gUmVkdWNcIixcbiAgICAgICAgZGVzY3JpcHRpb246IFwiUsOpZHVpdCBsZSBwcml4IGR1IHBhc3NhZ2UgZGUgMiAhXCIsXG4gICAgICAgIGFtb3VudDogXCIwLjk5XCJcbiAgICB9XG5dO1xuXG5ARW50aXR5KClcbmV4cG9ydCBjbGFzcyBQcm9kdWN0IGV4dGVuZHMgQmFzZUVudGl0eSB7XG5cbiAgICBAUHJpbWFyeUdlbmVyYXRlZENvbHVtbigpXG4gICAgaWQ6IG51bWJlcjtcblxuICAgIEBDb2x1bW4oKVxuICAgIG5hbWU6IHN0cmluZztcblxuICAgIEBDb2x1bW4oKVxuICAgIGRpc3BsYXlOYW1lOiBzdHJpbmc7XG5cbiAgICBAQ29sdW1uKClcbiAgICBkZXNjcmlwdGlvbjogc3RyaW5nO1xuXG4gICAgQENvbHVtbigpXG4gICAgYW1vdW50OiBzdHJpbmc7XG5cbiAgICBAQ29sdW1uKHtudWxsYWJsZTogdHJ1ZX0pXG4gICAgaW1hZ2U6IHN0cmluZztcblxuICAgIGFzeW5jIGFwcGx5KHVzZXI6IFVzZXIpIHtcbiAgICAgICAgc3dpdGNoICh0aGlzLm5hbWUpIHtcbiAgICAgICAgICAgIGNhc2UgXCJkb3VibGVfcG9pbnRzXCI6XG4gICAgICAgICAgICAgICAgYXdhaXQgdXNlci5hZGRQb3dlcihcImRvdWJsZV9wb2ludHNcIik7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cblxuICAgIH1cblxuICAgIHN0YXRpYyBhc3luYyBnZXRQcm9kdWN0KG5hbWU6IHN0cmluZyk6IFByb21pc2U8UHJvZHVjdCB8IHVuZGVmaW5lZD4ge1xuICAgICAgICBjb25zdCByZXBvID0gZ2V0REJDb25uZWN0aW9uKCkuZ2V0UmVwb3NpdG9yeShQcm9kdWN0KTtcbiAgICAgICAgcmV0dXJuIGF3YWl0IHJlcG8uZmluZE9uZSh7d2hlcmU6IHtuYW1lOiBuYW1lfX0pO1xuXG4gICAgfVxuXG4gICAgc3RhdGljIGFzeW5jIGdldEFsbFByb2R1Y3RzKCk6IFByb21pc2U8UHJvZHVjdFtdPiB7XG4gICAgICAgIGNvbnN0IHJlcG8gPSBnZXREQkNvbm5lY3Rpb24oKS5nZXRSZXBvc2l0b3J5KFByb2R1Y3QpO1xuICAgICAgICByZXR1cm4gcmVwby5maW5kKHtzZWxlY3Q6IFtcIm5hbWVcIiwgXCJkaXNwbGF5TmFtZVwiLCBcImRlc2NyaXB0aW9uXCIsIFwiYW1vdW50XCIsIFwiaW1hZ2VcIl19KTtcbiAgICB9XG5cbiAgICBzdGF0aWMgYXN5bmMgcHJvZHVjdEV4aXN0KG5hbWU6IHN0cmluZyk6IFByb21pc2U8Ym9vbGVhbj4ge1xuICAgICAgICBjb25zdCByZXBvID0gZ2V0REJDb25uZWN0aW9uKCkuZ2V0UmVwb3NpdG9yeShQcm9kdWN0KTtcbiAgICAgICAgcmV0dXJuIGF3YWl0IHJlcG8uY291bnQoe3doZXJlOiB7bmFtZTogbmFtZX19KSA+IDA7XG5cbiAgICB9XG5cblxufVxuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gc3luY1Byb2R1Y3RzKCkge1xuICAgIGNvbnN0IHJlcG8gPSBnZXREQkNvbm5lY3Rpb24oKS5nZXRSZXBvc2l0b3J5KFByb2R1Y3QpO1xuXG4gICAgZm9yIChsZXQgcHJvZHVjdCBvZiBwcm9kdWN0cykge1xuXG4gICAgICAgIC8vRmluZCBvciBjcmVhdGVcbiAgICAgICAgY29uc3QgdG1wID0gYXdhaXQgcmVwby5maW5kT25lKHt3aGVyZToge25hbWU6IHByb2R1Y3QubmFtZX19KTtcbiAgICAgICAgbGV0IHByb2R1Y3RNb2RlbCA9ICh0bXAgPT0gdW5kZWZpbmVkID8gbmV3IFByb2R1Y3QoKSA6IHRtcCk7XG5cbiAgICAgICAgcHJvZHVjdE1vZGVsLm5hbWUgPSBwcm9kdWN0Lm5hbWU7XG4gICAgICAgIHByb2R1Y3RNb2RlbC5kaXNwbGF5TmFtZSA9IHByb2R1Y3QuZGlzcGxheU5hbWU7XG4gICAgICAgIHByb2R1Y3RNb2RlbC5kZXNjcmlwdGlvbiA9IHByb2R1Y3QuZGVzY3JpcHRpb247XG4gICAgICAgIHByb2R1Y3RNb2RlbC5hbW91bnQgPSBwcm9kdWN0LmFtb3VudDtcbiAgICAgICAgcHJvZHVjdE1vZGVsLmltYWdlID0gcHJvZHVjdC5pbWFnZTtcblxuICAgICAgICBhd2FpdCByZXBvLnNhdmUocHJvZHVjdE1vZGVsKTtcbiAgICB9XG59XG5cbiJdfQ==