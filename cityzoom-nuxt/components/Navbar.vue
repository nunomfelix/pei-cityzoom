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
          <img @click="homeButton()" src="~/static/icons/sidebar/big_logo.png">
        </div>
        <div class="sidebar_row_left">
          <!-- <div class="small_logo">
            <img @click="homeButton()" src="~/static/icons/sidebar/logo.png">
          </div> -->
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
        <div class="sidebar_row_right">{{tab.name}}</div>
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
          path: "dominios/metrica",
          img: 'dominios.png',
          name: "Domínios"
        },
        {
          path: "dispositivos",
          img: "dispositivos.png",
          name: "Dispositivos"
        },
        {
          path: "operacoes",
          img: "operacoes.png",
          name: "Operações"
        },
        {
          path: "notificacoes",
          img: "notificacoes.png",
          name: "Notificações"
        },
        {
          path: "equipa",
          img: "equipa.png",
          name: "Equipa"
        },
        {
          path: "definicoes",
          img: "settings.png",
          name: "Definições"
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
      this.router.navigate(["/homepage"]);
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
$sidebar-size: 260px;
$sidebar-left-size: 80px;
$sidebar-right-size: 180px;
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

  box-shadow: 3px 3px 10px 0px #4d4c4c;
  -webkit-box-shadow: 3px 3px 10px 0px #4d4c4c;
  -moz-box-shadow: 3px 3px 10px 0px #4d4c4c;

  & .sidebar {
    position: relative;
    background-color: #147bdb;
    color: white;

    &_row {
      @include flex(center, center);
      background-color: transparent;

      &.sidebar_header {
        height: 100px !important;
        background: linear-gradient(to bottom, #0f589c, #147bdb) white;
        background-position-x: -3px;
        background-repeat-y: no-repeat;
      }

      & .big_logo {
          position: absolute;
          left: -9px;
          z-index: 5555;
          & img {
            &:hover {
              cursor: pointer;
              transform: scale(1.05);
              &:active {
                transform: scale(1);
              }
            }
            height: 90px;
            width: 220px;
          }
        }

      &:not(.sidebar_header) {
        &:not(.selected) {
          @include clickable(rgba(0, 176, 207, 0.527));
        }
        height: 55px;
        font-size: 1.1rem;
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
          transform: scale(1.4);
        }
        & .small_logo {
          & img {
            height: 40px;
            width: 40px;
          }
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
