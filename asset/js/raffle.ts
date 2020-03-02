import Raffle from './component/Raffle.vue';
import Vue from 'vue';
import axios, { AxiosResponse } from 'axios';
import swal from 'sweetalert2';

new Vue({
    el: '#app',

    components: { Raffle },

    data() {
        return {
            points: 0,
            raffles: [],
        };
    },

    methods: {
        async buy(raffleId, amount) {

            const swalRes = await swal.fire({
                title: `Acheter ${amount} ticket${amount > 1 ? 's' : ''}?`,
                icon: 'question',
                showCancelButton: true,
                cancelButtonText: 'Annuler',
                confirmButtonText: 'Acheter',
                showLoaderOnConfirm: true,
                preConfirm: () => {
                    return axios.post('/raffle/buy', { raffleId, amount });
                },
                allowOutsideClick: () => !swal.isLoading(),
            });


            if (swalRes.value != undefined) {

                const response = <AxiosResponse>swalRes.value;

                this.points = response.data.points;
                this.raffles = response.data.raffles;

                swal.fire({
                    icon: 'success',
                    title: `Ticket${amount > 1 ? 's' : ''} acheté${amount > 1 ? 's' : ''} avec succès !`,
                    timer: 2000,
                });
            }


        },
    },

    mounted() {
        this.points = window['defaultPoints'];
        this.raffles = window['defaultRaffles'];
    },
});
