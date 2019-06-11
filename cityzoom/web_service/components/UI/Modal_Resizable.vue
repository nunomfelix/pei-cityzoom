<template>
  <transition name="modal">
    <div @click="$emit('close')" class="modal-mask">
      <div class="modal-wrapper">
        <div class="modal-container">
          <div class="modal-header">
            <span class="normal">Device Information</span> 
          </div>

          <div class="modal-body">
            <slot name="body">
              <!--
            <div v-if="item.type=='lines'">
                <LineGraph :ref="item.i" :name="item.i" :values="values"/>
            </div>
              -->
              <div v-for="(stream, index) of device.streams" :key="index">
                <div style="position: relative; height: 400px">
                  <line-chart v-if="show" :height="300" :collection="datacollections[stream]" :options="options[stream]"/>
                  <Loading :show="!show" type="absolute" />
                </div>
              </div>
            </slot>
          </div>

          <div class="modal-footer">
            <slot name="footer">
              <button class="modal-default-button" @click="$emit('close')">Close</button>
            </slot>
          </div>
        </div>
      </div>
    </div>
  </transition>
</template>
<script>
var item = {
  x: 0,
  y: 0,
  w: 12,
  h: 14,
  i: "line_a",
  type: "lines",
  data: "fake"
};
export default {
  props: { device: Object },
  name: "Modal_Resizable",

  data() {
    return {
      show: false,
      streams: [],
      item: item,
      datacollections: {},
      position: null,
      options: {}
    };
  },
  computed: {
    getStreams() {
      return this.$store.state.verticals.reduce((map, vertical) => {
        vertical.streams.forEach(s => {
          const {name, ...rest} = s
          map[name] = rest
        })
        return map
        }, {})
    }
  },
  mounted: async function() {
    await this.update()
    setInterval(async () => {
      await this.update()
    }, 5000)
  },

  methods: {
    fillData(labels, y_axis, stream) {
      this.datacollections[stream] = {
        labels: labels,
        datasets: [
          {
            label: this.getStreams[stream].display,
            backgroundColor: "#0099FF",
            data: y_axis
          }
        ]
      };
    },
    getRandomInt() {
      return Math.floor(Math.random() * (50 - 5 + 1)) + 5;
    },
    async update() {
      const res = await this.$axios.get(
        `http://193.136.93.14:8002/devices/${this.device.device_ID}/values`,
        {
          headers: {
            Authorization: this.$store.state.jwt
          }
        }
      );
      this.streams = res.data.map(r => r._id);

      for (var stream of res.data) {
        var labels = [];
        var y_axis = [];
        for (var value of stream.values) {
          y_axis.push(value.value);
          labels.push(value.timestamp);
        }
        this.fillData(labels, y_axis, stream._id);

      this.options[stream._id] = {
          elements: {
            line: {
              tension: 0
            }
          },
          scales: {
            xAxes: [
              {
                type: "time",
              }
            ],
            yAxes: [{
              display: true,
              ticks: {
                max: this.getStreams[stream._id].max + (this.getStreams[stream._id].max - this.getStreams[stream._id].min) * .05,
                min: this.getStreams[stream._id].min - (this.getStreams[stream._id].max - this.getStreams[stream._id].min) * .05,    // minimum will be 0, unless there is a lower value.
              }
          }]
          
          }
        }
      }

    this.show = false
    setTimeout(() => {

      this.show = true;
    }, 0)

    },
    convertTimestamp(t) {
      var dt = new Date(t);
      var day = dt
        .getDate()
        .toString()
        .padStart(2, "0");
      var hr = dt
        .getHours()
        .toString()
        .padStart(2, "0");
      var m = dt
        .getMinutes()
        .toString()
        .padStart(2, "0");
      return day + ":" + hr + ":" + m.substr(-2);
    }
  }
};
</script>

<style lang="scss">
.modal-mask {
  position: fixed;
  z-index: 9998;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: table;
  transition: opacity 0.3s ease;
}

.modal-wrapper {
  display: table-cell;
  vertical-align: middle;
}

.modal-container {
  height: 70vh;
  overflow: auto;
  width: 600px;
  margin: 0px auto;
  padding: 20px 30px;
  background-color: #fff;
  border-radius: 2px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.33);
  transition: all 0.3s ease;
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

::-webkit-scrollbar {

width: .75rem;
}

::-webkit-scrollbar-thumb {
  background-color: blue;
  -webkit-box-shadow: inset 1px 1px 0 rgba(0,0,0,0.10),inset 0 -1px 0 rgba(0,0,0,0.07); 
  &:hover {
    background-color: rgb(0, 0, 179);
    &:active {
      background-color: rgb(0, 0, 129);
    }
  }
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