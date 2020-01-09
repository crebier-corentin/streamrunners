declare const _default: {
    name: string;
    props: {
        messages: {
            type: ArrayConstructor;
            required: boolean;
        };
    };
    data(): {
        message: string;
    };
    computed: {
        cMessages(): any;
        trimmedMessage(): string;
        messageValid(): boolean;
    };
    methods: {
        sendMessage(): void;
    };
};
export default _default;
