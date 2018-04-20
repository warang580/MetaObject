<template>
    <div id="playground">
        <div class="container">
            Components:

            <button v-for="component in components"
                :class="'button ' + (editing == component.name ? 'is-active':'')"
                v-text="component.name"
                @click="edit(component.name)"
            ></button>

            <div class="controls">
                <div class="field has-addons">
                    <div class="control">
                        <input class="input" type="text" v-model="componentName" placeholder="Component name"/>
                    </div>
                    <div class="control">
                        <button class="button is-primary" @click="create()">Create component</button>
                    </div>
                </div>
            </div>
        </div>

        <div id="overview" class="container">
            <div is="meta-component"
                v-for="component in components"
                :for="component.name"
                v-show="editing == component.name"
            ></div>
        </div>

        <div v-if="editing" class="container">
            <textarea class="textarea" v-model="template"></textarea>
            <button class="button is-primary" @click="save()">Save template</button>
        </div>
    </div>
</template>

<script>
export default {
    data() {
        return {
            componentName: "",

            editing: "stage",

            template: "",
        };
    },

    computed: {
        components() {
            let components = this.$store.state.components;
            let names = Object.keys(components);

            return names.map((name) => {
                return {
                    name,
                    component: components[name],
                };
            });
        },
    },

    methods: {
        create() {
            this.$store.dispatch('create', {
                componentName: this.componentName
            });

            this.componentName = "";
        },

        edit(component) {
            this.editing = component;
        },

        save() {
            let previous  = this.$store.getters.component(this.editing);
            let next      = Object.assign({}, previous);

            // Update only template for now
            next.template = this.template;

            this.$store.dispatch('update', {
                componentName: this.editing,
                component: next,
            });
        },
    },

    watch: {
        editing() {
            if (! this.editing) {
                return;
            }

            this.template = this.$store.state.components[this.editing].template;
        },
    },
}
</script>

<style scoped>
    #overview {
        border: 1px dashed #eee;

        padding: 1em;
    }
</style>
