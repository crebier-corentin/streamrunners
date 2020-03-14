import { sleep } from '../../src/shared/shared-utils';
import Vue from 'vue/dist/vue.esm.js';
import VueSlickCarousel = require('vue-slick-carousel/dist/vue-slick-carousel.common.js');

window['countdown'] = async function countdown(el: HTMLElement, countStart: number, countEnd: number, seconds: number = 20): Promise<void> {

    const interval = Math.ceil((seconds * 1000) / countEnd);
    let count = countStart;

    while (count < countEnd) {
        await sleep(interval);
        el.innerText = (++count).toString();
    }

};

//Partners
new Vue({
    el: '#partners',
    components: { VueSlickCarousel },
});
