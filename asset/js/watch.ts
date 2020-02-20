/* eslint-disable no-undef */

import Vue from 'vue/dist/vue.esm.js';
import TwitchViewer from './component/TwitchViewer.vue';
import Chat from './component/Chat.vue';

import axios, { AxiosError } from 'axios';
import swal from 'sweetalert2';
import { intervalWait } from '../../src/shared/shared-utils';

window['swal'] = swal;

Vue.component(TwitchViewer.name, TwitchViewer);
Vue.component(Chat.name, Chat);

window['vm'] = new Vue({
    el: '#app',

    data: {
        points: 0,

        updateUrl: '/watch/update',
        addUrl: '/watch/add',
        deleteUrl: '/watch/delete',
        skipUrl: '/watch/skip',

        isPaused: false,
        interval: 1000,

        queue: [],

        viewers: [],
        mostPoints: [],
        mostPlace: [],
        messages: [],

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

        queueLength() {
            return this.queue.length;
        },

        positions(): Array<number> {

            const result = [];

            this.queue.forEach((q, index) => {
                if (q.user.username == window['username']) {
                    result.push(index + 1);
                }
            });

            return result;

        },

        positionsText(): string {
            let str = '';
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
        },

    },

    methods: {

        updateData(data) {
            if (data.auth) {
                this.points = data.points;
                this.queue = data.queue;
                this.viewers = data.viewers;
                this.mostPoints = data.mostPoints;
                this.mostPlace = data.mostPlace;
                this.messages = data.messages;
            }
            else {
                location.reload();
            }
        },

        async makeRequestUpdate() {
            //Assure that player is not paused
            if (this.isPaused) return;

            const result = await axios.post(this.updateUrl);
            this.updateData(result.data);
        },

        async makeRequestAdd() {

            const swalRes = await swal({
                title: 'Acheter une place?',
                text: '1 000 points pour 10 minutes. \n Si la queue est vide la place est gratuite !',
                type: 'warning',
                showCancelButton: true,
                confirmButtonText: 'Oui',
                cancelButtonText: 'Non',

            });
            //Ignore if user clicked no
            if (!swalRes.value) return;

            const res = await axios.post(this.addUrl);

            //Check if enough points
            if (res.data.enough) {
                //Success
                swal({
                    title: 'Vous avez acheté une place !',
                    type: 'success',
                });

            }
            else {
                //Error
                swal({
                    title: 'Vous n\'avez pas assez de points.',
                    text: `Vous avez ${res.data.points} points. \n La place coûte ${res.data.cost} points.`,
                    type: 'error',
                });

            }

        },

        async makeRequestDelete(id: string) {

            const swalRes = await swal({
                title: 'Supprimer ça place ?',
                text: 'Vous serez remboursé',
                type: 'warning',
                showCancelButton: true,
                confirmButtonText: 'Oui',
                cancelButtonText: 'Non',

            });
            //Ignore if user clicked no
            if (!swalRes.value) return;

            const res = await axios.post(this.deleteUrl, { id: id });

            if (res.data.success) {

                //Success
                swal({
                    title: 'Vous avez supprimé votre place !',
                    type: 'success',
                });
            }
            else {

                //Error
                swal({
                    type: 'error',
                    title: 'Erreur',
                });

            }


        },

        async makeRequestSkip() {
            const swalRes = await swal({
                title: 'Passer ?',
                type: 'warning',
                showCancelButton: true,
                confirmButtonText: 'Oui',
                cancelButtonText: 'Non',

            });
            //Ignore if user clicked no
            if (!swalRes.value) return;

            try {
                await axios.post(this.skipUrl);
                swal({
                    title: 'Stream passé',
                    type: 'success',
                });

            }
            catch (e) {
                swal({
                    title: e.response.data,
                    type: 'error',
                });
            }

        },
    },

    mounted() {
        intervalWait(this.interval, this.makeRequestUpdate.bind(this));
    },


});
