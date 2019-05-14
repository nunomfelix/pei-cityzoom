const fs = require('fs')

fs.readFile('portugal_municipios.geojson', 'utf8', (err, res) => {
    const data = JSON.parse(res)
    const tmp = []
    for(var feature of data.features) {
        if(['Aveiro', 'Ílhavo', 'Murtosa', 'Ovar', 'Estarreja', 'Ovar', 'Albergaria-a-Velha', 'Anadia', 'Águeda', 'Oliveira do Bairro', 'Vagos', 'Vale de Cambra', 'Oliveira de Azeméis'].includes(feature.properties.name_2))
        tmp.push(feature)
    }
    console.log({
        ...data,
        features:tmp
    })
    fs.writeFile('aveiro.geojson',JSON.stringify({
        ...data,
        features:tmp
    }), () => {})
})