import Vue from 'vue';
import axios from 'axios';

import App from './App';
import router from './router';
import store from './store';

import './assets/sass/main.scss';

Vue.config.productionTip = false;

Vue.prototype.$http = axios;
Vue.prototype.$bus  = new Vue();

/* eslint-disable no-new */
new Vue({
    el: '#app',
    router,
    store,
    components: { App },
    template: '<App/>',
});
