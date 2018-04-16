<template>
    <div id="playground">
        <section class="section">
            <div class="container">
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
    created() {},

    data() {
        return {
            template: `<div class='stage'>
    <meta-component for="counter"></meta-component>
</div>`,
            counterTemplate: `<div class='meta'>
    <button class="button is-info" @click="send('increment')" v-text="get('count', -1)"></button>
</div>`,
        };
    },

    methods: {
        save(componentName, newTemplate) {
            let component = Object.assign({}, this.$store.getters.component(componentName));

            component.template = newTemplate;

            console.log("save");
            this.$store.dispatch('update', {componentName, component});
        },
    },
}
</script>
