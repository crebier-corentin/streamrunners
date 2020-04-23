<template>

    <div class="slider-presentation">
        <h2 class="slider-title">
            Découvre nos Streamers Partenaires</h2>

        <div class="slider-container">
            <div class="slider-info">

                <h3 class="roleName">{{currentStreamer.displayName}}</h3>

                <p class="followers"><!-- TODO --></p>
            </div>
            <div class="slider-description">

                <div class="text">
                    <p>{{currentStreamer.twitchDescription}}</p>
                    <a :href="`https://twitch.com/${currentStreamer.username}`"
                       class="btn btn-outline-success partenaire">Découvrir sa chaine</a>
                </div>

            </div>
        </div>

        <div class="slider">
            <div class="container">
                <img class="dashRound" src="/img/rounded-dash.svg" alt="Visuel"></div>
            <img class="arrow left" src="/img/right-arrow-white.svg" alt="Visuel" @click="prev()">
            <img class="arrow right" src="/img/right-arrow-white.svg" alt="Visuel" @click="next()">

            <div v-for="(streamer, i) in streamersList"
                 v-show="positionShow(i)"
                 class="slider-group"
                 :class="positionClass(i)"
                 @click="currentIndex = i">
                <div class="roleGroupChild">
                    <div class="role villagers">
                        <!-- Safari doesn't support webp, so fallback to png-->
                        <picture>
                            <source :srcset="proxiedUrl(streamer.avatar)" type="image/webp" />
                            <source :srcset="streamer.avatar" type="image/png" />
                            <img :src="streamer.avatar" loading="lazy" alt="avatar">
                        </picture>
                    </div>
                    <p class="name">{{streamer.displayName}}</p>
                </div>
            </div>

        </div>
        <div class="helpMessage">Clique sur un des autres streamers pour le découvrir</div>
        <a aria-label="Devenir Partenaire"
           target="_blank"
           style="margin-top: 2rem;"
           class="btn btn-outline-success blue"
           href="https://discordapp.com/channels/609311986488180757/609321765096914954/688346262503817239n">Devenir
            Streamer Partenaire</a>
    </div>
</template>

<script lang="ts">
    import { duplicatedArray, mod } from '../../../src/shared/shared-utils';

    export default {
        name: 'StreamerPartners',

        props: {
            streamers: {
                type: Array,
                required: true,
            },
        },

        data() {
            return {
                currentIndex: 0,
            };
        },

        computed: {
            streamersList() {
                //Needs at least 11 elements in the slider
                if (this.streamers.length < 11) {
                    const dupAmount = Math.ceil(11 / this.streamers.length);
                    return duplicatedArray(this.streamers, dupAmount);
                }

                return this.streamers;

            },
            currentStreamer() {
                return this.streamersList[this.currentIndex];
            },
            sliderClass(): Map<number, string> {
                const result = new Map<number, string>();

                //left
                for (let i = 5; i > 0; i--) {
                    const index = mod(this.currentIndex - i, this.streamersList.length);
                    result.set(index, `left-${i}`);
                }

                //center
                result.set(this.currentIndex, 'center');

                //right
                for (let i = 1; i <= 5; i++) {
                    const index = mod(this.currentIndex + i, this.streamersList.length);
                    result.set(index, `right-${i}`);
                }

                return result;
            },
        },

        methods: {
            positionShow(index: number) {
                return this.sliderClass.get(index) != undefined;
            },

            positionClass(index: number) {
                return this.sliderClass.get(index) ?? '';
            },

            prev() {
                if (this.currentIndex === 0) {
                    this.currentIndex = this.streamersList.length - 1;
                }
                else {
                    this.currentIndex--;
                }
            },

            next() {
                if (this.currentIndex === this.streamersList.length - 1) {
                    this.currentIndex = 0;
                }
                else {
                    this.currentIndex++;
                }
            },

            proxiedUrl(url: string): string {
                return `//images.weserv.nl/?url=${url}&output=webp`;
            },
        },
    };
</script>

<style scoped>

</style>
