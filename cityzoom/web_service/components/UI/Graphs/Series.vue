<template>
  <div @mouseenter="enter" @mouseleave="leave" >
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
  </div>
</template>

<script>
import * as crossfilter from "crossfilter2";
export default {
  props: {
    name: String,
    data: Array
  },
  data() {
    return {
      filteredKeys: [],

      ndx: null,
      max: 0,
      min: 9999999,
      xMin: 99999999999999,
      xMax: 0,
      rendered: false,

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
    if(process.client)
      window.addEventListener("resize", this.onResize);
  },
  destroyed() {
    if(process.client)
      window.removeEventListener("resize", this.onResize);
  },
  mounted() {
    const time = this.data ? 1000 : 0;
    setTimeout(() => {
    this.dc = require("dc");
      this.dataTmp = this.data;
      this.focusChart = this.dc.seriesChart("#" + this.name);
      this.overviewChart = this.dc.seriesChart("#" + this.name + "overview");
      var dimension, group;
      //this.dc.d3.csv("morley.csv", function(error, experiments) {

      if (this.dataTmp) {
        for (let v in this.dataTmp) {
          if (Number(this.dataTmp[v].value) > this.max)
            this.max = Number(this.dataTmp[v].value);
          if (Number(this.dataTmp[v].value) < this.min)
            this.min = Number(this.dataTmp[v].value);
          if (Number(this.dataTmp[v].key) < this.xMin)
            this.xMin = Number(this.dataTmp[v].key);
          if (Number(this.dataTmp[v].key) > this.xMax)
            this.xMax = Number(this.dataTmp[v].key);
        }
      } else {
        this.dataTmp = [];
        for (var i = 0; i < 250; i++) {
          for (var j = 0; j < 5; j++) {
            const x = Math.random() * 100;
            const val = {
              dataset: this.tmpNames[j],
              key: i,
              value: x
            };
            if (x > this.max) this.max = x;
            if (x < this.min) this.min = x;
            this.dataTmp.push(val);
          }
        }
        this.xMin = -5;
        this.xMax = i + 10;
      }

      this.min = this.min - this.max * 0.2;
      this.max = this.max + this.max * 0.2;

      this.ndx = crossfilter(this.dataTmp);
      dimension = this.ndx.dimension(function(d) {
        return [d.dataset, d.key];
      });
      group = dimension.group().reduceSum(function(d) {
        return d.value;
      });

      this.focusChart
        .height(480)
        //.chart(function (c) { returnthis.dc.lineChart(c).curve(this.dc.d3.curveCardinal); })
        .x(this.dc.d3.scaleLinear().domain([this.xMin, this.xMax]))
        .y(this.dc.d3.scaleLinear().domain([this.min, this.max]))
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
      //this.focusChart.yAxis().tickFormat(function (d) { return this.dc.d3.format(',d')(d + 299500); });
      this.focusChart.margins().left += 20;
      this.focusChart.margins().right += 110;

      this.overviewChart
        .height(150)
        //.chart(function (c) { returnthis.dc.lineChart(c).curve(this.dc.d3.curveCardinal); })
        .brushOn(true)
        .xAxisLabel("Time")
        .clipPadding(10)
        .dimension(dimension)
        .group(group)
        .x(this.dc.d3.scaleLinear().domain([this.xMin, this.xMax]))
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
      this.focusChart.focus([
        this.xMax - (this.xMax - this.xMin) * 0.66,
        this.xMax - (this.xMax - this.xMin) * 0.44
      ]);
      this.onResize();
    }, time);
  },
  methods: {
    reset() {
      this.focusChart.focus(null);
    },
    enter() {
      if (!this.rendered) {
        if (this.focusChart) {
          this.focusChart.x(
            this.dc.d3.scaleLinear().domain([this.xMin, this.xMax])
          );
          const tmp = this.focusChart.filters()[0]
            ? [this.focusChart.filters()[0][0], this.focusChart.filters()[0][1]]
            : null;
          this.focusChart.render();
          this.overviewChart.redraw();
          this.focusChart.focus(tmp);
        }
        this.rendered = true;
      }
    },
    leave() {
      this.rendered = false;
    },
    onResize() {
      const w = document.getElementById(this.name + "wrapper").offsetWidth;
      const h = document.getElementById(this.name + "wrapper").offsetHeight;

      this.focusChart.width(w);
      this.overviewChart.width(w * 0.8);
      this.focusChart.legend(
        this.dc
          .legend()
          .x(w / 2 - (this.tmpNames.length / 2 * 85))
          .y(/*h / 2 - (24 * this.tmpNames.length) / 2*/ 5)
          .itemHeight(13)
          .horizontal(true)
          .gap(15)
          .legendWidth(10000)
          .itemWidth(170)
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
