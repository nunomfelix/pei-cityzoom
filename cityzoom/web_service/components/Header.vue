<template>
  <div class="header">
    <div class="rowr header_buttons horizontalMargin">
      <img src="icons/header/logout-512.png" @click="logout()">
    </div>
  </div>
</template>

<script>
export default {
  methods: {
    async logout() {
      await this.$store.dispatch("user_logout");
    }
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
    & img {
      width: 40px;
      @include transition(transform, 0.1s, ease, 0s);
      &:hover {
        transform: scale(1.1);
        cursor: pointer;
        &:active {
          transform: none;
        }
      }
    }
  }
}
</style>
