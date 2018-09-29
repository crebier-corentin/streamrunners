import {BaseEntity, Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, Repository} from "typeorm";
import {User} from "./User";
import {StreamQueue} from "./StreamQueue";
import {getDBConnection} from "../connection";
import {Case} from "./Case";

export interface ProductInterface {
    name: string;
    displayName: string;
    amount: string;
    description: string;
    image?: string;
}

const products: ProductInterface[] = [{
    name: "double_points",
    displayName: "Potion double points",
    description: "Gagner le double de points pendant une semaine !",
    amount: "0.99"
}];

@Entity()
export class Product extends BaseEntity {

    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @Column()
    displayName: string;

    @Column()
    description: string;

    @Column()
    amount: string;

    @Column({nullable: true})
    image: string;

    async apply(user: User) {
        switch (this.name) {
            case "double_points":
                await user.addPower("double_points");
                break;
        }

    }

    static async getProduct(name: string): Promise<Product | undefined> {
        const repo = getDBConnection().getRepository(Product);
        return await repo.findOne({where: {name: name}});

    }

    static async getAllProducts(): Promise<Product[]> {
        const repo = getDBConnection().getRepository(Product);
        return repo.find();
    }

    static async productExist(name: string): Promise<boolean> {
        const repo = getDBConnection().getRepository(Product);
        return await repo.count({where: {name: name}}) > 0;

    }


}

export async function syncProducts() {
    const repo = getDBConnection().getRepository(Product);

    for (let product of products) {

        //Find or create
        const tmp = await repo.findOne({where: {name: product.name}});
        let productModel = (tmp == undefined ? new Product() : tmp);

        productModel.name = product.name;
        productModel.displayName = product.displayName;
        productModel.description = product.description;
        productModel.amount = product.amount;
        productModel.image = product.image;

        await repo.save(productModel);
    }
}

