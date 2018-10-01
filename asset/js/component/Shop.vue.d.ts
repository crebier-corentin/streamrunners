declare const _default: {
    name: string;
    data(): {
        products: any;
        cart: any[];
    };
    methods: {
        getProduct(name: string): any;
        addToCart(name: string): void;
        removeFromCart(index: Number): void;
    };
    computed: {
        total(): string;
    };
};
export default _default;
