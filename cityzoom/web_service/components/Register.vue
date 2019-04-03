<template>
  <div class="rowc register" :class="{show}">
    <img @load="loaded()" src="icons/sidebar/big_logo.png" :class="{show}">
    <form class="rowc">
      <input v-model="username" type="text">
      <input v-model="pw" type="password">
      <button class="btn btn-primary" type="button" v-on:click="register">REGISTER</button>
      <button class="btn btn-success" type="button">CREATE ACCOUNT</button>
    </form>
  </div>
</template> <script>
export default {
  data() {
    return {
      username: "teste",
      pw: "12345",
      show: false
    };
  },
  methods: {
    async register() {
      const res = await this.$store.dispatch("user_register", {
        username: this.username,
        password: this.pw
      });
    },
    loaded() {
      this.show = true
    }
  },
  mounted() {
  }
};
</script> 

<style lang="scss" scope>
@import "~/assets/mixins.scss";

.register {

  opacity: 0;
  &.show {
    opacity: 1;
  }

  & img {
    @include transition(transform, .4s, ease-out, 0s);
    transform: translateY(-430px);
    &.show {
      transform: translateY(0);
    }
  }
  & form {
    & input {
      margin-top: 15px;
      margin-bottom: 15px;
    }
    & button {
      margin-top: 10px;
    }
  }
}
</style>