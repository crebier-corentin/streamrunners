import Raffle from './component/Raffle.vue';
import Vue from 'vue';
import axios from 'axios';

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
            const response = await axios.post('/raffle/buy', { raffleId, amount });

            this.points = response.data.points;
            this.raffles = response.data.raffles;
        },
    },

    mounted() {
        this.points = window['defaultPoints'];
        this.raffles = window['defaultRaffles'];
    },
});
