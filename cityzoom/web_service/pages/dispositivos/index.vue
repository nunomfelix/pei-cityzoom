<template>
  <div class="mainMargin">
    <b-table :items="items" :fields="fields" :tbody-tr-class="rowClass"></b-table>
  </div>
</template>

<script>
  export default {
    data() {
      return {
        fields: ['first_name', 'last_name', 'age'],
        items: [
          { age: 40, first_name: 'Dickerson', last_name: 'Macdonald', status: 'awesome' },
          { age: 21, first_name: 'Larsen', last_name: 'Shaw' },
          { age: 89, first_name: 'Geneva', last_name: 'Wilson' },
                    { age: 89, first_name: 'Geneva', last_name: 'Wilson' },
          { age: 89, first_name: 'Geneva', last_name: 'Wilson' },
          { age: 89, first_name: 'Geneva', last_name: 'Wilson' }

        ]
      }
    },
    methods: {
      rowClass(item, type) {
        if (!item) return
        if (item.status === 'awesome') return 'table-success'
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

</style>
