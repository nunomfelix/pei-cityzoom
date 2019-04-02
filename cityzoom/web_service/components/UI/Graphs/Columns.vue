<template>
  <div>
    <div class="dc_wrapper rowc" :class="{'show': show}">
      <div v-bind:id="id"></div>
    </div>
    <div v-if="!show" style="height: 666px" class="rowc">
      <div class="lds-roller-relative mb-4">
        <div class="lds-roller"><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div>
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
      id
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
      focusChart: null,
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
      this.focusChart = this.dc.seriesChart('#'+this.id);
      this.overviewChart = this.dc.seriesChart('#'+this.id+'overview');
      var dimension, group;
      //d3.csv("morley.csv", function(error, experiments) {

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
        return [d.dataset, d.key];
      });
      group = dimension.group().reduceSum(function(d) {
        return d.value;
      });
      console.log(this.focusChart);

      this.focusChart
        .height(480)
        //.chart(function (c) { returnthis.dc.lineChart(c).curve(d3.curveCardinal); })
        .x(d3.scaleLinear().domain([0, 6]))
        .brushOn(false)
        .yAxisLabel("Values")
        .yAxisPadding(5)
        .dimension(dimension)
        .group(group)
        .mouseZoomable(true)
        .rangeChart(this.overviewChart)
        .seriesAccessor(function(d) {
          return d.key[0];
        })
        .keyAccessor(function(d) {
          return +d.key[1];
        })
        .on("renderlet", () => {
          this.show = true;
        })
        .valueAccessor(function(d) {
          return +d.value;
        });
      this.focusChart.x(d3.scaleLinear().domain([-1, this.i]));
      this.focusChart.y(d3.scaleLinear().domain([this.min, this.max]));
      //this.focusChart.yAxis().tickFormat(function (d) { return d3.format(',d')(d + 299500); });
      this.focusChart.margins().left += 20;
      this.focusChart.margins().right += 45;

    }, 100);
  },
  methods: {
    reset() {
      this.focusChart.focus(null);
    },

    onResize(event, redraw = true) {
    //   this.width = screen.width;
    //   this.maxOverviewWidth = this.width * 0.8;
    //   if (event.target.innerWidth < this.overviewWidth) {
    //     const tmp = this.width - (this.width - event.target.innerWidth) - 300;
    //     this.focusChart.width(tmp);
    //     this.overviewChart.width(tmp);
    //   } else if (event.target.innerWidth < this.width + 300) {
    //     this.focusChart.width(
    //       this.width - (this.width - event.target.innerWidth) - 300
    //     );
    //     this.overviewChart.width(
    //       this.maxOverviewWidth - (this.width - event.target.innerWidth) - 100
    //     );
    //   } else {
    //     this.focusChart.width(this.width);
    //     this.overviewChart.width(this.maxOverviewWidth);
    //   }
    //   this.focusChart.legend(
    //     this.dc
    //       .legend()
    //       .x(this.focusChart.width() - 80)
    //       .y(this.focusChart.height() / 2 - (24 * this.tmpNames.length) / 2)
    //       .itemHeight(13)
    //       .horizontal(false)
    //       .gap(15)
    //       .legendWidth(1000)
    //       .itemWidth(150)
    //   );

    //   if (redraw) {
    //     setTimeout(() => {
    //       const tmp = this.focusChart.filters()[0]
    //         ? [this.focusChart.filters()[0][0], this.focusChart.filters()[0][1]]
    //         : null;
    //       this.focusChart.redraw();
    //       this.focusChart.focus(tmp);
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
