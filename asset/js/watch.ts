/* eslint-disable no-undef */
import Vue from 'vue/dist/vue.esm.browser.js';
import TwitchViewer from "./component/TwitchViewer.vue";

import {AxiosError, AxiosInstance} from 'axios';

const axios : AxiosInstance = window["axios"];

Vue.component(TwitchViewer.name, TwitchViewer);

new Vue({
    el: "#app",

    data: {
        channel: "latachegaming",
        points: 0,

        url: "/watch/update",
        pause: false,
        interval: 10000,


    },
    methods: {
        makeRequest() {

            let self = this;

            axios.post(self.url)
                .then((result) => {

                    if (result.data.auth) {
                        self.points = result.data.points;
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

    }

});