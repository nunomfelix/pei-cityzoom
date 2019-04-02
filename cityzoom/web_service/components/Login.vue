<template>
  <div class="rowc login">
    <img src="icons/sidebar/big_logo.png">
    <form class="rowc">
      <input v-model="username" type="text">
      <input v-model="pw" type="password">
      <button class="btn btn-primary" type="button" v-on:click="login">login</button>
    </form>
  </div>
</template>

<script>
export default {
  data() {
    return {
      username: "skrt2",
      pw: "12345"
    };
  },
  methods: {
    async login() {
      const res = await this.$store.dispatch("user_login", {
        username: this.username,
        password: this.pw
      });
    }
  }
};
</script>

<style lang="scss" scope>
.login {
  margin-top: 200px;

  & form * {
      margin-top: 30px;
  }
}
</style>