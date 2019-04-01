<template>
    <form>
        <input v-model="email" type="text">
        <input v-model="pw" type="password">
        <button type="button" v-on:click="register">register</button>
        <lasterror :error="error"/>
      </form>
</template>

<script>
export default {
    data() {
        return {
            email: '',
            pw: '',
            error: ''
        }
       
    },
    methods: {
        async register() {
            const res = await this.$store.dispatch('user_register',{
                email: this.email,
                password: this.pw
            }) 
            if(res && res.error) {
                this.error = res.error.data ? res.error.data : res.error
            }
        },
    }
}
</script>

<style>

</style>