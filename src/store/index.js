import Vue from 'vue';
import Vuex from 'vuex';
import axios from 'axios';

Vue.use(Vuex);

export default new Vuex.Store({
    strict: true,

    state: {
        loader: false,

        images: [],

        index: 0,
    },

    getters: {
        image(state) {
            return state.images[state.index];
        },

        count(state) {
            return state.images ? state.images.length : 0;
        },

        preview(state, getters) {
            const image = getters.image;

            if (!image) {
                return '';
            }

            return image.webformatURL;
        },
    },

    // Async commits
    actions: {
        search({ commit }, { term, nb }) {
            commit('index', 0);

            const url = 'https://pixabay.com/api/';
            const key = '8658264-1f077cd1cf64865031ea18988';
            const params = {
                key,
                q: term,
                per_page: nb,
                image_type: 'photo',
                orientation: 'horizontal',
                order: 'latest',
                editors_choice: true,
            };

            commit('loader', true);
            axios.get(url, { params }).then((response) => {
                commit('images', response.data.hits);
                commit('loader', false);
            });
        },

        move({ state, commit }, { offset }) {
            commit('index', state.index + offset);
        },
    },

    // Sync changes
    mutations: {
        loader(state, loading) {
            state.loader = loading;
        },

        images(state, images) {
            state.images = images;
        },

        index(state, index) {
            const max = Math.max(0, state.images.length - 1);
            let i = index;

            if (i < 0) {
                i = 0;
            }

            if (i > max) {
                i = max;
            }

            state.index = i;
        },
    },
});
