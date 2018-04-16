<script>
import Vue from 'vue';
import { mapGetters } from 'vuex';

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

        this.$bus.$emit(this.key, {
            method: 'created',
        });
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

        key() {
            return `${this.for}#${this.id}`;
        },

        instance() {
            return this.getInstance()(this.key);
        },

        component() {
            return this.getComponent()(this.for);
        },
    },

    methods: {
        ...mapGetters({
            getComponent:    'component',
            getInstance:     'instance',
            getInstanceData: 'instanceData',
        }),

        get(name, def) {
            return this.getInstanceData()(this.key, name, def);
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
