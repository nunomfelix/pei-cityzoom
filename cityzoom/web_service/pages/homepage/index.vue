<template>
  <div class="mainMargin">
    <grid-layout
      :layout="layout"
      :col-num="12"
      :row-height="30"
      :is-draggable="true"
      :is-resizable="false"
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
        :minW="2"
        :minH="14"
        :maxH="14"
        drag-allow-from=".widget_handle"
        @resize="onResize(item.i)"
        @resized="onResize(item.i)"
      >
        <div class="widget">
          <div class="widget_handle">
            <img src="icons/widgets/handler.png">
          </div>
          
          <div v-if="item.type=='series'">
            <SeriesGraph :ref="item.i" :data="item.data && item.data == 'fake' ? null : data" :name="item.i"/>
          </div>
          <div v-else-if="item.type=='stacked'">
            <StackedBar :ref="item.i" :name="item.i"/>
          </div>
          <div v-else-if="item.type=='lines'">
            <!--
            <LineGraph :ref="item.i" :name="item.i" :values="values"/>
            -->
            
            <div class="small">
              <line-chart :ref="item.i" :name="item.i" :chart-data="datacollection" :options="options"/>
              <button @click="fillData()">Randomize</button>
            </div>
            
          </div>
          
          <div v-else-if="item.type" class="small">
              <BarChart/>
          </div>
    </div>
          <!--
          <div v-if="item.type=='widget_weather'">
            <no-ssr>
              <WeatherWidget 
                :ref="item.i"
                api-key="7fbda2874f6ebf17ef4d31443696cd68"
                title="Weather"
                :latitude="position ? position.coords.latitude.toString() : null"
                :longitude="position ? position.coords.longitude.toString(): null"
                language="pt"
                units="uk">
              </WeatherWidget>
            </no-ssr>
          </div>
          -->
        
      </grid-item>
    </grid-layout>
  </div>
</template>

<script>
import moment from 'moment'
const drone_stream = require('static/get_stream_values_response.json');

var testLayout = [
  { x: 0, y: 0, w: 14, h: 14, i: "line_a", type: 'lines', data:'fake' },
  //{ x: 0, y: 0, w: 8, h: 14, i: "series_a", type: 'series', data:'fake' },
  //{ x: 0, y: 0, w: 8, h: 5, i: "dfffd", type: 'widget_weather'},
  // { x: 8, y: 0, w: 4, h: 14, i: "series_c", type: 'series', data: 'fake' },
  // { x: 0, y: 14, w: 13, h: 14, i: "series_b", type: 'series', data: 'fake' },
  { x: 0, y: 14, w: 13, h: 14, i: "bar_a", type: 'bar', data: 'fake' }
];

export default {


  data() {
    return {
      layout: testLayout,
      datacollection: null,
      position: null,
      options:{
        elements:{
          line:{
            tension:0
          }
        }, 
        scales: {
          xAxes: [{
              type: 'time',
          time: {
              parser: "DD:HH:mm",
              unit: 'hour'}
          }]
        }
    }
    };
  }, 
  mounted: async function() {
    setTimeout(() => {
      this.getLocation()
    }, 0)

    
    const res = await this.$axios.get(`http://localhost:8002/devices/device_APIs01050126/values`, {  
      headers: {
          Authorization: this.$store.state.jwt
      }
    })

    this.data=res.data

    var labels = []
    var y_axis = []
    // var streams = []
    //console.log(res.data.config)
    // Object.keys(data).forEach((key) => {
    //   streams.push(res.data[key])
    // });
    // Object.keys(streams).forEach((key) => {
    //   console.log(key,streams[key])
    //   labels.push(this.convertTimestamp(streams[key].created_at))
    //   y_axis.push(streams[key].value)
    // });
    const d = [Object.keys(res.data)[0]]
      for(var stream of res.data[d]){
        console.log(stream)
          y_axis.push(Math.round(stream.value))
          labels.push(this.convertTimestamp(stream.created_at))
        }
    
    

    // var result = [{ x: "18:00", y: "230" }, { x: "19:00", y: "232" }, { x: "20:00", y: "236" }, { x: "22:00", y: "228" }];
    // var labels = result.map(e => moment(e.x, 'HH:mm'));
    // var data = result.map(e => +e.y);
    console.log(y_axis)
    console.log(labels)
    this.fillData(labels,y_axis)
  },
  methods: {
    onResize(i) {
      setTimeout(() => {
        this.$refs[i][0].onResize()
      }, 0)
    },
    getLocation(){
      if (navigator.geolocation){
        navigator.geolocation.getCurrentPosition((position) => { 
          this.position = position; 
          this.position.coords.latitude = this.position.coords.latitude.toString()
          this.position.coords.longitude = this.position.Coordinates.longitude.toString()
          });
      }
    },
    fillData (labels,y_axis) {
      this.datacollection = {
        labels: labels,
        datasets: [
          {
            label: 'Humidity',
            backgroundColor: '#0099FF',
            fill: false,

            data: y_axis
          }
        ]
      }
    },
    getRandomInt () {
      return Math.floor(Math.random() * (50 - 5 + 1)) + 5
    },
    convertTimestamp(t){
      var dt = new Date(t*1000);
      var day = dt.getDay();
      var hr = dt.getHours();
      var m = "0" + dt.getMinutes();
      return day+':'+hr+ ':' + m.substr(-2)
    }

  }
};
</script>

<style lang="scss" scoped>
@import "~/assets/mixins.scss";
@import 'vue-weather-widget/dist/css/vue-weather-widget.css';

.vue-grid-item {
  background-color: white;
  border-radius: 10px;

  @include shadow(3px, 2px, 3px, 0px, #4d4c4c);
  @include unselectable();
}
  .small {
    max-width: 500px;
    margin:  150px auto;
  }
  .smalli{
    max-width:200px;
    position:relative;

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


