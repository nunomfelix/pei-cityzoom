<template>
    <div class="mapMargin mapHeight" style="position:relative">
        <div class="mapHeight" id="map"></div>
        <div v-if="selected_county" :style="{ 'background-color': municipalityValues[selected_county.get('id')].color}" class="ol-popup top">
            <div style="background-color: rgba(0,0,0, .5)">
                <span class="big"> {{selected_county.get('Freguesia')}} </span>
                <span class="big"> 
                    {{municipalityValues[selected_county.get('id')].value ? municipalityValues[selected_county.get('id')].value.toFixed(2) + getVerticals[selected_vertical].streams[selected_stream].unit
                        : 'No Values'}}
                </span>
                <div class="scale-band-wrapper">
                    <div :class="{selected: index == municipalityValues[selected_county.get('id')].index}" v-for="index in 100" :key="index" :style="{'background-color': '#' + rainbowHeatMap.colourAt(index)}"></div>
                </div>
            </div>
        </div>

        <div id="hover_popup" class="ol-popup" :style="{ 'background-color': hovered_geo ? municipalityValues[hovered_geo.get('id')].color : 'none'}">
            <div v-if="hovered_geo" style="background-color: rgba(0,0,0, .5)">
                <span class="normal"> {{hovered_geo.get('Freguesia')}} </span>
                <span class="normal"> 
                    {{municipalityValues[hovered_geo.get('id')].value ? municipalityValues[hovered_geo.get('id')].value.toFixed(2) + getVerticals[selected_vertical].streams[selected_stream].unit
                        : 'No Values'}}
                    </span>
                <!-- <div class="scale-band-wrapper">
                    <div :class="{selected: index == municipalityValues[hovered_geo.get('id')].index}" v-for="index in 100" :key="index" :style="{'background-color': '#' + rainbowHeatMap.colourAt(index)}"></div>
                </div> -->
            </div>
        </div>

        <div class="map-menu left" :class="{show: selected_county != null, active: selected_county == null}">
            <div class="map-menu_button" @click="deselect_county()">
            </div>
        </div>

        <div class="map-menu show">
            <div v-if="selected_vertical != null && selected_stream != null" class="map-menu_left">
                <div @mousedown="selectStream(i)" :class="{active: stream.name == getVerticals[selected_vertical].streams[selected_stream].name}" :title="stream.display" v-for="(stream, i) in getVerticals[selected_vertical].streams" :key="i" class="map-menu_button">
                    <img :src="`icons/streams/${getVerticals[selected_vertical].streams[i].name}.png`" alt="">
                </div>
            </div>
            <div class="map-menu_center">

            </div>
            <div v-if="selected_vertical != null" class="map-menu_right">
                <div @mousedown="selectVertical(i)" :class="{active: vertical.name == getVerticals[selected_vertical].name}" :title="vertical.display" v-for="(vertical, i) in getVerticals" :key="i" class="map-menu_button">
                    <img :src="`icons/${vertical.name}.png`" alt="">
                </div>
            </div>
        </div>
        <Loading :show="!loaded" type="absolute"/> 
        <ModalResizable v-if="showModal" @close="showModal = false" :values="values"/>
    </div>
</template>

<script>
var h3 = require('h3-js');
var Rainbow = require('rainbowvis.js');
const drone_stream = require('static/get_stream_values_response.json');
import intersect from '@turf/intersect'
const helpers =  require('@turf/helpers')
//console.log(JSON.stringify(drone_stream))  
export default {
    data() {
        return {
            values: drone_stream,
            req: {
                Ol: null,
                etent: null,
                geom: null,
                proj: null,
            },
            map: null,
            loaded: false,
            geoStyle: {
                default: null,
                hover: null,
                selected: null
            },
            devicesStyle: {
                templates: {
                    default: {
                        scale: 0.8,
                    },
                    hover: {
                        scale: 1.2,
                    },
                },
                styles: {}
            },  
            hoverOverlay: null,
            hoverPopup: null,

            municipalityValues: {},
            hexagonValues: {},
            
            testValues: {},
            testValuesOrdered: [],
            rainbowHeatMap: null,

            selected_vertical: null,
            selected_stream: null,
            selected_county: null,
            hovered_geo: null,

            geoJsonExtent: null,
            showModal: false,

            geo_layer: null,
            devices_layer: null,
            shown_features: [],
            hidden_hex: [],

            data: { 'Águeda':
                { temperature_stream: 18.58,
                    pressure_stream: 1014.08,
                    humidity_stream: 0.82,
                    ozone_stream: 314.83 },
                Estarreja:
                { temperature_stream: 16.62,
                    pressure_stream: 1014.21,
                    humidity_stream: 0.92,
                    ozone_stream: 314.61 },
                Murtosa:
                { temperature_stream: 16.17,
                    pressure_stream: 1014.26,
                    humidity_stream: 1,
                    ozone_stream: 314.54 },
                'Oliveira de Azeméis':
                { temperature_stream: 18.4,
                    pressure_stream: 1014.15,
                    humidity_stream: 0.75,
                    ozone_stream: 314.54 },
                'Oliveira do Bairro':
                { temperature_stream: 17.94,
                    pressure_stream: 1014.14,
                    humidity_stream: 0.92,
                    ozone_stream: 315.04 },
                Ovar:
                { temperature_stream: 17.91,
                    pressure_stream: 1014.25,
                    humidity_stream: 0.84,
                    ozone_stream: 314.46 },
                Vagos:
                { temperature_stream: 17.52,
                    pressure_stream: 1014.25,
                    humidity_stream: 0.97,
                    ozone_stream: 314.56 },
                'Vale de Cambra':
                { temperature_stream: 18.06,
                    pressure_stream: 1014.1,
                    humidity_stream: 0.73,
                    ozone_stream: 314.21 },
                'Ílhavo':
                { temperature_stream: 17.53,
                    pressure_stream: 1014.27,
                    humidity_stream: 0.96,
                    ozone_stream: 314.56 },
                'Albergaria-a-Velha':
                { temperature_stream: 18.34,
                    pressure_stream: 1014.15,
                    humidity_stream: 0.81,
                    ozone_stream: 314.78 },
                Anadia:
                { temperature_stream: 18.47,
                    pressure_stream: 1014.07,
                    humidity_stream: 0.61,
                    ozone_stream: 315.32 },
                Aveiro:
                { temperature_stream: 16.75,
                    pressure_stream: 1014.23,
                    humidity_stream: 0.98,
                    ozone_stream: 314.66 } 
            }
        }
    },
    computed: {
        getVerticals() {
            return this.$store.state.verticals
        },
        getDevices() {
            return this.$store.state.devices
        },
        getHeatmap() {
            return this.$store.state.heatmap
        }
    },
    async mounted() {
        this.req.Ol = require( 'ol');
        this.req.proj = require('ol/proj')
        const source = require( 'ol/source');
        const layer = require( 'ol/layer');
        this.req.style = require( 'ol/style');
        this.req.extent = require( 'ol/extent');
        this.req.format = require('ol/format')
        this.req.geom = require( 'ol/geom');
        const interaction = require( 'ol/interaction');
        const { Feature } = require( 'ol')
        const { click, pointerMove, altKeyOnly, noModifierKeys, altShiftKeysOnly, platformModifierKeyOnly } = require( 'ol/events/condition.js');
        
        for(var style in this.devicesStyle.templates) {
            for(var vertical of this.getVerticals) {
                if(!(vertical.name in this.devicesStyle.styles))
                    this.devicesStyle.styles[vertical.name] = {}
                this.devicesStyle.styles[vertical.name][style] = new this.req.style.Style({
                    image: new this.req.style.Icon(/** @type {olx.this.req.style.IconOptions} */ ({
                        anchor: [0.5, 0.5],
                        anchorXUnits: 'fraction',
                        anchorYUnits: 'fraction',
                        scale: this.devicesStyle.templates[style].scale,
                        opacity: 1,
                        src: `icons/${vertical.name}_map.png`
                    }))
                })
            }
        }

        this.geoStyle.default = new this.req.style.Style({
            fill: new this.req.style.Fill({
                color: 'rgba(255,255,255,0)'
            }),
            stroke: new this.req.style.Stroke({
                color:'rgb(48, 145, 198)',
                width: 1
            })
        })

        this.geoStyle.hover = new this.req.style.Style({
            fill: new this.req.style.Fill({
                color: 'rgba(225, 225, 225, .65)'
            }),
            stroke: new this.req.style.Stroke({
                color:'rgb(0, 0, 255)',
                width: 1.5
            })
        })

        this.geoStyle.active = new this.req.style.Style({
            fill: new this.req.style.Fill({
                color: 'rgba(255, 255, 255, 0)'
            }),
            stroke: new this.req.style.Stroke({
                color:'rgb(0, 0, 125)',
                width: 3.5
            })
        })

        this.geo_layer = new layer.Vector({
            source: new source.Vector({
                projection : 'EPSG:3857',
                url: 'concelho_aveiro.geojson',
                format: new this.req.format.GeoJSON()
            }),
            renderBuffer: window.innerWidth,
            updateWhileAnimating: true,
            style: (feature) => {
                return feature == this.selected_county ? this.geoStyle.active : this.geoStyle.default 
            }
        })

        this.hoverPopup = document.getElementById('hover_popup');
        this.hoverOverlay = new this.req.Ol.Overlay({
            element: this.hoverPopup,
            autoPan: false,
            positioning: 'top-center',
            autoPanAnimation: {
                duration: 250
            }
        })
        
        this.devices_layer = new layer.Vector({
            source: new source.Vector(),
            style: (feature) => {
                return this.devicesStyle.styles[this.getVerticals[this.selected_vertical].name].default
            },
            renderBuffer: window.innerWidth,
            updateWhileAnimating: true,
        }) 

        this.hex_layer = new layer.Vector({
            source: new source.Vector({
                projection : 'EPSG:3857',
                url: 'concelho_aveiro_hex.geojson',
                format: new this.req.format.GeoJSON()
            }),
            renderBuffer: window.innerWidth,
            updateWhileAnimating: true,
        })

        const centerpos = [-8.661682, 40.6331731];
        const center = this.req.proj.transform(centerpos, 'EPSG:4326', 'EPSG:3857');
        const maxExtent = [-9.5, 37, -6.2, 42.5];
        //const maxExtent = [-180, -90, 180, 90];
        this.map = new this.req.Ol.Map({
            target: 'map',
            layers: [
                new layer.Tile({
                    source: new source.OSM(),
                }),
                this.devices_layer, 
                this.hex_layer,  
                this.geo_layer,     
            ],
            overlays: [this.hoverOverlay],
            view: new this.req.Ol.View({
                zoom: 8,
                center,
                minZoom: 6,
                maxZoom: 14
            })
        })

        // const res = await this.$axios.get('/a.json')
        // for(var munic in res.data) {
        //     let count = 0
        //     for(var area of res.data[munic]) {
        //         for(var hex of area) {
        //             const pol = hex.map(p => this.req.proj.transform(p, 'EPSG:4326', 'EPSG:3857'))
        //             const a = new Feature({
        //                 geometry: new this.req.geom.Polygon([pol]),
        //                 municipality: munic,
        //                 id: munic + count++
        //             })
        //             //this.hex_layer.getSource().addFeature(a)
        //         }
        //     }
        // }

        this.hex_layer.getSource().on('change', () => {
            if(this.hex_layer.getSource().getState() == 'ready' && !this.loaded) {
                this.loaded = true
                this.rainbowHeatMap = new Rainbow()

                this.geoJsonExtent = this.req.extent.createEmpty()
                this.geo_layer.getSource().getFeatures().forEach(feature => {
                    this.geoJsonExtent = this.req.extent.extend(this.geoJsonExtent, feature.getGeometry().getExtent())
                })

                this.hex_layer.getSource().getFeatures().forEach((feature) => {
                    
                    const tmp = Math.random() * 35 + 5;

                    if(!(feature.get('municipality') in this.municipalityValues)) {
                        this.municipalityValues[feature.get('municipality')] = {
                            value: 0,
                            count: 0,
                            color: null,
                            style: null
                        }
                    }

                    this.hexagonValues[feature.get('id')] = {
                        value: tmp,
                        color: null,
                        style: null
                    }

                })

                this.map.getView().fit(this.geoJsonExtent, {
                    duration: 500
                })
 
                setTimeout(() => {
                    this.map.getView().fit(this.geoJsonExtent, {
                        duration: 500
                    })
                },0)

                this.selectVertical(0)
            }
        })

        const hover_interaction = new interaction.Select({
            condition: (e) => {
                return pointerMove(e) && !this.map.getView().getAnimating();
            },
            layers: [this.geo_layer],
            style: (feature) => {
                return feature == this.selected_county 
                    ? this.geoStyle.active
                    : this.geoStyle.hover
            },
            multi: false
        })

        this.map.addInteraction(hover_interaction);
        hover_interaction.on('select', (e) => {
            if(e.selected.length && e.selected[0] != this.selected_county) {
                if(this.hovered_geo) {
                    this.clearGeoDevices(this.hovered_geo)
                    this.addHiddenHex(this.hovered_geo)
                }
                this.hovered_geo = e.selected[0]
                document.body.style.cursor = "pointer"
                const center = this.req.extent.getCenter(this.hovered_geo.getGeometry().getExtent()),
                      bottom = this.req.extent.getBottomRight(this.hovered_geo.getGeometry().getExtent())
                this.hoverOverlay.setPosition([center[0], (center[1] + bottom[1]) / 2]) 
                if(this.selected_county != null) {
                    for(var device of this.getDevices) {
                        if(device.hexagon && device.hexagon.substring(0, 6) == this.hovered_geo.get('id') && this.hovered_geo.get('id') != this.selected_county && device.vertical.includes(this.getVerticals[this.selected_vertical].name)){
                            var location = device.mobile ? [device.locations[device.locations.length - 1].latitude, device.locations[device.locations.length - 1].longitude] :
                                                [device.locations[0].latitude, device.locations[0].longitude]
                            const feat = new Feature({
                                geometry: new this.req.geom.Point(this.req.proj.transform([location[1],location[0]], 'EPSG:4326', 'EPSG:3857')),
                                id: device.device_id,
                            })
                            this.devices_layer.getSource().addFeature(feat)
                            this.shown_features.push(feat);
                        }
                    }
                }
                for(var feat of this.hex_layer.getSource().getFeatures()) {
                    if(feat.get('municipality') == this.hovered_geo.get('id')) {
                        this.hex_layer.getSource().removeFeature(feat)
                        this.hidden_hex.push(feat)
                    }
                }
            } else if(this.hovered_geo) {
                this.clearGeoDevices(this.hovered_geo)
                this.addHiddenHex(this.hovered_geo)
                this.clearHoverPopup()
            }
        })

        const click_interaction = new interaction.Select({
            condition: (e) => {
                return click(e);
            },
            layers: [this.geo_layer, this.devices_layer],
            multi: true
        })

        this.map.addInteraction(click_interaction);
        click_interaction.on('select', (e) => {
            document.body.style.cursor = "default"
            const geo_feature = e.selected[0]
            if(geo_feature.get('id') && geo_feature != this.selected_county) {
                this.map.setView(new this.req.Ol.View({
                    center: this.map.getView().getCenter(),
                    zoom: this.map.getView().getZoom(),
                    minZoom: 0,
                    maxZoom: 18
                }))

                this.hovered_geo = null
                this.selected_county = geo_feature 
                this.shown_features = []
                this.devices_layer.getSource().clear()

                for(var device of this.getDevices) {
                    if(device.hexagon && device.hexagon.substring(0, 6) == this.selected_county.get('id') && device.vertical.includes(this.getVerticals[this.selected_vertical].name)) {
                        var location = [device.locations[device.locations.length - 1].latitude, device.locations[device.locations.length - 1].longitude]
                        const feat = new Feature({
                            geometry: new this.req.geom.Point(this.req.proj.transform([location[1],location[0]], 'EPSG:4326', 'EPSG:3857')),
                            id: device.device_id,
                        })
                        this.devices_layer.getSource().addFeature(feat)
                        this.shown_features.push(feat);
                    }
                }
                this.hoverOverlay.setPosition(null)

                setTimeout(() => {
                    this.map.getView().fit(geo_feature.getGeometry().getExtent(), {
                        duration: 500,
                        padding: [120, 140, 0, 0],
                        callback: () =>  {
                            this.map.setView(new this.req.Ol.View({
                                extent: geo_feature.getGeometry().getExtent(),
                                center: this.map.getView().getCenter(),
                                zoom: this.map.getView().getZoom(),
                                minZoom: this.map.getView().getZoom(),
                                maxZoom: 18
                            }))
                        }
                    })   
                },0)
            } else if(e.selected.length > 1) {
                const device_feature = e.selected[e.selected.length - 1]
                this.showModal = true   
            }
            click_interaction.getFeatures().clear()
        })

        //this.createFeature(vectorSource, []);
        // var feat = new Feature({
        //     geometry: new this.req.geom.Point(this.req.proj.transform([drone_stream.values[0].longitude, drone_stream.values[0].latitude], 'EPSG:4326',     
        //     'EPSG:3857'))
        //     //id: device.id
        // })
        // vectorSource.addFeature(feat)
        // var i = 1;
        // setInterval(() => {
        //     vectorSource.removeFeature(feat);
        //     feat = new Feature({
        //         geometry: new this.req.geom.Point(this.req.proj.transform([drone_stream.values[i].longitude, drone_stream.values[i].latitude], 'EPSG:4326',     
        //         'EPSG:3857'))
        //         //id: device.id
        //     })
        //     vectorSource.addFeature(feat)
        //     i++
        // },150)

    },
    methods: {
        clearHoverPopup() {
            this.hovered_geo = null
            document.body.style.cursor = "default"
            this.hoverOverlay.setPosition(null)
        },
        clearGeoDevices(geo) {
            for(var feature of this.shown_features) {
                if(this.getDevices.find(d => d.device_id == feature.get('id')).municipality == geo.get('id')) {
                    this.devices_layer.getSource().removeFeature(feature)
                    this.shown_features.splice(this.shown_features.findIndex(f => f == feature), 1)
                }
            }
        },
        addHiddenHex(geo) {
            const tmp = [...this.hidden_hex]
            for(var feature of tmp) {
                if(feature.get('municipality') == geo.get('id')) {
                    this.hex_layer.getSource().addFeature(feature)
                    this.hidden_hex.splice(this.hidden_hex.findIndex(f => f == feature), 1)
                }
            }
        },
        deselect_county() {
            this.map.setView(new this.req.Ol.View({
                center: this.map.getView().getCenter(),
                zoom: this.map.getView().getZoom(),
                minZoom: 6,
                maxZoom: 14
            }))
            this.map.getView().fit(this.geoJsonExtent, {
                duration: 500
            })
            this.addHiddenHex(this.selected_county)
            this.selected_county = null
            this.devices_layer.getSource().clear()
            this.shown_features = []
        },
        createFeature(source, device){
            const { Feature } = require( 'ol');
            var coordinates = { 'Águeda': [ 40.595098500000006, -8.401762 ],
                                Estarreja: [ 40.760923500000004, -8.587983000000001 ],
                                Murtosa: [ 40.7613925, -8.663722 ],
                                'Oliveira de Azeméis': [ 40.848087, -8.4679795 ],
                                'Oliveira do Bairro': [ 40.514727, -8.544975 ],
                                Ovar: [ 40.888307499999996, -8.608884 ],
                                Vagos: [ 40.5034925, -8.6958525 ],
                                'Vale de Cambra': [ 40.8345105, -8.335746499999999 ],
                                'Ílhavo': [ 40.6110135, -8.692087 ],
                                'Albergaria-a-Velha': [ 40.694458, -8.519893 ],
                                Anadia: [ 40.453942999999995, -8.445653 ],
                                Aveiro: [ 40.627367, -8.642215499999999 ]}

            for (const [key, value] of Object.entries(coordinates)) {        
                source.addFeature(new Feature({
                    geometry: new this.req.geom.Point(this.req.proj.transform([value[1],value[0]], 'EPSG:4326', 'EPSG:3857')),
                    //id: device.id
                    name: key
                }));
            }
            return features

            //console.log(features)
        },
        gen_random_coordinates(){
            const limits = [-8.654981, -8.638642, 40.648018, 40.635610] 
            return [(Math.random() * (limits[0] - limits[1]) + limits[1]),(Math.random() * (limits[2] - limits[3]) + limits[3])]
        },
        selectVertical(i) {
            if(i != this.selected_vertical) {
                this.selected_vertical = i
                this.selected_stream = 0
                this.updateHeatMap()
                for(var feature in this.shown_features) {
                    if(!(this.getDevices.find(d => d.device_id == this.shown_features[feature].get('id')).vertical.includes(this.getVerticals[this.selected_vertical].name))) {
                        this.devices_layer.getSource().removeFeature(this.shown_features[feature])
                        this.shown_features.splice(feature, 1)
                    }
                }
                this.devices_layer.getSource().dispatchEvent('change');
            }
        },
        selectStream(i) {
            if(i != this.selected_stream) {
                this.selected_stream = i
                this.updateHeatMap()
            }
        },
        updateHeatMap() {
            const stream = this.getVerticals[this.selected_vertical].streams[this.selected_stream]
            this.rainbowHeatMap.setNumberRange(1, 100);
            this.rainbowHeatMap.setSpectrum(stream.colors[0] , stream.colors[1]); 

            for(var i in this.getHeatmap.muns) {
                const value = this.getHeatmap.muns[i][stream.name].count ? this.getHeatmap.muns[i][stream.name].average : null
                this.municipalityValues[i].value = value
                if(value) {
                    const index = (value - stream.min) * 100 / (stream.max - stream.min)
                    this.municipalityValues[i].index = Math.round(index)
                    this.municipalityValues[i].color = '#' + this.rainbowHeatMap.colourAt(Math.round(index)) + 'D0';
                } else {
                    this.municipalityValues[i].color = '#ffffff00';
                }
                this.municipalityValues[i].style = new this.req.style.Style({
                    fill: new this.req.style.Fill({
                        color: this.municipalityValues[i].color
                    }),
                    stroke: new this.req.style.Stroke({
                        color: 'black',
                        width: this.map.getView().getZoom() / 20 * 1.5
                    })
                })
            }

            for(var i in this.getHeatmap.hexagons) {
                const value = this.getHeatmap.hexagons[i][stream.name].count ? this.getHeatmap.hexagons[i][stream.name].average : null
                this.hexagonValues[i].value = value
                if(value) {
                    const index = (value - stream.min) * 100 / (stream.max - stream.min)
                    this.hexagonValues[i].index = Math.round(index)
                    this.hexagonValues[i].color = '#' + this.rainbowHeatMap.colourAt(Math.round(index)) + 'FF';
                } else {
                    this.hexagonValues[i].color = '#ffffff00';
                }
                this.hexagonValues[i].style = new this.req.style.Style({
                    fill: new this.req.style.Fill({
                        color: this.hexagonValues[i].color,
                    }),
                    stroke: new this.req.style.Stroke({
                        color: 'black',
                        width: this.map.getView().getZoom() / 20 * 1.5
                    })
                })
            }

            this.hex_layer.setStyle((feature) => {
                return this.hexagonValues[feature.get('id')].style
            })

            this.map.updateSize()   

        }

    }

}
</script>


<style lang="scss" scope>
@import '~/assets/mixins.scss';

.ol-popup {

    @include shadow(0px, 0px, 4px, 0px, rgba(0,0,0,0.2));
    pointer-events: none;
    z-index: 3332;
    position: absolute;
    text-align: center;
    filter: drop-shadow(0 1px 4px rgba(0,0,0,0.2));
    font-weight: 900;
    white-space: nowrap;
    left: 50%;
    background-color: rgba(255, 255, 255, 0.589);
    top: 50%;
    &:not(.top) {
        transform: translate(-50%, -50%);
        width: max-content;
    }
    &.top {
        top: 2rem;
        transform: translate(-50%, 0);
        background-color: rgb(255, 255, 255);
        min-width: 10%;
        @include shadow(0px, 0px, 8px, 2px, rgba(0,0,0,0.2));
    }
    padding: .75rem;
    border-radius: 12px;

    & > div {
        @include flex(space-evenly, center, column);
        color: white;
        padding: 1rem 2rem;
        border-radius: 10px;
    }
}

.map-menu {

    @include flex(center, center, row);
    @include transition(opacity, .5s, ease, 0s);
    z-index: 3600;
    opacity: 0;
    &.show {
        opacity: 1;
    }

    position: absolute;

    &:not(.left) {
        right: 2rem;
        top: 50%;
        transform: translateY(-50%);
    }

    &.left {
        bottom: 2rem;
        left: 2rem;
        right: auto;
    }

    &_left,&_right {
        @include shadow(0px, 0px, 8px, 2px, rgba(0,0,0,0.2));
        background-color: rgba(255,255,255,.75);
        padding: .75rem;
        border-radius: 5px;
    }
    &_center {
        width: 5px;
    }

    &_button {
        @include shadow(0px, 0px, 4px, 2px, rgba(0,0,0,0.2));
        @include flex(center, center);
        transition: background-color .0s ease-out 0s, box-shadow .1s ease-out 0s, transform .1s ease 0s;
        border: 1px solid rgba(0, 0, 0, 0.171);
        background-color: white;
        width: 5rem;
        height: 5rem;
        border-radius: 5px;
        padding: .25rem;
        &:not(:first-child) {
            margin-top: .75rem;
        }
        &:hover {
            &:not(.active) {
                transform: scale(1.05);
                cursor: pointer;
            }
            &:active {
                @include shadow(0px, 0px, 0px, 0px, rgba(0,0,0,0));
                transform: scale(1);
            }
        }
        &.active {
            @include shadow(0px, 0px, 0px, 0px, rgba(0,0,0,0));
            background-color: rgb(201, 201, 201);
        }
        & img {
            width: 100%;
        }
    }
}

.scale-band-wrapper {
    margin: .5rem 0;
    height: 2rem;
    @include flex(center, center);
    border-radius: 10px;
    width: 100%;
    & > div {
        width: 1%;
        &:not(.selected) {
            border-top: 1px solid white;
            border-bottom: 1px solid white;
            &:first-child {
                border-left: 1px solid white;
            }
            &:last-child {
                border-right: 1px solid white;
            }
        }
        &.selected {
            border: 3px solid darkred;
            box-sizing: border-box;
            width: 5%;
            min-width: 1rem;
            height: 2.5rem;
        }
        height: 100%;
    }
}

.color-band {
    background-color: white;
    border-radius: 10px;
    height: 2rem;
    width: 15rem;
    border: 1px solid white;
}

.color-position {
    position: absolute;
    border-radius: 10px;
    height: 120%;
    top: -10%;
    width: 3px;
}

</style>
