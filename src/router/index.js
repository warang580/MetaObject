import Vue from 'vue';
import Router from 'vue-router';
import Playground from '@/components/Playground';

Vue.use(Router);

export default new Router({
    routes: [
        {
            path: '/',
            name: 'Playground',
            component: Playground,
        },
    ],
});
