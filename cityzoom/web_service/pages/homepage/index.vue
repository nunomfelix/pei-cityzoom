<template>
  <div class="mainMargin" v-if="hexagon_tuples && hexagon_tuples.length">
    <Dashboard :hexagon="hexagon" :hexagon_tuples="hexagon_tuples" :municipality="municipality" :municipality_tuples="municipality_tuples"></Dashboard>
  </div>
</template>

<script>
import moment from 'moment'

var testLayout = [
  { x: 0, y: 0, w: 14, h: 14, i: "line_a", type: 'lines', data:'humidity_stream' },
  //{ x: 0, y: 0, w: 8, h: 14, i: "series_a", type: 'series', data:'fake' },
  //{ x: 0, y: 0, w: 8, h: 5, i: "dfffd", type: 'widget_weather'},
  // { x: 8, y: 0, w: 4, h: 14, i: "series_c", type: 'series', data: 'fake' },
  // { x: 0, y: 14, w: 13, h: 14, i: "series_b", type: 'series', data: 'fake' },
  //{ x: 0, y: 14, w: 13, h: 14, i: "bar_a", type: 'bar', data: 'humidity_stream' },
  //{ x: 0, y: 14, w: 13, h: 14, i: "pie_a", type: 'pie', data: 'fake' }
];

export default {
  name: 'Homepage',
  data() {
    return {
      layout: testLayout,
      datacollection: null,
      position: null,
      data:null,
      hexagon:null,
      hexagon_tuples:null,
      municipality:null,
      municipality_tuples:null,
      streams_graphs:null,
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
              parser: "HH:mm:ss",
              unit: 'minute'}
          }]
        }
    },
    pie_chartData: {
        labels: ["Green", "Red", "Blue"],
        datasets: [
          {
            label: "Data One",
            backgroundColor: ["#41B883", "#E46651", "#00D8FF"],
            data: [1, 10, 5]
          }
        ]
      }
    };
  }, 
  mounted: async function() {
      this.getLocation()

    console.log('aquiiii\n\n\n')





   //createWidget with chartData 
   //and default configs depending on graph
   //x axis time scale
   //y axis ??
   //Array de streams 

    //this.fillGraphsWithStreams(res.data)
    //console.log('aqui\n')
    //console.log(this.streams_graphs)
  },
  methods: {
    onResize(i) {
      setTimeout(() => {
        this.$refs[i][0].onResize()
      }, 0)
    },
    getLocation(){
      if (navigator.geolocation){
        navigator.geolocation.getCurrentPosition(async (position) => { 
          this.position = position.coords; 
          console.log(position.coords)
          // const res = await this.$axios.get(`http://193.136.93.14:8001/czb/values/locations?latitude=` + this.position.latitude + '&longitude=' + this.position.longitude)  
          const res = await this.$axios.get(`http://localhost:8001/czb/values/locations?latitude=` + this.position.latitude + '&longitude=' + this.position.longitude)
          console.log('alooo',res.data)
          this.hexagon = res.data.hexagon
          this.hexagon_tuples = res.data.hexagon_tuples
          this.municipality = res.data.municipality
          this.municipality_tuples = res.data.municipality_tuples
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
    fillGraphsWithStreams(streams){
      this.streams_graphs = []
      for(var stream of streams){
        var labels = []
        var y_axis = []
        //console.log('esteaqui     ',stream.values[0].value,'\n')
        for(var value in stream.values){
          console.log(stream.values[value].timestamp)
          labels.push(this.convertTimestamp(stream.values[value].timestamp))
          y_axis.push(stream.values[value].value)
        }

        console.log(labels)
        console.log(y_axis)

        var datacollection = {
          labels: labels,
          datasets: [
            {
              label: stream._id,
              backgroundColor: '#0099FF',
              fill: false,
              data: y_axis
            }
          ]
        }
        console.log(datacollection)
        this.streams_graphs.push(datacollection)

      }
      console.log(this.streams_graphs)

      
    },
    getRandomInt () {
      return Math.floor(Math.random() * (50 - 5 + 1)) + 5
    },
    convertTimestamp(t){
      console.log(t)
      var dt = new Date(t);
      var day = dt.getDay();
      var hr = dt.getHours();
      var m = "0" + dt.getMinutes();
      var seconds = "0" + dt.getSeconds();
      console.log('teste data '+hr+ ':' + m.substr(-2)+ ':' + seconds.substr(-2))
      //day + ':' + 
      return hr+ ':' + m.substr(-2) + ':' + seconds.substr(-2);
    },
    createWidget(stream){
      this.testLayout.push({ x: 0, y: 14, w: 13, h: 14, i: "line_a", type: 'line', data: 'fake' })
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

.info-box {
  cursor: pointer;
}
.info-box-content {
  text-align: center;
  vertical-align: middle;
  display: inherit;
}
.fullCanvas {
  width: 100%;
}
</style>