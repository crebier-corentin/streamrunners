declare const _default: {
    name: string;
    props: {
        name: {
            type: StringConstructor;
            required: boolean;
        };
        rank: {
            type: NumberConstructor;
            required: boolean;
        };
    };
    computed: {
        rankClass(): string;
        pawn(): string;
    };
};
export default _default;
