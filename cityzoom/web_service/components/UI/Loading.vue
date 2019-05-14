<template>
    <div v-if="show" :style="{'height': type == 'absolute' ? 0 : height ? height : '100%'}">
        <div :class="{'lds-roller-relative': type == 'relative', 'lds-roller-fixed': type == 'fixed', 'lds-roller-absolute': type == 'absolute'}">
            <div class="lds-roller">
                <div></div>
                <div></div>
                <div></div>
                <div></div>
                <div></div>
                <div></div>
                <div></div>
                <div></div>
            </div>
        </div>
    </div>
</template>

<script>
export default {
    props: {
        show: Boolean,
        type: String,
        height: String,
    }
}
</script>

<style>

</style>
