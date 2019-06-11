<template>
  <div class="header">
    <div class="rowr header_buttons horizontalMargin">
      <div class="bell-wrapper">
        <img src="icons/header/bell.png" @click="alert()">
        <div class="bell-count small">{{alerts.length}}</div>
        <img src="icons/header/logout-512.png" @click="logout()">   
      </div>
    </div>
  </div>
</template> 

<script>
export default {
  data() {
    return {
      alerts: []
    }
  },
  methods: {
    async logout() {
      await this.$store.dispatch("user_logout");
    },
    alert() {
      alert(JSON.stringify(this.alerts.map(a => a.description + ' - ' + a.value)))
    },
  },
  mounted() {
    setInterval(async() => {
      const res = await this.$axios.get('http://localhost:8001/czb/alerts/list')
      for(var alert in res.data) {
        if(alert.active)
          alerts.push(alert)
      }

    }, 5000)
  }
};
</script>

<style lang="scss" scope>
@import "~/assets/mixins.scss";

.header {
  position: fixed;
  top: 0;
  right: 0;
  background-color: rgba(255, 255, 255, 0.918);
  height: $header-height;
  width: 100%;
  z-index: 2222;

  @include row();
  justify-content: flex-end;

  @include shadow(3px, 2px, 5px, 0px, #4d4c4c);

  &_buttons {
    @include flex(center, center);
    height: $header-height;
    & .bell-wrapper {
      position: relative;
      & .bell-count {
        position: absolute;
        background-color: red;
      }
    }
    & img {
      width: 4rem;
      @include transition(transform, 0.1s, ease, 0s);
      &:hover {
        transform: scale(1.1);
        cursor: pointer;
        &:active {
          transform: none;
        }
      }
    }
    & > *:not(:first-child) {
      margin-left: 1.5rem;
    }
  }
}
</style>
