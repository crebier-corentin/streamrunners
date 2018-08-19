import Vue from 'vue/dist/vue.esm.browser.js';
import TwitchViewer from "./component/TwitchViewer.vue";

Vue.component(TwitchViewer.name, TwitchViewer);

new Vue({
    el: "#app",

    data: {
        channel: "latachegaming"
    }

});