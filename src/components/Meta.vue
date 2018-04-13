<script>
export default {
    props: [],

    render(h) {
        return h('h1', 'meta');
    },

    computed: {
        template() {
            return this.$store.state.template;
        },
    },
}
</script>
