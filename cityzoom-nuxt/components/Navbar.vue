<template>
  <div
    class="sidebarWrapper"
    :class="{'collapsed': collapsed}"
    @mouseenter="toggleSidebar(false)"
    @mouseleave="toggleSidebar(true)"
  >
    <div class="sidebar">
      <div class="sidebar_row header" :class="{'collapsed': collapsed}">
        <div class="sidebar_row_left"></div>
        <div class="sidebar_row_right">
          <div class="logo_aveiro">
            <img @click="homeButton()" src="assets/icons/sidebar/logo_aveiro_big.svg">
          </div>
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
          <img :src="tab.img">
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
                path: 'dominios/metrica',
                img: 'assets/icons/sidebar/dominios.svg',
                name: 'Domínios'
                }, {
                path: 'dispositivos',
                img: 'assets/icons/sidebar/dispositivos.svg',
                name: 'Dispositivos'
                }, {
                path: 'operacoes',
                img: 'assets/icons/sidebar/operacoes.svg',
                name: 'Operações'
                }, {
                path: 'notificacoes',
                img: 'assets/icons/sidebar/notificacoes.svg',
                name: 'Notificações'
                }, {
                path: 'comunicacao',
                img: 'assets/icons/sidebar/comunicacao.svg',
                name: 'Comunicação'
                }, {
                path: 'reportes',
                img: 'assets/icons/sidebar/reports.svg',
                name: 'Indicadores ISO'
                }, {
                path: 'market',
                img: 'assets/icons/sidebar/market.svg',
                name: 'Market'
                }, {
                path: 'equipa',
                img: 'assets/icons/sidebar/equipa.svg',
                name: 'Equipa'
                }, {
                path: 'definicoes',
                img: 'assets/icons/sidebar/settings.svg',
                name: 'Definições'
                }
            ],
            collapsed: true,
            timeout: null,
            currentTab: ''
        }
    },
    methods: {
        changeTab(path) {
            this.currentTab = path
            this.router.navigate(['/' + path])
        },
        toggleSidebar(bool) { 
            if(this.timeout)
            clearTimeout(this.timeout)
            this.collapsed = bool
        },
        homeButton() {
            this.currentTab = ''
            this.router.navigate(['/homepage'])
        }
    },
    mounted() {
        setTimeout(() => {
        this.toggleSidebar(false);
        this.timeout = setTimeout(() => {
            this.toggleSidebar(true);
        },2000)
        }, 0)
    }
};
</script>

<style lang="scss">
$sidebar-size: 260px;
$sidebar-left-size: 80px;
$sidebar-right-size: 180px;
@import "~/assets/mixins";

.sidebarWrapper {
  @include transition(width, 0.3s, ease, 0.005s);
  @include unselectable();
  position: fixed;
  overflow-x: hidden;
  display: flex;
  width: $sidebar-size;
  height: 100%;
  z-index: 4444;

  &.collapsed {
    width: $sidebar-left-size;
    & > .sidebar .sidebar_row_right {
      opacity: 0;
    }
  }

  box-shadow: 3px 3px 10px 0px #c9c9c9;
  -webkit-box-shadow: 3px 3px 10px 0px #c9c9c9;
  -moz-box-shadow: 3px 3px 10px 0px #c9c9c9;

  & .sidebar {
    position: relative;
    background-color: #0024f1;
    color: white;

    &_row {
      @include flex(center, center);
      background-color: transparent;

      &.header {
        height: 157px;
        background: linear-gradient(to bottom, #0024f185, #0024f1),
          url("/assets/icons/sidebar/padrao2.jpg");
        background-position-x: -3px;
        background-repeat-y: no-repeat;
      }

      &:not(.header) {
        &:not(.selected) {
          @include clickable(darkblue);
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
      }

      &_right {
        @include flex(flex-start, center);
        @include transition(opacity, 0.3s, ease, 0.005s);
        width: $sidebar-right-size;
        height: 100%;
        & .logo_aveiro {
          z-index: 5555;
          & img {
            &:hover {
              cursor: pointer;
              transform: scale(1.05);
              &:active {
                transform: scale(1);
              }
            }
            height: 100px;
            width: 100px;
          }
        }
      }

      &.selected {
        background-color: darkblue;
      }
    }
  }
}
</style>
