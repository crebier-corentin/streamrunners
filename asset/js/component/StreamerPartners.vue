<template>

    <div class="slider-presentation">
        <h2 class="slider-title"
            data-sr-id="4"
            style="visibility: visible; opacity: 1; transform: matrix3d(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1); transition: opacity 0.5s cubic-bezier(0.04, 0.3, 0.1, 1) 0.05s, transform 0.5s cubic-bezier(0.04, 0.3, 0.1, 1) 0.05s;">
            Découvre nos Streamers Partenaires</h2>

        <div class="slider-container" v-if="currentStreamer">
            <div class="slider-info"
                 data-sr-id="5"
                 style="visibility: visible; opacity: 1; transform: matrix3d(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1); transition: opacity 1s cubic-bezier(0.04, 0.3, 0.1, 1) 0.05s, transform 1s cubic-bezier(0.04, 0.3, 0.1, 1) 0.05s;">

                <h3 class="roleName">{{currentStreamer.displayName}}</h3>

                <p class="followers"><!-- TODO --></p>
            </div>
            <div class="slider-description"
                 data-sr-id="6"
                 style="visibility: visible; opacity: 0.9; transform: matrix3d(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1); transition: opacity 0.3s ease 0s, opacity 1s cubic-bezier(0.04, 0.3, 0.1, 1) 0.05s, transform 1s cubic-bezier(0.04, 0.3, 0.1, 1) 0.05s;">

                <p class="text">{{currentStreamer.twitchDescription}}</p>
            </div>
        </div>
        <div class="slider">
            <div class="container"
                 data-sr-id="7"
                 style="visibility: visible; opacity: 1; transform: matrix3d(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1); transition: opacity 0.5s cubic-bezier(0.04, 0.3, 0.1, 1) 0s, transform 0.5s cubic-bezier(0.04, 0.3, 0.1, 1) 0s;">
                <img class="dashRound" src="/img/rounded-dash.svg" alt="Visuel"></div>
            <img class="arrow left" src="/img/right-arrow-white.svg" alt="Visuel" @click="prev()">
            <img class="arrow right" src="/img/right-arrow-white.svg" alt="Visuel" @click="next()">

            <div v-for="(streamer, i) in streamers"
                 :key="i"
                 class="slider-group"
                 :class="distanceClass(i)"
                 @click="currentIndex = i">
                <div class="roleGroupChild"
                     data-sr-id="61"
                     style="visibility: visible; opacity: 1; transform: matrix3d(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1); transition: opacity 0.5s cubic-bezier(0.04, 0.3, 0.1, 1) 0.575s, transform 0.5s cubic-bezier(0.04, 0.3, 0.1, 1) 0.575s;">
                    <div class="role villagers">
                        <img :src="streamer.avatar">
                    </div>
                    <p class="name">{{streamer.displayName}}</p>
                </div>
            </div>

        </div>
        <div class="helpMessage">Clique sur un des autres streamers pour le découvrir</div>
        <a style="margin-top: 2rem;" class="btn btn-outline-success blue">Devenir Streamer Partenaire</a>
    </div>
</template>

<script lang="ts">
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
            currentStreamer() {
                return this.streamers[this.currentIndex];
            },
        },

        methods: {
            distance(index: number): number {

                const normal = Math.abs(index - this.currentIndex);
                const wrapAround = Math.abs(this.streamers.length - normal);

                return Math.min(normal, wrapAround);
            },

            direction(index: number): number {
                if (index === this.currentIndex) {
                    return 0;
                }
                var internal = (Math.max(index, this.currentIndex) - Math.min(index, this.currentIndex) < this.streamers.length / 2);
                if (internal && index < this.currentIndex
                    ||
                    !internal && index > this.currentIndex
                ) {
                    return 1;
                }
                else {
                    return -1;
                }
            },

            distanceClass(index: number) {
                const distance = this.distance(index);

                if (distance === 0) return 'center';

                const direction = this.direction(index);
                return `${direction > 0 ? 'left' : 'right'}-${Math.min(distance, 5)}`;
            },

            prev() {
                if (this.currentIndex === 0) {
                    this.currentIndex = this.streamers.length - 1;
                }
                else {
                    this.currentIndex--;
                }
            },

            next() {
                if (this.currentIndex === this.streamers.length - 1) {
                    this.currentIndex = 0;
                }
                else {
                    this.currentIndex++;
                }
            },
        },
    };
</script>

<style scoped>

</style>
