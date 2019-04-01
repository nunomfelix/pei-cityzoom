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
  Returns most recent data of each city in cities
*/
async function get_ipma_data(cities){

    //Get city ids
    var city_ids = new Map()
    const districts = await axios.get('http://api.ipma.pt/open-data/distrits-islands.json')
    districts.data.data.forEach(e => {
        city_ids.set(e.idAreaAviso, e.globalIdLocal)
    })
    
    //Get data of cities
    var data = {}

    for(i=0; i<cities.length; i++){
        var tmp = {}
        var globalIdLocal = city_ids.get(city_codes[cities[i]])
        var city_info = await axios.get('http://api.ipma.pt/open-data/forecast/meteorology/cities/daily/' + globalIdLocal + '.json')
        tmp['Temperature'] = ((parseFloat(city_info.data.data[0].tMin) + parseFloat(city_info.data.data[0].tMax))/2).toFixed(2)
        tmp['PrecipProbability'] = parseFloat(city_info.data.data[0].precipitaProb)

        data[cities[i]] = tmp
    }

    send_ipma_data(data)

}

async function send_ipma_data(data){
    console.log(data)
    //Broker uri

    //Post data
}
 
//get_ipma_data(['Aveiro', 'Coimbra', 'Viseu', 'Funchal'])