const axios = require('axios')

async function get_darksky_data(lat, long){

    var tmp = {}
    var city_info = await axios.get('https://api.darksky.net/forecast/f962475109da7278cd8ca1ba22186bee/' + lat + ',' + long +'?units=si')
    tmp['Temperature'] = city_info.data.hourly.data[0].temperature
    tmp['PrecipProbability'] = city_info.data.hourly.data[0].precipProbability
    tmp['Humidity'] = city_info.data.hourly.data[0].humidity
    tmp['Pressure'] = city_info.data.hourly.data[0].pressure
    tmp['Ozone'] = city_info.data.hourly.data[0].ozone

    location = {
        'lat': lat,
        'long': long
    }
    return [tmp, location]
}

async function create_darksky_stream(){
    axios.post('193.136.93.14:8001/cbz/stream', {
        'name': 'darksky_stream',
        'description': 'darksky_stream',
        'mobile': false,
        'type': 'darksky_post',
        'ttl': 120000,
        'periodicity': 1200
    }).catch( ()=> {console.log('Failed to post to 193.136.93.14:8001')})
}

async function put_darksky_data(data, location){
    axios.put('193.136.93.14:8001/cbz/stream', {
        'stream_name': 'darksky_stream',
        'value': data,
        'location': {
            'latitude' : location['lat'],
            'longitude' : location['long']
        }
    }).catch( ()=> {console.log('Failed to put to 19.136.93.14:8001')})
}

function main(){
    create_darksky_stream()

    setInterval(async () => {
        var data = await get_darksky_data(40.6322758, -8.6496226)
        console.log(data)
        put_darksky_data(data[0], data[1])
    }, 1000*60*60); //every 2 minutes, making 720 requests a day (the max possible is 1000)
}

main()

//get_darksky_data(40.6322758, -8.6496226) //Aveiro coordinates
//get_darksky_data(37.8267,-122.4233)