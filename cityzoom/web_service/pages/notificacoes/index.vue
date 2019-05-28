<template>
  <div class="mainMargin fontSize" >
    <b-table :items="items" :fields="fields" :tbody-tr-class="rowClass">
      <template slot="alert_info" slot-scope="data">
        <div class="img">
          {{ data.value }} 
          <img @click="tableImage()" src="icons/sensor.png" style="width:25px">
          <img @click="tableImage()" src="icons/streams/humidity_stream.png" style="width:25px">
          <img @click="tableImage()" src="icons/streams/ozone_stream.png" style="width:25px">
          <img @click="tableImage()" src="icons/streams/pressure_stream.png" style="width:25px">

        </div>
      </template>
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
    props:{values: Object},

    data() {
      return {
        fields: ['device_id', 'streams_id', 'alert_info','location'],
        items: [
          { device_id: 1, streams_id: '3', streams: '' , location: 'Aveiro', _rowVariant: 'success'},
          { device_id: 2, streams_id: '2', alert_info: '', location: 'Aveiro', _rowVariant: 'warning'},
          { device_id: 3, streams_id: '4', alert_info: '', location: 'Aveiro'  ,_rowVariant: 'danger' },
          { device_id: 4, streams_id: '144', alert_info: '', location: 'Aveiro ',_rowVariant: 'danger' },
          { device_id: 5, streams_id: '200', alert_info: '', location: 'Aveiro ',_rowVariant: 'warning' },
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

