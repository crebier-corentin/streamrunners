declare const _default: {
    name: string;
    props: {
        heading1: {
            type: StringConstructor;
            required: boolean;
        };
        heading2: {
            type: StringConstructor;
            required: boolean;
        };
        fieldName: {
            type: StringConstructor;
            required: boolean;
        };
        data: {
            type: ArrayConstructor;
            required: boolean;
        };
    };
    computed: {
        cHeading1(): any;
        cHeading2(): any;
        cFieldName(): any;
        cData(): any;
    };
};
export default _default;
