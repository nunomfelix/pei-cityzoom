<script>
import { Bar,mixins } from 'vue-chartjs'
const { reactiveProp } = mixins
export default {
  extends: Bar,
  mixins: [reactiveProp],
  
  mounted () {
    // Overwriting base render method with actual data.
    console.log('entrei')
    this.renderChart({
      labels: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
      datasets: [
        {
          label: 'GitHub Commits',
          backgroundColor: '#f87979',
          data: [40, 20, 12, 23, 10, 40, 39, 35, 40, 20, 12, 11]
        }
      ]
    })
  }
}
</script>

<style>

</style>



