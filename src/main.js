import Vue from 'vue';
import axios from 'axios';
import dotenv from 'dotenv';

import App from './App';
import router from './router';
import store from './store';

import './assets/sass/main.scss';

dotenv.config();

Vue.config.productionTip = false;
Vue.prototype.$http = axios;


/* eslint-disable no-new */
new Vue({
    el: '#app',
    router,
    store,
    components: { App },
    template: '<App/>',
});
