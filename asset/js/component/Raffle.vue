<template>
    <div class="card mb-4 shadow-sm">
        <div class="card-header">
            <h4 class="my-0 font-weight-normal">{{ info.title }}</h4>
            <small class="countdown">{{ remainingTime }}</small>
        </div>
        <div class="card-body">
            <img :src="info.icon" height="250px" alt="icon" />

            <p v-html="info.description"></p>

            <!-- Buy button -->
            <button type="submit"
                    class="btn btn-lg btn-block btn-primary boutique"
                    @click="$emit('buy', info.id)"
                    :disabled="error">{{
                info.price }}
                points /
                <i style="color:#FDEE00" class="fas fa-ticket-alt"></i></button>


            <small>{{ info.userTickets }} ticket{{ info.ticketCount > 1 ? 's' : '' }}
                / {{ info.maxTickets <= 0 ? '∞' : info.maxTickets }}</small>
            <small class="d-block">{{ info.totalTickets }} tickets au total</small>
            <small class="d-block text-danger" v-if="error">{{ errorMessage }}</small>

        </div>
    </div>
</template>

<script lang="ts">
    import Vue from 'vue';
    import { RaffleEntityExtra } from '../../../src/raffle/raffle.entity';
    import { formatDuration } from '../../../src/shared/shared-utils';
    import moment = require('moment');

    export default Vue.extend({
        name: 'Raffle',

        props: {
            points: {
                type: Number,
                required: true,
            },
            info: {
                type: Object as () => RaffleEntityExtra,
                required: true,
            },
        },

        data() {
            return {
                endingDate: null,
                remainingTime: '',
            };
        },

        computed: {
            errorMessage(): string | null {
                //Max tickets
                if (this.info.maxTickets > 0 && this.info.userTickets == this.info.maxTickets) return 'Nombre de tickets maximum atteint';
                //Not enough points
                else if (this.points < this.info.price) return 'Pas assez de points';

                return null;
            },

            error(): boolean {
                return this.errorMessage != null;
            },
        },

        mounted(): void {

            this.endingDate = moment(this.info.endingDate);

            setInterval(() => {
                this.remainingTime = formatDuration(moment.duration(this.endingDate.diff(moment())));
            }, 1000);
        },
    });
</script>

<style scoped>

</style>
