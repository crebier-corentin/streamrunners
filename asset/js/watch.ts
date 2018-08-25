/* eslint-disable no-undef */
import Vue from 'vue/dist/vue.esm.browser.js';
import TwitchViewer from "./component/TwitchViewer.vue";

import axios, {AxiosError} from 'axios';

Vue.component(TwitchViewer.name, TwitchViewer);

new Vue({
    el: "#app",

    data: {
        points: 0,

        url: "/watch/update",
        pause: false,
        interval: 3000,

        queue: [],


    },

    computed: {
        currentStream() {
            if (this.queue.length > 0) {
                return this.queue[0];
            }
            else {
                return null;
            }
        },

        channel() {
            if (this.currentStream != null) {
                return this.currentStream.user.username;
            }
            else {
                return null;
            }
        },

        timeLeft() {
            if (this.currentStream != null) {
                return this.currentStream.time - this.currentStream.current;
            }
            else {
                return 0;
            }
        }

    },

    methods: {
        makeRequest() {

            let self = this;

            axios.post(self.url)
                .then((result) => {

                    if (result.data.auth) {
                        self.points = result.data.points;
                        self.queue = result.data.queue;
                    }
                    else {
                        location.reload();
                    }

                    //Make new Request
                    setTimeout(self.makeRequest, self.interval);

                })
                .catch((error: AxiosError) => {

                    console.log(error.response);

                    //Make new Request
                    setTimeout(self.makeRequest, self.interval);

                });


        }
    },

    mounted() {

        this.makeRequest();

    },


});