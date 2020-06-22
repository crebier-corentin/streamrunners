import { sleep } from '../../src/shared/shared-utils';
import Vue from 'vue/dist/vue.esm.js';
import StreamerPartners from './component/StreamerPartners.vue';


window['countdown'] = async function countdown(el: HTMLElement, countStart: number, countEnd: number, seconds: number = 20): Promise<void> {

    const interval = Math.ceil((seconds * 1000) / countEnd);
    let count = countStart;

    while (count < countEnd) {
        await sleep(interval);
        el.innerText = (++count).toString();
    }

};

//Partners
Vue.component(StreamerPartners.name, StreamerPartners);

new Vue({
    el: '#partners',

    data() {
        return {
            streamerPartners: [],
        };
    },

    created() {
        this.streamerPartners = window['defaultStreamerPartners'];
    },
});
