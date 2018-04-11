<template>
    <section class="section">
        <div class="container">
            <h1 class="title">Image search</h1>

            <div class="field has-addons">
                <div class="control">
                    <input type="text" class="input" v-model="term" @keyup.enter="search">
                </div>
                <div class="control">
                    <button class="button is-primary" @click="search">search</button>
                </div>
            </div>

            <div v-if="! loading">
                <div class="controls">
                    <nav class="pagination is-rounded" role="navigation" aria-label="pagination">
                        <a class="pagination-previous" @click="prev">Previous</a>
                        <a class="pagination-next" @click="next">Next page</a>
                        <ul class="pagination-list">
                            <li v-for="i in count" :key="i">
                                <a :class="css(i)"
                                    v-text="i"
                                    @click="go(i-1)">
                                </a>
                            </li>
                        </ul>
                    </nav>
                </div>
                <div class="preview">
                    <img v-if="preview" :src="preview" />
                </div>
            </div>
            <div v-else>
                <span>Loading...</span>
            </div>
        </div>
    </section>
</template>

<script>
import { mapState, mapGetters } from 'vuex';

export default {
    data() {
        return {
            term: 'cats',
        };
    },

    created() {
        this.search();
    },

    methods: {
        search() {
            this.$store.dispatch('search', { term: this.term });
        },

        prev() {
            this.$store.dispatch('move', { offset: -1 });
        },

        next() {
            this.$store.dispatch('move', { offset: +1 });
        },

        go(index) {
            this.$store.commit('index', index);
        },

        css(i) {
            const index = i - 1;
            let css = 'pagination-link';

            if (this.current === index) {
                css += ' is-current';
            }

            return css;
        },
    },

    computed: {
        ...mapState({
            loading: 'loader',
            current: 'index',
        }),

        ...mapGetters([
            'preview',
            'count',
        ]),
    },
};
</script>
