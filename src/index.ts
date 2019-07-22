import Vue from 'vue';
import App from './App.vue';
import './main.scss';
import BootstrapVue from 'bootstrap-vue';
import Vue2TouchEvents from 'vue2-touch-events';



// use bootstrap vue
Vue.use(BootstrapVue);
Vue.use(Vue2TouchEvents);

/**
 * Entry for Vue application.
 */
new Vue({
    el: '#app',
    render: h => h(App)
});