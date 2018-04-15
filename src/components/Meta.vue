<script>
import Vue from 'vue';

export default {
    props: {
        // The component we're "tranforming" into
        for: {
            type:     String,
            required: true,
        },
    },

    data() {
        return {
            // Render function
            rendering: null,
        };
    },

    created() {
        this.$store.commit('create', this);
    },

    render(h) {
        if (! this.rendering) {
            return h('h1', 'loading...');
        }

        return this.rendering();
    },

    computed: {
        id() {
            return this._uid;
        },

        instance() {
            return this.$store.state.instances[this.for][this.id];
        },

        component() {
            let component = this.$store.state.components[this.for];

            if (! component) {
                return {};
            }

            return component.component;
        },
    },

    methods: {
        get(name) {
            return this.instance.data[name];
        },

        send(message, payload) {
            this.$store.dispatch('send', {
                componentName:  this.for,
                instanceId:     this.id,

                message,
                payload,
            });
        },

        // @TODO: don't access it outside
        render() {
            let defTemplate = `<div>No template found for '${this.for}'</div>`
            let template    = this.component.template || defTemplate;

            // @TODO: catch template compiling errors
            let compiled       = Vue.compile(template);
            let renderStatic   = compiled.staticRenderFns;
            let templateRender = compiled.render;

            // Update render
            this._staticTrees = [];
            this.rendering    = templateRender;
            this.$options.staticRenderFns = renderStatic;
        },
    },

    watch: {
        template: {
            immediate: true,
            handler() {
                this.render();
            },
        },
    },
}
</script>
