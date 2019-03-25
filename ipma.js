const axios = require('axios')

async function get_ipma_data(){

    //Get city ids
    var city_ids = new Map()
    const districts = await axios.get('http://api.ipma.pt/open-data/distrits-islands.json')
    await districts.data.data.forEach(e => {
        city_ids.set(e.idAreaAviso, e.globalIdLocal)
    })
    //console.log(city_ids)
    
    //Get data of city
    var data = {}
    const globalIdLocal = city_ids.get('AVR') //Data of Aveiro
    data['Distrito'] = 'Aveiro'
    const city_info = await axios.get('http://api.ipma.pt/open-data/forecast/meteorology/cities/daily/' + globalIdLocal + '.json')

    data['Temperature'] = (parseFloat(city_info.data.data[0].tMin) + parseFloat(city_info.data.data[0].tMax))/2
    data['PrecipProbability'] = parseFloat(city_info.data.data[0].precipitaProb)

    send_ipma_data(JSON.stringify(data))
}

async function send_ipma_data(data){
    
    //Broker uri

    //Post data
}
 
get_ipma_data()