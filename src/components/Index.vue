<template>
    <section class="section">
        <div class="container">
            <meta-component for="counter"></meta-component>
            <!-- <meta-component for="light"></meta-component> -->
        </div>
    </section>
</template>

<script>
import meta from '@/components/Meta';

export default {
    components: {'meta-component': meta},

    created() {},

    data() {
        return {};
    },
}
</script>
