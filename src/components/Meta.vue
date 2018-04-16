<script>
import Vue from 'vue';
import { mapGetters } from 'vuex';

// Anonymous function so it's not usable by user
let _getter = function($store, name) {
    let args = Array.from(arguments).slice(2);

    return $store.getters[name](...args);
}

export default {
    props: {
        // The component we're "tranforming" into
        for: {
            type: String,
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

        this.emit('created', this.key);
    },

    render(h) {
        if (! this.rendering) {
            return h('h1', 'rendering...');
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
            let data = _getter(this.$store, 'instance', this.key);
            let comp = _getter(this.$store, 'computed', this.for, this.id);

            return Object.assign(data, comp);
        },

        component() {
            return _getter(this.$store, 'component', this.for);
        },
    },

    methods: {
        get(name, def) {
            return _getter(this.$store, 'find', this.for, this.id, name, def);
        },

        emit(message, payload) {
            this.$emit(message, payload);
        },

        send(message, payload, componentName, instanceId) {
            if (! componentName) {
                componentName = this.for;
            }

            if (! instanceId) {
                instanceId = this.id;
            }

            this.$store.dispatch('send', {
                componentName,
                instanceId,
                message,
                payload,
            });
        },
    },

    watch: {
        'component.template': {
            immediate: true,
            handler() {
                // Rendering

                // Find template
                let defTemplate = `<div>No template found for '${this.for}'</div>`
                let template    = this.component.template || defTemplate;

                // Compile template
                let compiled       = Vue.compile(template);
                let renderStatic   = compiled.staticRenderFns;
                let templateRender = compiled.render;

                // Update render
                this._staticTrees = [];
                this.rendering    = templateRender;
                this.$options.staticRenderFns = renderStatic;
            },
        },
    },
}
</script>
