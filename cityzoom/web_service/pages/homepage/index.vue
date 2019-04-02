<template>
  <no-ssr>
    <div>
      <grid-layout
        :layout="layout"
        :col-num="12"
        :row-height="30"
        :is-draggable="true"
        :is-resizable="true"
        :vertical-compact="true"
        :margin="[20, 20]"
        :use-css-transforms="false"
      >
        <grid-item
          v-for="item in layout"
          :key="item.i"
          :x="item.x"
          :y="item.y"
          :w="item.w"
          :h="item.h"
          :i="item.i"
          :minW="4"
          :minH="14"
          :maxH="14"
          drag-allow-from=".widget_handle"
        >
          <div class="widget">
            <div class="widget_handle">
              <img src="icons/widgets/handler.png">
            </div>
            <div v-if="item.type=='series'">
              <SeriesGraph :name="item.i"/>
            </div>
          </div>
        </grid-item>
      </grid-layout>
    </div>
  </no-ssr>
</template>

<script>
var testLayout = [
  { x: 0, y: 0, w: 4, h: 14, i: "series_a", type: 'series' },
  { x: 8, y: 0, w: 4, h: 14, i: "series_b", type: 'series' },
  { x: 0, y: 14, w: 13, h: 14, i: "series_c", type: 'series' }
];

export default {
  data() {
    return {
      layout: testLayout,
    };
  }, 
  mounted() {
  }
};
</script>

<style lang="scss" scoped>
@import "~/assets/mixins.scss";

.vue-grid-item {
  background-color: white;
  border-radius: 10px;

  box-shadow: 3px 2px 3px 0px #4d4c4c;
  -webkit-box-shadow: 3px 2px 3px 0px #4d4c4c;
  -moz-box-shadow: 3px 2px 3px 0px #4d4c4c;
  @include unselectable();
}

.widget {
  position: relative;
  height: 100%;
  padding-left: 30px;
  padding-right: 10px;
  &_handle {
    position: absolute;
    top: 0;
    left: 0;
    & > img {
      padding-left: 8px;
      padding-top: 8px;
      width: 40px;
      height: 40px;
      &:hover {
        cursor: move; /* fallback if grab cursor is unsupported */
        cursor: grab;
        cursor: -moz-grab;
        cursor: -webkit-grab;
        transform: scale(1.05);
      }
      &:active {
        cursor: grabbing;
        cursor: -moz-grabbing;
        cursor: -webkit-grabbing;
      }
    }
  }
}
</style>


