<template>
  <div class="mainMargin fontSize" >
    <b-table :items="items" :fields="fields" :tbody-tr-class="rowClass">
      <template slot="location" slot-scope="data">
        
        <div class="img">
          {{ data.value }} <img @click="tableImage()" src="icons/search.png">

        </div>
      </template>
    </b-table>
  </div>
</template>

<script>
  export default {
    data() {
      return {
        fields: ['device_id', 'device_status', 'streams','location'],
        items: [
          { device_id: 1, device_status: 'Operational', streams: 'CO2, Temperature' , location: 'Aveiro' , _cellVariants: { device_status: 'success' }},
          { device_id: 2, device_status: 'Operational', streams: 'CO2, Temperature', location: 'Aveiro'  ,_cellVariants: { device_status: 'success' }},
          { device_id: 3, device_status: 'Operational', streams: 'CO2, Temperature', location: 'Aveiro'  ,_cellVariants: { device_status: 'success' }},
          { device_id: 4, device_status: 'Operational', streams: 'CO2, Temperature', location: 'Aveiro ' ,_cellVariants: { device_status: 'success' }},
        ]
      }
    },
    methods: {
      rowClass(item, type) {
        if (!item) return
        if (item.status === 'awesome') return 'table-success'
      },
      tableImage() {
        return ''
      }
    }
  }
</script>

<style lang="scss" scoped>
@import "~/assets/mixins.scss";

.table{
    position: relative;
    border-radius: 10px;
    
    width: 100%; 
    background: white;
}

img{
  display: inline-block;
  width:15px;
  height:auto;
}

.fontSize{
  font-family:'Verdana';
  font-size:medium;
}
</style>
