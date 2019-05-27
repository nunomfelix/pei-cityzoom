const geojson2h3 = require('geojson2h3')
const axios = require('axios')

const geojson = axios.get('http://localhost:3000/concelho_aveiro.geojson').then(res => {
    console.log(res)
})