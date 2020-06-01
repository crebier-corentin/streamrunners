<template>
    <div class="card mb-4 shadow-sm">
        <div class="card-header">
            <h4 class="my-0 font-weight-normal">{{ info.title }}</h4>
            <small class="countdown">{{ remainingTime }}</small>
        </div>
        <div class="card-body">
            <img style="max-width: 100%;" :src="info.icon" height="250px" alt="icon" />

            <p v-html="info.description"></p>

            <p>{{ info.price }} points / <i style="color:#FDEE00" class="fas fa-ticket-alt"></i></p>


            <div class="d-flex justify-content-around">

                <!-- Max -->
                <button type="submit" class="btn btn-primary" @click="maxTickets">
                    Max
                </button>

                <!-- Amount -->
                <div>
                    <div class="input-group">
                        <input id="amount"
                               name="amount"
                               type="number"
                               class="form-control"
                               min="1"
                               v-model.number="amount">
                        <div class="input-group-append">
                            <div class="input-group-text">
                                <i class="fas fa-ticket-alt"></i>
                            </div>
                        </div>
                    </div>
                </div>


            </div>

            <!-- Buy button -->
            <button type="submit" class="btn btn-lg btn-block btn-primary boutique" @click="buy" :disabled="error">
                Acheter
            </button>


            <small>{{ info.userTickets }} ticket {{ info.ticketCount > 1 ? 's' : '' }}
                / {{ info.maxTickets <= 0 ? '∞' : info.maxTickets }}</small>
            <small class="d-block">{{ info.totalTickets }} ticket au total</small>
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

                amount: 1,
            };
        },

        computed: {
            userTickets(): number {
                return this.info.userTickets + this.amount;
            },
            price(): number {
                return this.info.price * this.amount;
            },

            errorMessage(): string | null {
                //Max tickets
                if (this.info.maxTickets > 0 && this.userTickets > this.info.maxTickets) return 'Nombre de tickets maximum atteint';
                //Not enough points
                else if (this.points < this.price) return 'Pas assez de points';

                return null;
            },

            error(): boolean {
                return this.errorMessage != null;
            },
        },

        methods: {
            buy(): void {
                this.$emit('buy', this.info.id, this.amount, this.price);
            },

            maxTickets(): void {
                const maxBuyableWithPoints = Math.floor(this.points / this.info.price);
                const maxBuyableWithTicketLimit = this.info.maxTickets > 0 ? this.info.maxTickets - this.info.userTickets : Infinity;
                this.amount = Math.max(Math.min(maxBuyableWithTicketLimit, maxBuyableWithPoints), 1); //Minimum 1
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
