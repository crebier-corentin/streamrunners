<template>
    <div>
        <iframe :src="videoUrl"
                frameborder="0"
                allowfullscreen="allowfullscreen"
                scrolling="no"
                height="410"
                width="70%"></iframe>
        <iframe :src="chatUrl" frameborder="0" scrolling="no" height="410" width="29%"></iframe>
    </div>
</template>

<script lang="ts">
    export default {
        name: "TwitchViewer",

        props: {
            channel: String
        },

        computed: {

            channelName() {
                return this.channel;

            },

            videoUrl() {
                return 'https://player.twitch.tv/?channel=' + this.channelName;
            },

            chatUrl() {
                return 'https://www.twitch.tv/embed/' + this.channelName + '/chat';
            }
        }


    }
</script>

<style scoped>

</style>