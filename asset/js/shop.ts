import Vue from 'vue';
import Shop from "./component/Shop.vue";

Vue.component(Shop.name, Shop);

new Vue({
    el: '#app',
    render: h => h(Shop)
});