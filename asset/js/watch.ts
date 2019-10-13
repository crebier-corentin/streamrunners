/* eslint-disable no-undef */

import Vue from 'vue/dist/vue.esm.js';
import TwitchViewer from "./component/TwitchViewer.vue";
import Leaderboard from "./component/Leaderboard.vue";

import axios, {AxiosError} from 'axios';
import swal from 'sweetalert2';

window['swal'] = swal;

Vue.component(TwitchViewer.name, TwitchViewer);
Vue.component(Leaderboard.name, Leaderboard);

window['vm'] = new Vue({
    el: "#app",

    data: {
        points: 0,

        updateUrl: "/watch/update",
        addUrl: "/watch/add",
        deleteUrl: "/watch/delete",
        skipUrl: "/watch/skip",

        pause: false,
        interval: 1000,

        queue: [],

        viewers: 0,
        mostPoints: [],
        mostPlace: [],

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
        },

        queueLenght() {
            return this.queue.length;
        },

        positions(): Array<number> {

            let result = [];

            this.queue.forEach((q, index) => {
                if (q.user.twitchId == window['twitchId']) {
                    result.push(index + 1);
                }
            });

            return result;

        },

        positionsText(): string {
            let str = "";
            this.positions.forEach((p, index) => {
                //If last
                if (index + 1 === this.positions.length) {
                    str += p;
                }
                else {
                    str += `${p}, `;
                }

            });

            return str;
        }

    },

    methods: {
        makeRequestUpdate() {

            let self = this;

            axios.post(self.updateUrl)
                .then((result) => {

                    if (result.data.auth) {
                        self.points = result.data.points;
                        self.queue = result.data.queue;
                        self.viewers = result.data.viewers;
                        self.mostPoints = result.data.mostPoints;
                        self.mostPlace = result.data.mostPlace;
                    }
                    else {
                        location.reload();
                    }

                    //Make new Request
                    setTimeout(self.makeRequestUpdate, self.interval);

                })
                .catch((error: AxiosError) => {

                    console.log(error.response);

                    //Make new Request
                    setTimeout(self.makeRequestUpdate, self.interval);

                });


        },

        makeRequestAdd() {

            swal({
                title: 'Acheter une place?',
                text: '1 000 points pour 10 minutes. \n Si la queue est vide la place est gratuite !',
                type: 'warning',
                showCancelButton: true,
                confirmButtonText: 'Oui',
                cancelButtonText: 'Non'

            }).then((result) => {

                if (result.value) {
                    let self = this;
                    return axios.post(self.addUrl);
                }

            }).then((result) => {

                //Check if auth
                if (result.data.auth) {

                    //Check if enough points
                    if (result.data.enough) {
                        //Success
                        swal({
                            title: "Vous avez acheté une place !",
                            type: "success"
                        });

                    }
                    else {
                        //Error
                        swal({
                            title: "Vous n'avez pas assez de points.",
                            text: `Vous avez ${result.data.points} points. \n La place coûte ${result.data.cost} points.`,
                            type: "error"
                        });

                    }


                }
                else {
                    location.reload();
                }

            })
                .catch((error: AxiosError) => {
                    console.log(error.response);
                });


        },

        makeRequestDelete(id: string) {

            swal({
                title: 'Supprimer ça place ?',
                text: 'Vous serez remboursé',
                type: 'warning',
                showCancelButton: true,
                confirmButtonText: 'Oui',
                cancelButtonText: 'Non'

            }).then((result) => {

                if (result.value) {
                    let self = this;
                    return axios.post(self.deleteUrl, {id: id});
                }
                else {
                    return Promise.reject('cancel');
                }

            }).then((result) => {

                //Check if auth
                if (result.data.auth) {

                    if (!result.data.error) {

                        //Success
                        swal({
                            title: "Vous avez supprimé votre place !",
                            type: "success"
                        });
                    }
                    else {

                        //Error
                        swal({
                            type: "error",
                            title: "Erreur",
                            text: result.data.errorMessage
                        });

                    }
                }
                else {
                    location.reload();
                }

            })
                .catch((error: AxiosError | "cancel") => {

                    if (error !== "cancel") {

                        swal({
                            type: "error",
                            title: "Erreur"
                        });
                        console.log(error.response);
                    }
                });


        },

        makeRequestSkip() {
            let result = swal({
                title: 'Passer ?',
                type: 'warning',
                showCancelButton: true,
                confirmButtonText: 'Oui',
                cancelButtonText: 'Non'

            }).then((result) => {

                if (result.value) {
                    let self = this;
                    return axios.post(self.skipUrl);
                }

            }).then((result) => {

                swal({
                    title: result.data,
                    type: "success"
                });


            })
                .catch((error: AxiosError) => {

                    swal({
                        title: error.response.data,
                        type: "error"
                    });

                    console.log(error.response);
                });
        }
    },

    mounted() {

        this.makeRequestUpdate();
        //this.makeRequestAdd();

    },


});
