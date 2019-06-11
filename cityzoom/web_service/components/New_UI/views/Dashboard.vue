<template>
  <!-- Main content -->
  <section class="content">
    <!-- GitHub hint -->
    <div class="row" v-if="hexagon_tuples && hexagon_tuples.length">

      <!-- Info boxes -->
      <div class="col-md-3 col-sm-6 col-xs-12">
        <info-box color-class="bg-aqua"
                  :icon-classes="['fas', 'cloud']"
                  text="Humidade"
                  :number="(hexagon_tuples.find(h => h._id.stream_name == 'humidity_stream').average * 100).toFixed(2) + '%'"></info-box>
      </div>
      <!-- /.col -->
      <div class="col-md-3 col-sm-6 col-xs-12">
        <info-box color-class="bg-red"
                  :icon-classes="['fas', 'thermometer-half']"
                  text="Temperatura"
                  :number="hexagon_tuples.find(h => h._id.stream_name == 'temperature_stream').average.toFixed(2) + 'ºC'"></info-box>
      </div>
      <!-- /.col -->

      <!-- fix for small devices only -->
      <div class="clearfix visible-sm-block"></div>
      
      <div class="col-md-3 col-sm-6 col-xs-12">
        <info-box color-class="bg-green"
                  :icon-classes="['fas', 'smog']"
                  text="PM 10 "
                  :number="hexagon_tuples.find(h => h._id.stream_name == 'pm10_stream').average.toFixed(2) + 'µg/m3'"></info-box>
      </div>
      <!-- /.col -->
      <div class="col-md-3 col-sm-6 col-xs-12">
        <info-box color-class="bg-yellow"
                  :icon-classes="['fas', 'smog']"
                  text="PM 25"
                  :number="hexagon_tuples.find(h => h._id.stream_name == 'pm25_stream').average.toFixed(2) + 'µg/m3'"></info-box>
      </div>
      <!-- /.col -->
       <div class="col-md-3 col-sm-6 col-xs-12">
        <info-box color-class="bg-purple"
                  :icon-classes="['fas', 'cloud']"  
                  text="Dióxido de Azoto"
                  :number="(hexagon_tuples.find(h => h._id.stream_name == 'no2_stream').average * 100).toFixed(2) + 'ppb'"></info-box>
      </div>
      <!-- /.col -->
      <div class="col-md-3 col-sm-6 col-xs-12">
        <info-box color-class="bg-yellow"
                  :icon-classes="['fas', 'thermometer-half']"
                  text="Ozono"
                  :number="hexagon_tuples.find(h => h._id.stream_name == 'ozone_stream').average.toFixed(2) + 'µg/m3'"></info-box>
      </div>
      <!-- /.col -->


      <!-- fix for small devices only -->
      <div class="clearfix visible-sm-block"></div>
      
      <div class="col-md-3 col-sm-6 col-xs-12">
        <info-box color-class="bg-green"
                  :icon-classes="['fas', 'smog']"
                  text="Pressão"
                  :number="hexagon_tuples.find(h => h._id.stream_name == 'pressure_stream').average.toFixed(2) + 'hPa'"></info-box>
      </div>
      <!-- /.col -->

    </div>
    <!-- /.row -->

    <div class="col-xs-12">
      <div class="box">
        <div class="box-header with-border">
          <h3 class="box-title"></h3>
          <div class="box-body">
            <div class="col-sm-6 col-xs-12">
              <p class="text-center">
                <strong>Histórico Temperatura</strong>
              </p>
              <canvas id="trafficBar" ></canvas>
            </div>
            <hr class="visible-xs-block">
            <div class="col-sm-6 col-xs-12">
              <p class="text-center">
                <strong>Número de alarmes</strong>
              </p>
              <canvas id="languagePie"></canvas>
            </div>
          </div>
        </div>
        <div class="text-center">
          <small><b>Pro Tip</b> Don't forget to star us on github!</small>
        </div>
      </div>
    </div>
    <!-- /.row -->
    <div class="col-xs-12">
      <small><b>Current Location Data</b></small>
      <p></p> 
    </div>
    <!-- Main row -->
    <div class="col-md-3 col-sm-6 col-xs-12">
        <process-info-box color-class="bg-yellow"
                          :icon-classes="['fas', 'smog']"
                          text="PM 2.5"
                          number="5,200"
                          :progress="50"
                          description="50% increase since May"></process-info-box>
      </div>
      <!-- /.col -->
      <div class="col-md-3 col-sm-6 col-xs-12">
        <process-info-box color-class="bg-green"
                          :icon-classes="['fas', 'smog']"
                          text="PM 10"
                          number="92,050"
                          :progress="20"
                          description="20% increase in 30 days"></process-info-box>
      </div>
      <!-- /.col -->
      <div class="col-md-3 col-sm-6 col-xs-12">
        <process-info-box color-class="bg-red"
                          :icon-classes="['fas', 'thermometer-half']"
                          text="Temperatura"
                          number="114,381"
                          :progress="70"
                          description="70% increase since yesterday"></process-info-box>
      </div>
      <!-- /.col -->
      <div class="col-md-3 col-sm-6 col-xs-12">
        <process-info-box color-class="bg-aqua"
                          :icon-classes="['fas', 'cloud']"
                          text="Humidade"
                          number="163,921"
                          :progress="40"
                          description="40% increase compared to last year"></process-info-box>
      </div>
      <!--
      <div class="col-md-3 col-sm-6 col-xs-12" >
      <no-ssr>
              <WeatherWidget 
                
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
      <!-- /.col -->
   
    <!-- /.row -->
  </section>
  <!-- /.content -->
</template>

<script>


export default {
  name: 'Dashboard',
    props:{
      hexagon: Array,
      hexagon_tuples: Array,
      municipality: Array,
      municipality_tuples: Array
    },
  data () {
    return {

      generateRandomNumbers (numbers, max, min) {
        var a = []
        for (var i = 0; i < numbers; i++) {
          a.push(Math.floor(Math.random() * (max - min + 1)) + max)
        }
        return a
      }
    }
  },
  computed: {
    coPilotNumbers () {
      return this.generateRandomNumbers(12, 1000000, 10000)
    },
    personalNumbers () {
      return this.generateRandomNumbers(12, 1000000, 10000)
    },
    isMobile () {
      return (window.innerWidth <= 800 && window.innerHeight <= 600)
    }
  },
  mounted () {
    console.log('é da prozis', this.hexagon)
    console.log(this.hexagon_tuples)
    console.log('municipality: '+JSON.stringify(this.municipality[0]))
    console.log(this.municipality[0].created_at)
    console.log(this.municipality.filter(h => h.stream_name=='ozone_stream'))
    console.log('este aki memo',this.coPilotNumbers)
      this.$nextTick(() => {
      var ctx = document.getElementById('trafficBar').getContext('2d')
      var config = {
        type: 'line',
        data: {
          labels: this.municipality.filter( h => h.stream_name == 'ozone_stream').map(k => k.created_at),
          datasets: [{
            label: 'Temperatura Munícipio',
            fill: false,
            borderColor: '#284184',
            pointBackgroundColor: '#284184',
            backgroundColor: 'rgba(0, 0, 0, 0)',
            data: this.municipality.filter( h => h.stream_name == 'ozone_stream').map(k => k.value)
          }, {
            label: 'A sua localização',
            borderColor: '#4BC0C0',
            pointBackgroundColor: '#4BC0C0',
            backgroundColor: 'rgba(0, 0, 0, 0)',
            data: []
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: !this.isMobile,
          legend: {
            position: 'bottom',
            display: true
          },
          tooltips: {
            mode: 'label',
            xPadding: 10,
            yPadding: 10,
            bodySpacing: 10
          }
        }
      }

      new Chart(ctx, config) // eslint-disable-line no-new

      var pieChartCanvas = document.getElementById('languagePie').getContext('2d')
      var pieConfig = {
        type: 'pie',
        data: {
          labels: ['Neutro', 'Mau', 'Muito Mau'],
          datasets: [{
            data: [56.6, 37.7, 4.1],
            backgroundColor: ['#00a65a', '#f39c12', '#FF0000'],
            hoverBackgroundColor: ['#00a65a', '#f39c12', '#FF0000']
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: !this.isMobile,
          legend: {
            position: 'bottom',
            display: true
          }
        }
      }

      new Chart(pieChartCanvas, pieConfig) // eslint-disable-line no-new
    })
  }
}
</script>
<style>
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
