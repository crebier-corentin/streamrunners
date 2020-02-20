<template>
    <div class="d-flex flex-row">
        <div id="twitch-embed" style="width: 100%"></div>
        <iframe :src="chatUrl" frameborder="0" scrolling="no" height="410" width="30%"></iframe>
    </div>
</template>

<script lang="ts">
    const Twitch = window['Twitch'];

    export default {
        name: 'TwitchViewer',

        props: {
            channel: String,
        },

        data() {
            return {
                player: null,
                chat: null,
            };
        },

        computed: {
            chatUrl() {
                return 'https://www.twitch.tv/embed/' + this.channel + '/chat';
            },
        },

        watch: {
            channel(val) {
                this.player.setChannel(val);
            },
        },

        mounted() {
            //Initialize a new stream
            this.player = new Twitch.Player('twitch-embed', {
                width: '100%',
                height: 410,
                channel: this.channel,
                layout: 'video',
                autoplay: true,
            });

            this.player.addEventListener(Twitch.Player.PLAYING, () => {
                this.$emit('playing');
            });

            this.player.addEventListener(Twitch.Player.PAUSE, () => {
                this.$emit('paused');
            });

        },


    };
</script>

<style scoped>

</style>
