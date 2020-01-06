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
Object.defineProperty(exports, "__esModule", { value: true });
const typeorm_1 = require("typeorm");
const User_1 = require("./User");
let Transaction = class Transaction extends typeorm_1.BaseEntity {
};
__decorate([
    typeorm_1.PrimaryGeneratedColumn(),
    __metadata("design:type", Number)
], Transaction.prototype, "id", void 0);
__decorate([
    typeorm_1.Column(),
    __metadata("design:type", String)
], Transaction.prototype, "status", void 0);
__decorate([
    typeorm_1.Column(),
    __metadata("design:type", String)
], Transaction.prototype, "amount", void 0);
__decorate([
    typeorm_1.Column(),
    __metadata("design:type", String)
], Transaction.prototype, "paymentInstrumentType", void 0);
__decorate([
    typeorm_1.Column(),
    __metadata("design:type", String)
], Transaction.prototype, "paypalId", void 0);
__decorate([
    typeorm_1.CreateDateColumn(),
    __metadata("design:type", Date)
], Transaction.prototype, "createdAt", void 0);
__decorate([
    typeorm_1.ManyToOne(type => User_1.User, user => user.transactions, { cascade: true }),
    typeorm_1.JoinColumn({ name: "userId" }),
    __metadata("design:type", User_1.User)
], Transaction.prototype, "user", void 0);
Transaction = __decorate([
    typeorm_1.Entity()
], Transaction);
exports.Transaction = Transaction;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiL1N0cmVhbVJ1bm5lcnMvVHdpdGNoVmlldy9kYXRhYmFzZS9lbnRpdHkvVHJhbnNhY3Rpb24udHMiLCJzb3VyY2VzIjpbIi9TdHJlYW1SdW5uZXJzL1R3aXRjaFZpZXcvZGF0YWJhc2UvZW50aXR5L1RyYW5zYWN0aW9uLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7O0FBQUEscUNBU2lCO0FBUWpCLGlDQUE0QjtBQUc1QixJQUFhLFdBQVcsR0FBeEIsTUFBYSxXQUFZLFNBQVEsb0JBQVU7Q0F3QjFDLENBQUE7QUFyQkc7SUFEQyxnQ0FBc0IsRUFBRTs7dUNBQ2Q7QUFHWDtJQURDLGdCQUFNLEVBQUU7OzJDQUNNO0FBR2Y7SUFEQyxnQkFBTSxFQUFFOzsyQ0FDTTtBQUdmO0lBREMsZ0JBQU0sRUFBRTs7MERBQ3FCO0FBRzlCO0lBREMsZ0JBQU0sRUFBRTs7NkNBQ1E7QUFHakI7SUFEQywwQkFBZ0IsRUFBRTs4QkFDUixJQUFJOzhDQUFDO0FBSWhCO0lBRkMsbUJBQVMsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLFdBQUksRUFBRSxJQUFJLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxZQUFZLEVBQUUsRUFBQyxPQUFPLEVBQUUsSUFBSSxFQUFDLENBQUM7SUFDbkUsb0JBQVUsQ0FBQyxFQUFDLElBQUksRUFBRSxRQUFRLEVBQUMsQ0FBQzs4QkFDdkIsV0FBSTt5Q0FBQztBQXRCRixXQUFXO0lBRHZCLGdCQUFNLEVBQUU7R0FDSSxXQUFXLENBd0J2QjtBQXhCWSxrQ0FBVyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7XG4gICAgQmFzZUVudGl0eSxcbiAgICBDb2x1bW4sIENyZWF0ZURhdGVDb2x1bW4sXG4gICAgRW50aXR5LFxuICAgIEpvaW5Db2x1bW4sXG4gICAgSm9pblRhYmxlLFxuICAgIE1hbnlUb01hbnksIE1hbnlUb09uZSxcbiAgICBPbmVUb01hbnksXG4gICAgUHJpbWFyeUdlbmVyYXRlZENvbHVtblxufSBmcm9tIFwidHlwZW9ybVwiO1xuaW1wb3J0IHtTdHJlYW1RdWV1ZX0gZnJvbSBcIi4vU3RyZWFtUXVldWVcIjtcbmltcG9ydCB7VklQfSBmcm9tIFwiLi9WSVBcIjtcbmltcG9ydCB7Z2V0REJDb25uZWN0aW9ufSBmcm9tIFwiLi4vY29ubmVjdGlvblwiO1xuaW1wb3J0IHtDb3Vwb259IGZyb20gXCIuL0NvdXBvblwiO1xuaW1wb3J0IHtDYXNlT3duZWR9IGZyb20gXCIuL0Nhc2VPd25lZFwiO1xuaW1wb3J0IHtnZXRQb3dlciwgUG93ZXIsIHBvd2VycywgVXNlclBvd2VyfSBmcm9tIFwiLi9Vc2VyUG93ZXJcIjtcbmltcG9ydCBDYWNoZVNlcnZpY2UgZnJvbSBcIi4uLy4uL290aGVyL0NhY2hlU2VydmljZVwiO1xuaW1wb3J0IHtVc2VyfSBmcm9tIFwiLi9Vc2VyXCI7XG5cbkBFbnRpdHkoKVxuZXhwb3J0IGNsYXNzIFRyYW5zYWN0aW9uIGV4dGVuZHMgQmFzZUVudGl0eSB7XG5cbiAgICBAUHJpbWFyeUdlbmVyYXRlZENvbHVtbigpXG4gICAgaWQ6IG51bWJlcjtcblxuICAgIEBDb2x1bW4oKVxuICAgIHN0YXR1czogc3RyaW5nO1xuXG4gICAgQENvbHVtbigpXG4gICAgYW1vdW50OiBzdHJpbmc7XG5cbiAgICBAQ29sdW1uKClcbiAgICBwYXltZW50SW5zdHJ1bWVudFR5cGU6IHN0cmluZztcblxuICAgIEBDb2x1bW4oKVxuICAgIHBheXBhbElkOiBzdHJpbmc7XG5cbiAgICBAQ3JlYXRlRGF0ZUNvbHVtbigpXG4gICAgY3JlYXRlZEF0OiBEYXRlO1xuXG4gICAgQE1hbnlUb09uZSh0eXBlID0+IFVzZXIsIHVzZXIgPT4gdXNlci50cmFuc2FjdGlvbnMsIHtjYXNjYWRlOiB0cnVlfSlcbiAgICBASm9pbkNvbHVtbih7bmFtZTogXCJ1c2VySWRcIn0pXG4gICAgdXNlcjogVXNlcjtcblxufVxuXG4iXX0=