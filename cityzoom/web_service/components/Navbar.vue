<template>
  <div
    class="sidebarWrapper"
    :class="{'collapsed': collapsed}"
    @mouseenter="toggleSidebar(false)"
    @mouseleave="toggleSidebar(true)"
  >
    <div class="sidebar">
      <div class="sidebar_row sidebar_header" :class="{'collapsed': collapsed}">
        <div class="big_logo">
          <img @click="homeButton()" src="icons/sidebar/big_logo.png">
        </div>
        <div class="sidebar_row_left">
        </div>
        <div class="sidebar_row_right">
        </div>
      </div>
      <div
        class="sidebar_row"
        v-for="(tab, index) in sidebarTabs"
        :key="index"
        :class="{'selected': currentTab == tab.path}"
        @click="changeTab(tab.path)"
      >
        <div class="sidebar_row_left">
          <img :src="`icons/sidebar/${tab.img}`"/>
        </div>
        <div class="sidebar_row_right"><span class="big">{{tab.name}}</span></div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      sidebarTabs: [
        {
          path: "mapa",
          img: 'dominios.svg',
          name: "Mapa"
        },
        {
          path: "dispositivos",
          img: "dispositivos.svg",
          name: "Devices"
        },
        // {
        //   path: "operacoes",
        //   img: "operacoes.svg",
        //   name: "Operations"
        // },
        {
          path: "notificacoes",
          img: "notificacoes.svg",
          name: "Alarms"
        },
        // {
        //   path: "equipa",
        //   img: "equipa.svg",
        //   name: "Team"
        // },
        {
          path: "definicoes",
          img: "settings.svg",
          name: "Settings"
        }
      ],
      collapsed: true,
      timeout: null,
      currentTab: ""
    };
  },
  computed: {
    iconUrl(icon) {
      return require("~/static/" + icon + ".png");
      // The path could be '../assets/img.png', etc., which depends on where your vue file is
    }
  },
  methods: {
    changeTab(path) {
      this.currentTab = path;
      this.$router.push("/" + path);
    },
    toggleSidebar(bool) {
      if (this.timeout) clearTimeout(this.timeout);
      this.collapsed = bool;
    },
    homeButton() {
      this.currentTab = "";
      this.$router.push("/homepage");
    }
  },
  mounted() {
    setTimeout(() => {
      this.toggleSidebar(false);
      this.timeout = setTimeout(() => {
        this.toggleSidebar(true);
      }, 2000);
    }, 0);
  }
};
</script>

<style lang="scss">
@import "~/assets/mixins.scss";

.sidebarWrapper {
  @include transition(width, 0.3s, ease, 0.005s);
  @include unselectable();
  position: fixed;
  overflow-x: hidden;
  display: flex;
  width: $sidebar-size;
  height: 100%;
  top: 0;
  z-index: 4444;

  &.collapsed {
    width: $sidebar-left-size;
    & > .sidebar .sidebar_row_right {
      opacity: 0;
    }
  }

  @include shadow(3px, 3px, 10px, 0px, #4d4c4c);

  & .sidebar {
    position: relative;
    background-color: #147bdb;
    color: white;

    &_row {
      @include flex(center, center);
      background-color: transparent;

      &.sidebar_header {
        height: 14rem !important;
        background: linear-gradient(to bottom, #0f589c, #147bdb) white;
      }

      & .big_logo {
          position: absolute;
          left: -7px;
          z-index: 5555;
          & img {
            &:hover {
              cursor: pointer;
              transform: scale(1.03);
            }
            height: 10rem;
            width: 26rem;
          }
        }

      &:not(.sidebar_header) {
        &:not(.selected) {
          @include clickable(rgba(0, 2, 121, 0.527));
        }
        height: 6rem;
        font-weight: 700;
        white-space: nowrap;
        & .sidebar_row_right {
          padding-left: 3px;
        }
      }

      &_left {
        @include flex(center, center);
        width: $sidebar-left-size;
        height: 100%;
        & img {
          transform: scale(2);
        }
      }

      &_right {
        @include flex(flex-start, center);
        @include transition(opacity, 0.3s, ease, 0.005s);
        width: $sidebar-right-size;
        height: 100%;
        
      }

      &.selected {
        background-color: darkblue;
      }
    }
  }
}
</style>
