interface Item {
    total: number
}

class Cart {
    items: { [name: string]: Item } = {};

    itemExist(name: string): boolean {
        return this.items[name] !== undefined;
    }

    getItem(name: string): Item {

        //If not exist create one
        if (!this.itemExist(name)) {
            this.items[name] = {total: 0};
        }

        return this.items[name];
    }

    addItem(name: string) {
        this.getItem(name).total++;
    }

    removeItem(name: string) {
        this.getItem(name).total--;

        if(this.getItem(name).total <= 0) {
            delete this.items[name];
        }
    }

    isEmpty(): boolean {
        return Object.keys(this.items).length === 0;
    }

}

const cart = new Cart();

window['cart'] = cart;

//Button
let buttons = <HTMLCollectionOf<HTMLButtonElement>>document.getElementsByClassName("buy");
for (let button of buttons) {

    button.addEventListener("click", evt => {
        let target = <HTMLButtonElement> evt.target;

        cart.addItem(target.dataset["name"]);
    });

}
