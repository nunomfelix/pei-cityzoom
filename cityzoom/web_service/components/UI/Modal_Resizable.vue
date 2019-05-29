<template>
    <transition name="modal">
    <div class="modal-mask">
      <div class="modal-wrapper">
        <div class="modal-container">

          <div class="modal-header">
            <slot name="header">
              Device Information
            </slot>

              
          </div>

          <div class="modal-body">
            <slot name="body">
            <!--
            <div v-if="item.type=='lines'">
                <LineGraph :ref="item.i" :name="item.i" :values="values"/>
            </div>
            -->
            <div v-if="show" class="small">
              <line-chart  :chart-data="datacollection" :options="options"/>
            </div>
            </slot>
          </div>

          <div class="modal-footer">
            <slot name="footer">
              
              <button class="modal-default-button" @click="$emit('close')">
                Close
              </button>
            </slot>
          </div>
        </div>
      </div>
    </div>
  </transition>
</template>
<script>
 
var item = { x: 0, y: 0, w: 12, h: 14, i: "line_a", type: 'lines', data:'fake' };
export default {
  props:{values: Object}
  ,
  name: 'Modal_Resizable',
  

  data(){
      return {
      show: false,
      item: item,
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
    }
  },
  mounted: async function() {
   const res = await this.$axios.get(`http://localhost:8002/devices/device_APIs0105010/values`, {  
      headers: {
          Authorization: this.$store.state.jwt
      }
    })

    this.data=res.data

    var labels = []
    var y_axis = []
    const d = [Object.keys(res.data)[0]]
      for(var stream of res.data[d]){
          y_axis.push(Math.round(stream.value))
          labels.push(this.convertTimestamp(stream.created_at))
        }

    console.log(y_axis)
    console.log(labels)
    this.fillData(labels,y_axis)
    this.show = true
  },
  
  methods:{
    fillData (labels,y_axis) {
      this.datacollection = {
        labels: labels,
        datasets: [
          {
            label: 'Humidity',
            backgroundColor: '#0099FF',
            data: y_axis
          }
        ]
      }
    },
    getRandomInt () {
      return Math.floor(Math.random() * (50 - 5 + 1)) + 5
    },
    convertTimestamp(t){
      var dt = new Date(t);
      var day = dt.getDate().toString().padStart(2, '0');
      var hr = dt.getHours().toString().padStart(2, '0');
      var m = dt.getMinutes().toString().padStart(2, '0');
      return day+':'+hr+ ':' + m.substr(-2)
    }

  },
}
</script>

<style>
.modal-mask {
  position: fixed;
  z-index: 9998;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, .5);
  display: table;
  transition: opacity .3s ease;
}

.modal-wrapper {
  display: table-cell;
  vertical-align: middle;
}

.modal-container {
  width: 600px;
  margin: 0px auto;
  padding: 20px 30px;
  background-color: #fff;
  border-radius: 2px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, .33);
  transition: all .3s ease;
  font-family: Helvetica, Arial, sans-serif;
}

.modal-header h3 {
  margin-top: 0;
  color: #42b983;
}

.modal-body {
  margin: 20px 0;
}

.modal-default-button {
  float: right;
}

/*
 * The following styles are auto-applied to elements with
 * transition="modal" when their visibility is toggled
 * by Vue.js.
 *
 * You can easily play with the modal transition by editing
 * these styles.
 */

.modal-enter {
  opacity: 0;
}

.modal-leave-active {
  opacity: 0;
}

.modal-enter .modal-container,
.modal-leave-active .modal-container {
  -webkit-transform: scale(1.1);
  transform: scale(1.1);
}
</style>