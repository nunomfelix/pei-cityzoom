<template>
    <form>
        <input v-model="email" type="text">
        <input v-model="pw" type="password">
        <button type="button" v-on:click="login">login</button>
        <lasterror :error="error"/>
      </form>
</template>

<script>
export default {
    data() {
        return {
            email: 'test2@gmail.com',
            pw: 'test123',
            error: ''
        }
    },
    methods: {
        async login() {
            const res = await this.$store.dispatch('user_login',{
                email: this.email,
                password: this.pw
            })
            if(res && res.response) { 
                this.error = res.response.data ? res.response.data : res.response
            }
        },
    }
}
</script>

<style>

</style>
