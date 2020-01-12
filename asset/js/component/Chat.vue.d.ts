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
        chatAddUrl: string;
        sending: boolean;
    };
    computed: {
        cMessages(): any;
        trimmedMessage(): string;
        messageValid(): boolean;
    };
    watch: {
        cMessages(newValue: any[], oldValue: any[]): void;
    };
    methods: {
        scrollToBottom(): void;
        sendMessage(): void;
    };
    mounted(): void;
};
export default _default;
