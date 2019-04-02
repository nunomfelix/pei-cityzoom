const axios = require('axios')

const city_codes = {
    'Aveiro'            : 'AVR',
    'Beja'              : 'BJA',
    'Braga'             : 'BRG',
    'Braganca'          : 'BGC',
    'Coimbra'           : 'CBO',
    'Castelo Branco'    : 'CBR',
    'Evora'             : 'EVR',
    'Faro'              : 'FAR',
    'Guarda'            : 'GDA',
    'Leiria'            : 'LRA',
    'Lisboa'            : 'LSB',
    'Portalegre'        : 'PTG',
    'Porto'             : 'PTO',
    'Santarem'          : 'STM',
    'Setubal'           : 'STB',
    'Viana do Castelo'  : 'VCT',
    'Vila Real'         : 'VRL',
    'Viseu'             : 'VIS',
    'Funchal'           : 'MCS',
    'Porto Santo'       : 'MPS',
    'Acores Oriente'    : 'AOR',
    'Acores Centro'     : 'ACE',
    'Acores Ocidente'   : 'AOC'
}

/*Receives a list of cities as argument
  Sends data from all cities
*/
async function get_ipma_data(city){

    //Get city ids
    var city_ids = new Map()
    const districts = await axios.get('http://api.ipma.pt/open-data/distrits-islands.json')
    districts.data.data.forEach(e => {
        city_ids.set(e.idAreaAviso, e.globalIdLocal)
    })

    //Get city data
    var tmp = {}
    var globalIdLocal = city_ids.get(city_codes[city])
    var city_info = await axios.get('http://api.ipma.pt/open-data/forecast/meteorology/cities/daily/' + globalIdLocal + '.json')
    tmp['Temperature'] = ((parseFloat(city_info.data.data[0].tMin) + parseFloat(city_info.data.data[0].tMax))/2).toFixed(2)
    tmp['PrecipProbability'] = parseFloat(city_info.data.data[0].precipitaProb)
    location = {'lat': parseFloat(city_info.data.data[0].latitude),
                'long': parseFloat(city_info.data.data[0].longitude)}

    return [tmp,location]
}

async function create_ipma_stream(){
    axios.post('192.136.93.14:8001/cbz/stream', {
        'name': 'ipma_stream',
        'description': 'ipma_stream',
        'mobile': false,
        'type': 'ipma_post',
        'ttl': 120000,
        'periodicity': 1200
    }).catch( ()=> {console.log('Failed to post to 192.136.93.14:3000')})
}

async function put_ipma_data(data, location){
    axios.put('192.136.93.14:8001/cbz/stream', {
        'stream_name': 'ipma_stream',
        'value': data,
        'location': {
            'latitude' : location['lat'],
            'longitude' : location['long']
        }
    }).catch( ()=> {console.log('Failed to put to 192.136.93.14:8001')})
}
 
function main(){
    create_ipma_stream()

    setInterval(async () => {
        var data = await get_ipma_data('Aveiro')
        console.log(data)
        put_ipma_data(data[0], data[1])
    }, 1000*60*60*24); //every 24 hours
}

main()
//get_ipma_data('Aveiro')
