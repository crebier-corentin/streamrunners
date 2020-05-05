<template>
<span :class="{'font-italic': message.deleted, 'text-danger': message.deleted}">
<span v-for="fragment in fragments" :class="fragment.classes">{{fragment.text}}</span>
</span>
</template>

<script lang="ts">
    export default {
        name: 'ChatMessage',

        props: {
            message: {
                type: Object,
                required: true,
            },
        },

        computed: {
            fragments(): { text: string; classes: string }[] {
                const fragments: { text: string; classes: string }[] = [];

                let start = 0;

                for (const mention of this.message.mentions) {

                    //Text before mention
                    if (start !== mention.start) {
                        fragments.push({ text: this.message.message.substring(start, mention.start), classes: '' });
                    }

                    //Mention
                    let classes = 'badge badge-pill ';
                    //Add color class depending on self mention or not
                    classes += mention.userId === window['id'] ? 'chat-self-mention' : 'chat-mention';

                    fragments.push({ text: this.message.message.substring(mention.start, mention.end), classes });

                    start = mention.end;

                }

                //Text after final mention
                if (start !== this.message.message.length - 1) {
                    fragments.push({
                        text: this.message.message.substring(start, this.message.message.length),
                        classes: '',
                    });
                }

                return fragments;
            },
        },
    };
</script>

<style scoped>

</style>
