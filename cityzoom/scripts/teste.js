const geojson2h3 = require('geojson2h3')
const axios = require('axios')
const fs = require('fs')

const geojson = axios.get('http://localhost:3000/concelho_aveiro.geojson').then(res => {
    const { type } = res.data
    const tmp = {
        type,
        features: []
    }
    const hex = [
        
    ]
    for(var feature of res.data.features) {
        const hexagons = geojson2h3.featureToH3Set(feature, 9);
        const feat = geojson2h3.h3SetToFeatureCollection(hexagons);
        for(var f in feat.features) {
            delete feat.features[f].id
            feat.features[f].properties.id = feature.properties.id + f
            feat.features[f].properties.municipality = feature.properties.id
            hex.push({
                id: feat.features[f].properties.id,
                coordinates: feat.features[f].geometry.coordinates[0],
                municipality: feat.features[f].properties.municipality
            })
        }
        tmp.features.push(...feat.features)
    }
    fs.writeFile('concelho_aveiro_hex.geojson', JSON.stringify(tmp), () => {
        console.log("done")
    })
    fs.writeFile('hex_data.json', JSON.stringify(hex), () => {
        console.log("done")
    })
    console.log(JSON.stringify(hex, null, 2))
})

// fs.readFile('concelho_aveiro_hex.geojson', (err, res) => {
//     res = JSON.parse(res)
//     for(var feature of res.features) {
//         for(var polygon of feature.geometry.coordinates[0]) {
//             if(polygon.length != 2)
//                 console.log(polygon.length)
//         }
//     }
// })