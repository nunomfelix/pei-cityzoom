<template>
    <form>
        <input v-model="username" type="text">
        <input v-model="pw" type="password">
        <button type="button" v-on:click="login">login</button>
      </form>
</template>

<script>
export default {
    data() {
        return {
            username: 'skrt2',
            pw: '12345',
        }
    },
    methods: {
        async login() {
            const res = await this.$store.dispatch('user_login',{
                username: this.username,
                password: this.pw
            })
        },
    }
}
</script>

<style>

</style>