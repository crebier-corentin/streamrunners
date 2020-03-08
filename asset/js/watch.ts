import Vue from 'vue/dist/vue.esm.js';
import TwitchViewer from './component/TwitchViewer.vue';
import Chat from './component/Chat.vue';

import axios, { AxiosError } from 'axios';
import swal from 'sweetalert2';
import { sleep } from '../../src/shared/shared-utils';
import { updatePoints } from './points';

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

                //Update points on navbar
                updatePoints(this.points);
            }
            else {
                location.reload();
            }
        },

        async makeRequestUpdate() {
            //Assure that player is not paused when there's a stream
            if (this.currentStream != null && this.isPaused) return;

            const result = await axios.post(this.updateUrl);
            this.updateData(result.data);
        },

        async makeRequestAdd() {

            const swalRes = await swal.fire({
                title: 'Acheter une place?',
                text: '1 000 points pour 10 minutes. \n Si la queue est vide la place est gratuite !',
                icon: 'warning',
                showCancelButton: true,
                confirmButtonText: 'Oui',
                cancelButtonText: 'Non',

            });
            //Ignore if user clicked no
            if (!swalRes.value) return;

            try {

                await axios.post(this.addUrl);

                swal.fire({
                    title: 'Vous avez acheté une place !',
                    icon: 'success',
                });

            }
            catch (e) {
                //Error
                swal.fire({
                    title: e.response.data.title,
                    text: e.response.data.message,
                    icon: 'error',
                });
            }

        },

        async makeRequestDelete(id: string) {

            const swalRes = await swal.fire({
                title: 'Supprimer ça place ?',
                text: 'Vous serez remboursé',
                icon: 'warning',
                showCancelButton: true,
                confirmButtonText: 'Oui',
                cancelButtonText: 'Non',

            });
            //Ignore if user clicked no
            if (!swalRes.value) return;

            const res = await axios.post(this.deleteUrl, { id: id });

            if (res.data.success) {

                //Success
                swal.fire({
                    title: 'Vous avez supprimé votre place !',
                    icon: 'success',
                });
            }
            else {

                //Error
                swal.fire({
                    icon: 'error',
                    title: 'Erreur',
                });

            }


        },

        async makeRequestSkip() {
            const swalRes = await swal.fire({
                title: 'Passer ?',
                icon: 'warning',
                showCancelButton: true,
                confirmButtonText: 'Oui',
                cancelButtonText: 'Non',

            });
            //Ignore if user clicked no
            if (!swalRes.value) return;

            try {
                await axios.post(this.skipUrl);
                swal.fire({
                    title: 'Stream passé',
                    icon: 'success',
                });

            }
            catch (e) {
                swal.fire({
                    title: e.response.data,
                    icon: 'error',
                });
            }

        },
    },

    async mounted() {
        //Repeat the request indefinitely
        while (true) {
            try {
                await this.makeRequestUpdate();
            }
            catch (e) {
                console.error(e);
            }

            await sleep(this.interval);
        }
    },


});
