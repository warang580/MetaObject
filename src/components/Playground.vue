<template>
    <div id="playground">
        <section class="section">
            <div id="stage" class="container">
                <meta-component for="stage"></meta-component>
            </div>
        </section>
        <section class="section">
            <div class="container">
                <textarea class="textarea" v-model="template"></textarea>
                <button class="button is-primary" @click="save('stage', template)">Save stage</button>
            </div>
        </section>
        <section class="section">
            <div class="container">
                <textarea class="textarea" v-model="counterTemplate"></textarea>
                <button class="button is-primary" @click="save('counter', counterTemplate)">Save counter</button>
            </div>
        </section>
    </div>
</template>

<script>
export default {
    created() {
        this.template        = this.$store.state.components.stage.template;
        this.counterTemplate = this.$store.state.components.counter.template;
    },

    data() {
        return {
            template: "",
            counterTemplate: "",
        };
    },

    methods: {
        save(componentName, newTemplate) {
            let component = Object.assign({}, this.$store.getters.component(componentName));

            component.template = newTemplate;

            this.$store.dispatch('update', {componentName, component});
        },
    },
}
</script>
