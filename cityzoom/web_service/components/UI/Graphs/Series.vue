<template>
  <div v-bind:id="name+'wrapper'">
    <div class="dc_wrapper rowc" :class="{'show': show}">
      <div v-bind:id="name"></div>
      <div v-bind:id="name + 'overview'"></div>
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
      focusChart: null,
      overviewChart: null
    };
  },
  created() {
    window.addEventListener("resize", this.onResize);
  },
  destroyed() {
    window.removeEventListener("resize", this.onResize);
  },
  mounted() {
    this.dc = require("dc");
    setTimeout(() => {
      this.focusChart = this.dc.seriesChart("#" + this.name);
      this.overviewChart = this.dc.seriesChart("#" + this.name + "overview");
      var dimension, group;
      //this.dc.d3.csv("morley.csv", function(error, experiments) {

      for (var i = 0; i < 250; i++) {
        for (var j = 0; j < 3; j++) {
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

      this.focusChart
        .height(480)
        //.chart(function (c) { returnthis.dc.lineChart(c).curve(this.dc.d3.curveCardinal); })
        .x(this.dc.d3.scaleLinear().domain([0, 6]))
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
      this.focusChart.x(this.dc.d3.scaleLinear().domain([-1, this.i]));
      this.focusChart.y(this.dc.d3.scaleLinear().domain([this.min, this.max]));
      //this.focusChart.yAxis().tickFormat(function (d) { return this.dc.d3.format(',d')(d + 299500); });
      this.focusChart.margins().left += 20;
      this.focusChart.margins().right += 45;

      this.overviewChart
        .height(150)
        //.chart(function (c) { returnthis.dc.lineChart(c).curve(this.dc.d3.curveCardinal); })
        .x(this.dc.d3.scaleLinear().domain([0, 6]))
        .brushOn(true)
        .xAxisLabel("Time")
        .clipPadding(10)
        .dimension(dimension)
        .group(group);
      this.overviewChart.x(this.dc.d3.scaleLinear().domain([-1, this.i]));
      this.overviewChart
        .y(this.dc.d3.scaleLinear().domain([this.min, this.max]))
        .seriesAccessor(function(d) {
          return "Subscription: " + d.key[0];
        })
        .keyAccessor(function(d) {
          return +d.key[1];
        })
        .valueAccessor(function(d) {
          return +d.value;
        });
      this.overviewChart.yAxis().ticks(4);
      this.overviewChart.margins().left += 33;
      this.overviewChart.margins().right += 45;

      this.focusChart.render();
      this.overviewChart.render();
      this.focusChart.focus([i * 0.45, i * 0.55]);
      this.onResize();
    }, 100);
  },
  methods: {
    reset() {
      this.focusChart.focus(null);
    },

    onResize() {
      const w = document.getElementById(this.name + "wrapper").offsetWidth;
      const h = document.getElementById(this.name + "wrapper").offsetHeight;

      this.focusChart.width(w);
      this.overviewChart.width(w * 0.8);
      this.focusChart.legend(
        this.dc
          .legend()
          .x(w - 80)
          .y(h / 2 - (24 * this.tmpNames.length) / 2)
          .itemHeight(13)
          .horizontal(false)
          .gap(15)
          .legendWidth(100)
          .itemWidth(100)
      );
      const tmp = this.focusChart.filters()[0]
        ? [this.focusChart.filters()[0][0], this.focusChart.filters()[0][1]]
        : null;
      this.overviewChart.render();
      this.focusChart.redraw();
      this.focusChart.focus(tmp);
    }
  }
};
</script>
<style lang="scss">
</style>
