const axios = require('axios')

//get_ipma_data(['Aveiro', 'Coimbra', 'Viseu', 'Funchal'])

async function get_darksky_data(lat, long){
    var tmp = {}
    var city_info = await axios.get('https://api.darksky.net/forecast/f5e30cf666320006447f251880cad6bc/' + lat + ',' + long +'?units=si')
    tmp['Temperature'] = city_info.data.currently.temperature
    tmp['PrecipProbability'] = city_info.data.currently.precipProbability
    tmp['Humidity'] = city_info.data.currently.humidity
    tmp['Pressure'] = city_info.data.currently.pressure
    tmp['Ozone'] = city_info.data.currently.ozone
}

//get_darksky_data(40.6322758, -8.6496226) //Aveiro coordinates