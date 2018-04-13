import Vue from 'vue';
import Vuex from 'vuex';
import axios from 'axios';

Vue.use(Vuex);

export default new Vuex.Store({
    strict: true,

    state: {
        template: "<div class='meta'>Meta</div>",
    },

    getters: {
        // getter(state, getters)
    },

    actions: {
        // action({ state, commit }, payload)
    },

    mutations: {
        // mutation(state, payload)
    },
});
