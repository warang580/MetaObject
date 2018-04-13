<template>
    <div class="container">
        <button>0</button>

        <meta-component

        ></meta-component>
    </div>
</template>

<script>
import meta from '@/components/Meta';

export default {
    components: {'meta-component': meta},

    created() {
    },

    data() {
        return {};
    },
}
</script>
