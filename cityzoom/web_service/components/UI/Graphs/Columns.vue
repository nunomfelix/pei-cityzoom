<template>
  <div v-bind:id="name+'wrapper'">
    <div class="dc_wrapper rowc" :class="{'show': show}">
      <div v-bind:id="name"></div>
      <button class="btn btn-danger" style="margin-right:30px" @click="reset()">reset</button>
    </div>
    <div v-if="!show" style="height: 666px" class="rowc">
      <div class="lds-roller-relative mb-4">
        <div class="lds-roller">
          <div></div>
          <div></div>
          <div></div>
          <div></div>
          <div></div>
          <div></div>
          <div></div>
          <div></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import * as d3 from "d3";
import * as crossfilter from "crossfilter2";
export default {
  props: {
    name: String
  },
  data() {
    return {
      data: [],
      filteredKeys: [],

      ndx: null,
      max: 0,
      min: 999,
      i: 0,

      tmpNames: [
        "temperature",
        "waste",
        "wind",
        "radiation",
        "light",
        "humidity"
      ],
      width: null,
      maxOverviewWidth: null,
      overviewWidth: 900,

      dc: null,
      show: false,
      columnChart: null
    };
  },
  created() {
    document.addEventListener("resize", this.onResize);
  },
  destroyed() {
    document.removeEventListener("resize", this.onResize);
  },
  mounted() {
    this.dc = require("dc");
    setTimeout(() => {
      this.columnChart = this.dc.barChart("#" + this.id);
      var dimension, group;

      for (var i = 0; i < 400; i++) {
        for (var j = 0; j < 5; j++) {
          const x = Math.random() * 100000;
          const val = {
            dataset: this.tmpNames[j],
            key: this.i,
            value: x
          };
          if (x > this.max) this.max = x;
          if (x < this.min) this.min = x;
          this.data.push(val);
        }
        this.i++;
      }
      this.min = this.min - this.max * 0.15;
      this.max = this.max + this.max * 0.15;

      this.ndx = crossfilter(this.data);
      dimension = this.ndx.dimension(function(d) {
        return +d.key;
      });
      group = dimension.group().reduceSum(
        function(p, v) {
          p[v.dataset] = (p[v.dataset] || 0) + v.value;
          return p;
        },
        function(p, v) {
          p[v.dataset] = (p[v.dataset] || 0) - v.value;
          return p;
        },
        function() {
          return {};
        }
      );
      function sel_stack(i) {
        return function(d) {
          return d.value[i];
        };
      }
      console.log(this.columnChart);

      this.columnChart
        .width(768)
        .height(480)
        .x(d3.scaleLinear().domain([1, 21]))
        .margins({ left: 80, top: 20, right: 10, bottom: 20 })
        .brushOn(false)
        .clipPadding(10)
        .title(function(d) {
          return d.dataset + "[" + this.layer + "]: " + d.value[this.layer];
        })
        .dimension(dimension)
        .group(group, "1", sel_stack('1'))
        .renderLabel(true);

      this.columnChart.legend(this.dc.legend());

      this.dc.override(this.columnChart, "legendables", function() {
        var items = this.columnChart._legendables();
        return items.reverse();
      });

      for (var i = 2; i < 6; ++i)
        this.columnChart.stack(group, "" + i, sel_stack(i));
      this.columnChart.render();

    }, 100);
  },
  methods: {
    reset() {
      this.columnChart.focus(null);
    },

    onResize(event, redraw = true) {
      //   this.width = screen.width;
      //   this.maxOverviewWidth = this.width * 0.8;
      //   if (event.target.innerWidth < this.overviewWidth) {
      //     const tmp = this.width - (this.width - event.target.innerWidth) - 300;
      //     this.columnChart.width(tmp);
      //     this.overviewChart.width(tmp);
      //   } else if (event.target.innerWidth < this.width + 300) {
      //     this.columnChart.width(
      //       this.width - (this.width - event.target.innerWidth) - 300
      //     );
      //     this.overviewChart.width(
      //       this.maxOverviewWidth - (this.width - event.target.innerWidth) - 100
      //     );
      //   } else {
      //     this.columnChart.width(this.width);
      //     this.overviewChart.width(this.maxOverviewWidth);
      //   }
      //   this.columnChart.legend(
      //     this.dc
      //       .legend()
      //       .x(this.columnChart.width() - 80)
      //       .y(this.columnChart.height() / 2 - (24 * this.tmpNames.length) / 2)
      //       .itemHeight(13)
      //       .horizontal(false)
      //       .gap(15)
      //       .legendWidth(1000)
      //       .itemWidth(150)
      //   );
      //   if (redraw) {
      //     setTimeout(() => {
      //       const tmp = this.columnChart.filters()[0]
      //         ? [this.columnChart.filters()[0][0], this.columnChart.filters()[0][1]]
      //         : null;
      //       this.columnChart.redraw();
      //       this.columnChart.focus(tmp);
      //       this.overviewChart.render();
      //     }, 0);
      //   }
    }
  }
};
</script>
<style lang="scss">
@import "~/assets/mixins.scss";
.dc_wrapper {
  opacity: 0;
  height: 0;
  @include transition(opacity, 0.5s, ease, 0s);
  &.show {
    opacity: 1;
    height: auto;
  }
}
</style>
