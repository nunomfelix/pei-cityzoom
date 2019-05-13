<template>
	<div v-bind:id="name+'wrapper'">
		<div class="dc_wrapper rowc" :class="{'show': show}">
			<div v-bind:id="name"></div>
			<div v-bind:id="name + 'overview'"></div>
			<button class="btn btn-danger" style="margin-right:30px">reset</button>
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
	data(){
		return {
			chart: null,
			dc: null,
			d3: null,
			show: false,
			dimension:null,
			data:[],
			ndx: null,
			group:null,
			width:100,
		}
	},
	mounted(){
	this.dc = require('dc');
	this.d3 = require('d3');
	setTimeout(() => {
		for (var i = 0; i <= 10; i++) {
			const x = Math.random() * 100
			const val = {
			"key": i,
			"value": x
		}
		this.data.push(val)
	  }

	  var dimension, group
	  this.chart = this.dc.lineChart("#" + this.name);
	  this.ndx = crossfilter(this.data)
	  var dimension = this.ndx.dimension(function (d) { return d.key; })
	  var group = dimension.group().reduceSum(function (d) { return d.value; })
	  this.chart
		.height(599)
		.x(this.d3.scaleLinear().domain([0, 10]))
		.y(this.d3.scaleLinear().domain([0, group.top(1)[0].value * 1.1]))
		.ordinalColors([this.getRandomColor()])
		.yAxisLabel('kWh')
		.renderArea(true)
		.brushOn(false)
		.renderDataPoints(true)
		.clipPadding(10)
		.dimension(dimension)
		.group(group)
		.on('renderlet', () => {
		  this.show = true
		})
		this.chart.margins().left += 10;
		this.chart.margins().right -= 40;
	  this.onResize()
	}, 0)
  },
  methods:{
	getRandomColor() {
		var letters = '0123456789ABCDEF';
		var color = '#';
		for (var i = 0; i < 6; i++) {
			color += letters[Math.floor(Math.random() * 16)];
		}
		return color;
	},
	onResize() {
		this.chart
			.width(document.getElementById(this.name + 'wrapper').offsetWidth)
			.transitionDuration(0);
		this.chart.render();
		this.chart.transitionDuration(750);
	}

  },
  created() {
		if(process.client)
    	window.addEventListener("resize", this.onResize);
  },
  destroyed() {
		if(process.client)
    	window.removeEventListener("resize", this.onResize);
  },
}
</script>

<style>

</style>
