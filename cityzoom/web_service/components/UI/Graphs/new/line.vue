<script>
import { Line, mixins } from 'vue-chartjs'
const { reactiveProp } = mixins

export default {
  extends: Line,
  props: {
    data: [],
    options: {},
    collection: {}
  },
  mounted () {
    // this.chartData is created in the mixin.
    // If you want to pass options please create a local options object
    this.renderChart(this.collection, this.options)
  },
  
  
  
}
</script>

<style>
</style>