import Vue from 'vue';
import App from './App.vue';
import './main.scss';
import BootstrapVue from 'bootstrap-vue'



// use bootstrap vue
Vue.use(BootstrapVue)

new Vue(App).$mount('#app');