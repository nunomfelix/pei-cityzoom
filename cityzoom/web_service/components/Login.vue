<template>
  <div class="rowc forms big" :class="{show}">
    <img @load="loaded()" src="icons/sidebar/big_logo.png" :class="{show}">
    <div style="position: relative; width: 100%; height: 600px; overflow-x: hidden;">
      <form :class="{'show': !currentForm}" v-on:submit.prevent="login" class="rowc login">
        <label for="username">Enter your username</label>
        <input class="input_cancel" name="username" v-model="username" type="text" required>
        <label for="password">Enter your password</label>
        <input id="username_focus" class="input_cancel" name="password" v-model="pw" type="password" required>
        <button class="btn btn-success mt-4" type="submit">LOGIN</button>
        <button v-on:click="currentForm = 1; message='';" class="btn btn-primary" type="button">CREATE ACCOUNT</button>
        <div :class="{'show':message != ''}" class="alert">{{message}}</div>
      </form>
      <form :class="{'show': currentForm}" v-on:submit.prevent="register" class="rowc register">
        <label for="name">Enter your name</label>
        <input class="input_cancel" name="name" v-model="name" type="text" required>
        <label for="username_r">Enter a username</label>
        <input class="input_cancel" name="username_r" v-model="username_r" type="text" required>
        <label for="email">Enter your email address</label>
        <input class="input_cancel" name="email" v-model="email" type="email" required>
        <label for="password_r">Enter a password</label>
        <input class="input_cancel" name="password_r" v-model="pw_r" type="password" required>
        <button class="btn btn-success mt-4" type="submit">REGISTER</button>
        <button v-on:click="currentForm = 0; message='';" class="btn btn-primary" type="button">SIGN IN</button>
        <div :class="{'show':message != ''}" class="alert">{{message}}</div>
      </form>
    </div>
  </div>
</template> <script>
export default {
  data() {
    return {
      username: "",
      pw: "",

      name: "",
      username_r: "",
      pw_r: "",
      email: "",

      message: '',

      show: false,
      currentForm: 0
    };
  },
  methods: {
    async login() {
      const res = await this.$store.dispatch("user_login", {
        username: this.username,
        password: this.pw
      });
      this.message = res
      const alerts = document.getElementsByClassName('alert')
      for(var i of alerts) {
        i.style.backgroundColor = "red";
      }
    },
    async register() {
      const res = await this.$store.dispatch("user_register", {
        name: this.name,
        username: this.username_r,
        email: this.email,
        password: this.pw_r
      });
      if(res.content) {
        this.currentForm = 0;
        setTimeout(() => {
          this.message = res.content
        },300)
        this.username = res.username
        this.pw = ''
        const alerts = document.getElementsByClassName('alert')
        for(var i of alerts) {
          i.style.backgroundColor = "darkblue";
        }
        document.getElementById('username_focus').focus()
      } else {
        this.message = res
        const alerts = document.getElementsByClassName('alert')
        for(var i of alerts) {
          i.style.backgroundColor = "red";
        }
      }
    },
    loaded() {
      this.show = true;
    }
  },
  computed: {
  },
  mounted() {
      const inputs = document.getElementsByClassName('input_cancel')
      for(var i of inputs) {
        i.addEventListener('input', () => {
          this.message = ''
        })
      }
    }
};
</script> 

<style lang="scss" scope>
@import "~/assets/mixins.scss";

.forms {
  opacity: 0;
  &.show {
    opacity: 1;
  }

  & img {
    @include transition(transform, 0.4s, ease-out, 0s);
    transform: translateY(-430px);
    &.show {
      transform: translateY(0);
    }
  }
  & form {
    @include transition(transform, 0.25s, ease-out, 0s);

    & .alert {
      @include shadow(0px, 0px, 10px, 0px, #4d4c4c);
      text-align: center;
      width: 380px;
      border-radius: 10px;
      font-weight: 700;
      color: white;
      opacity: 0;
      background-color: red;
      margin-top: 35px;
      &.show {
        @include transition(opacity, 0.25s, ease-out, 0s);
        opacity: 1;
      }
    }

    &.register {
      position: absolute;
      left: 50%;
      transform: translate(-50%, 0%);
      &:not(.show) {
        transform: translate(-50%, 0%) translateX(calc(100vw));
      }
    }

    &.login {
      position: absolute;
      left: 50%;
      transform: translate(-50%, 0%);
      &:not(.show) {
        transform: translate(-50%, 0%) translateX(calc(-100vw));
      }
    }

    & label {
      font-weight: 700;
      color: white;
      margin-top: 15px;
      margin-bottom: 0;
    }
    & input {
      text-align: center;
      margin-bottom: 15px;
    }
    & button {
      margin-top: 10px;
    }
  }
}
</style>