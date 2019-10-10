<template>
    <div class="mapMargin mapHeight" style="position:relative">
        <div class="mapHeight" id="map"></div>
        <div v-if="getStream" :style="{ '': getModifier, 'background-color': !loading_values && selected_county && selected_county.get('id') in heatmapValues ? heatmapValues[selected_county.get('id')].color + 'D0' : '#ffffffd0'}" class="ol-popup top">
            <div style="background-color: rgba(0,0,0, .5)">
                <span v-if="selected_county" class="normal bold"><span class="big">{{selected_county.get('Freguesia')}}</span> <br> {{getStream.display}} </span>
                <span v-else class="normal bold">{{getStream.display}} </span>
                <div v-if="!loading_values && selected_county && selected_county.get('id') in heatmapValues" class="measure-show">
                    <div :style="{'background-color': getStream.colors[0]}" class="disabled measure-button">
                        <div class="measure-wrapper">
                            <span>MIN</span> 
                        </div>
                    </div>
                    <span class="normal">{{heatmapValues[selected_county.get('id')].min.toFixed(2)}}{{getStream.unit}}</span>
                    <div :style="{'background-color': '#' + rainbowHeatMap.colourAt(50)}" class="disabled measure-button">
                        <div class="measure-wrapper">
                            <span>AVG</span> 
                        </div>
                    </div>
                    <span class="normal">{{heatmapValues[selected_county.get('id')].average.toFixed(2)}}{{getStream.unit}}</span>
                    <div :style="{'background-color': getStream.colors[1]}" class="disabled measure-button">
                        <div class="measure-wrapper">
                            <span>MAX</span> 
                        </div>
                    </div>
                    <span class="normal">{{heatmapValues[selected_county.get('id')].max.toFixed(2)}}{{getStream.unit}}</span>
                </div>
                <div v-else-if="!loading_values && selected_county" class="normal">No Values</div>
                <div class="scale-band-wrapper">
                    <div :class="{
                        selected: (!loading_values && selected_county && selected_county.get('id') in heatmapValues) ? (index == heatmapValues[selected_county.get('id')].index || index == heatmapValues[selected_county.get('id')].indexMin || index == heatmapValues[selected_county.get('id')].indexMax) : false}" 
                        v-for="index in 100" 
                        :key="index" :style="{'background-color': '#' + rainbowHeatMap.colourAt(index)}">
                        </div>
                </div>
            </div>
        </div>

        <div v-if="getStream" id="hover_popup" class="ol-popup" :style="{'background-color': hovered_geo ? (hovered_geo.get('id') in heatmapValues ? heatmapValues[hovered_geo.get('id')].color + 'D0' : '#ffffffd0') : '#ffffff00'}">
            <div v-if="hovered_geo" style="background-color: rgba(0,0,0, .5)">
                <span class="normal bold"> {{hovered_geo.get('Freguesia')}} </span>
                <div v-if="hovered_geo.get('id') in heatmapValues" class="measure-show">
                    <div :style="{'background-color': getStream.colors[0]}" class="disabled measure-button">
                        <div class="measure-wrapper">
                            <span>MIN</span> 
                        </div>
                    </div>
                    <span class="bold small">{{heatmapValues[hovered_geo.get('id')].min.toFixed(2)}}{{getStream.unit}}</span>
                    <div :style="{'background-color': '#' + rainbowHeatMap.colourAt(50)}" class="disabled measure-button">
                        <div class="measure-wrapper">
                            <span>AVG</span> 
                        </div>
                    </div>
                    <span class="small bold">{{heatmapValues[hovered_geo.get('id')].average.toFixed(2)}}{{getStream.unit}}</span>
                    <div :style="{'background-color': getStream.colors[1]}" class="disabled measure-button">
                        <div class="measure-wrapper">
                            <span>MAX</span> 
                        </div>
                    </div>
                    <span class="small bold">{{heatmapValues[hovered_geo.get('id')].max.toFixed(2)}}{{getStream.unit}}</span>
                </div>
                <div v-else class="small bold">No Values</div>
            </div>
        </div>

        <div v-if="getStream" class="measure-menu">
            <div class="measure-menu_top">
                <div :style="{'background-color': getStream.colors[0]}" class="measure-button" @click="measure_selected = 'min'; updateHeatMap()" :class="{selected: measure_selected == 'min'}" >
                    <div class="measure-wrapper">
                        <span>MIN</span> 
                    </div>
                </div>
                <div :style="{'background-color': '#' + rainbowHeatMap.colourAt(50)}" class="measure-button" @click="measure_selected = 'average'; updateHeatMap()" :class="{selected: measure_selected == 'average'}" >
                    <div class="measure-wrapper">
                        <span>AVG</span> 
                    </div>
                </div>
                <div :style="{'background-color': getStream.colors[1]}" class="measure-button" @click="measure_selected = 'max'; updateHeatMap()" :class="{selected: measure_selected == 'max'}" >
                    <div class="measure-wrapper">
                        <span>MAX</span> 
                    </div>
                </div>
            </div>
            <div class="measure-menu_bottom">
                <div class="measure-menu_bottom_date">
                    <div @click="current_scale > 0 ? current_time -= current_scale : current_time = (new Date(current_time)).addMonths(1 * current_scale); updateValues(false, false);" class="arrow"><img src="icons/arrow.png" alt=""></div>
                    <div class="measure-menu_bottom_date_wrapper">
                        <div class="date normal">
                            <div :style="{color: current_scale == 86400000 || current_scale == 604800000 ? 'red' : 'black'}">{{getStartDate.getDate().toString().padStart(2, '0')}}</div>/
                            <div :style="{color: current_scale == -1 ? 'red' : 'black'}">{{(getStartDate.getMonth() + 1).toString().padStart(2, '0')}}</div>/
                            <div :style="{color: current_scale == -12 ? 'red' : 'black'}" style="margin-right: 1.5rem">{{getStartDate.getFullYear()}}</div> 
                            <div :style="{color: current_scale == 3600000 ? 'red' : 'black'}" >{{getStartDate.getHours().toString().padStart(2, '0')}}h</div>
                        </div>
                        <div class="date normal">
                            <div :style="{color: current_scale == 86400000 || current_scale == 604800000 ? 'red' : 'black'}">{{getCurrentDate.getDate().toString().padStart(2, '0')}}</div>/
                            <div :style="{color: current_scale == -1 ? 'red' : 'black'}">{{(getCurrentDate.getMonth() + 1).toString().padStart(2, '0')}}</div>/
                            <div :style="{color: current_scale == -12 ? 'red' : 'black'}" style="margin-right: 1.5rem">{{getCurrentDate.getFullYear()}}</div> 
                            <div :style="{color: current_scale == 3600000 ? 'red' : 'black'}">{{getCurrentDate.getHours().toString().padStart(2, '0')}}h</div>
                        </div>
                    </div>
                    <div :class="{disabled: current_time == this.getCurrentTimeHour()}" @click="increaseInterval(); updateValues(false, false);" class="arrow"><img src="icons/arrow.png" alt=""></div>
                </div>
                <div class="measure-menu_bottom_picker">
                    <div @click="current_scale = 3600000; updateValues()" class="measure-button fit xsmall bold" :class="{selected: current_scale == 3600000}">
                        HOUR
                    </div>
                    <div @click="current_scale = 86400000; updateValues()" class="measure-button fit xsmall bold" :class="{selected: current_scale == 86400000}">
                        DAY
                    </div>
                    <div @click="current_scale = 604800000; updateValues()" class="measure-button fit xsmall bold" :class="{selected: current_scale == 604800000}">
                        WEEK
                    </div>
                    <div @click="current_scale = -1; updateValues()" class="measure-button fit xsmall bold" :class="{selected: current_scale == -1}">
                        MONTH
                    </div>
                    <div @click="current_scale = -12; updateValues()" class="measure-button fit xsmall bold" :class="{selected: current_scale == -12}">
                        YEAR
                    </div>
                </div>
            </div>
        </div>
        

        <div class="map-menu left" :class="{show: selected_county != null, active: selected_county == null}">
            <div class="map-menu_button" @click="deselect_county()">
                <img src="icons/back.png" alt="">
            </div>
        </div>

        <div class="map-menu show bottom" :class="{show: selected_county != null, active: selected_county == null}">
            <div class="map-menu_button" @click="sensor_mode = !sensor_mode; updateValues()" :title="sensor_mode ? 'Toggle satellite view' : 'Toggle sensor view'">
                <img :src="sensor_mode ? 'icons/sensor.png' : 'icons/satellite.png'" alt="">
            </div>
            <div v-if="sensor_mode" class="map-menu_button" @click="hexagon_mode = sensor_mode ? !hexagon_mode : hexagon_mode; hex_layer.getSource().dispatchEvent('change'); devices_layer.getSource().dispatchEvent('change');" :class="{selected: hexagon_mode}" >
                <img src="icons/hex.png" alt="">
            </div>
        </div>

        <div class="map-menu noBack show">
            <div v-if="getStream" class="map-menu_left">
                <div @mousedown="selectStream(i)" :class="{active: stream.name == getStream.name}" :title="stream.display" v-for="(stream, i) in getVertical.streams" :key="i" class="map-menu_button">
                    <img :src="`icons/streams/${getVertical.streams[i].name}.png`" alt="">
                </div>
            </div>
            <div class="map-menu_center">

            </div>
            <div v-if="getVertical" class="map-menu_right">
                <div @mousedown="selectVertical(i)" :class="{active: vertical.name == getVertical.name}" :title="vertical.display" v-for="(vertical, i) in getVerticals" :key="i" class="map-menu_button">
                    <img :src="`icons/${vertical.name}.png`" alt="">
                </div>
            </div>
        </div>
        <Loading :show="!loaded || loading_values" type="absolute"/> 
        <ModalResizable v-if="showModal" @close="showModal = false" :device="selected_device"/>
    </div>
    
</template>

<script>

Date.isLeapYear = function (year) { 
    return (((year % 4 === 0) && (year % 100 !== 0)) || (year % 400 === 0)); 
};

Date.getDaysInMonth = function (year, month) {
    return [31, (Date.isLeapYear(year) ? 29 : 28), 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][month];
};

Date.prototype.isLeapYear = function () { 
    return Date.isLeapYear(this.getFullYear()); 
};

Date.prototype.getDaysInMonth = function () { 
    return Date.getDaysInMonth(this.getFullYear(), this.getMonth());
};

Date.prototype.addMonths = function (value) {
    var n = this.getDate();
    this.setDate(1);
    this.setMonth(this.getMonth() + value);
    this.setDate(Math.min(n, this.getDaysInMonth()));
    return this;
};

var h3 = require('h3-js');
var Rainbow = require('rainbowvis.js');
import intersect from '@turf/intersect'
const helpers =  require('@turf/helpers')
//console.log(JSON.stringify(drone_stream))  
export default {
    data() {
        return {
            req: {
                Ol: null,
                etent: null,
                geom: null,
                proj: null,
            },
            map: null,
            loaded: false,
            geo_loaded: false,
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

            heatmapValues: {},
            heatmapValues: {},
            
            rainbowHeatMap: new Rainbow(),

            selected_vertical: null,
            selected_stream: null,
            selected_county: null,
            selected_device: null,
            hovered_geo: null,

            geoJsonExtent: null,
            showModal: false,

            devices : {},
            geo_layer: null,
            hex_layer: null,
            devices_layer: null,
            opac_hex: [],
            sensor_mode: false,
            hexagon_mode: true,

            heatmap: {},
            measure_selected: 'average',
            current_scale: 3600000,
            current_time: null,

            interval: null,
            loading_values: false,

            modifier: 0,
        }
    },
    computed: {
        getStartDate() {
            return this.current_scale > 0 ? new Date(this.current_time - this.current_scale)
                : (new Date(this.current_time)).addMonths(1 * this.current_scale);
        },
        getCurrentDate() {
            return new Date(this.current_time)
        },
        getVerticals() {
            return this.$store.state.verticals
        },
        getDevices() {
            return this.$store.state.devices
        },
        getHeatmap() {
            return this.$store.state.heatmap
        },
        getVertical() {
            return this.selected_vertical != null ? this.getVerticals[this.selected_vertical] : null
        },
        getStream() {
            return this.getVertical && this.selected_stream != null ? this.getVertical.streams[this.selected_stream] : null
        },
        getModifier() {
            return this.modifier
        },
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
        this.req.Feature = Feature
        const { click, pointerMove, altKeyOnly, noModifierKeys, altShiftKeysOnly, platformModifierKeyOnly } = require( 'ol/events/condition.js');
        


        // var last_element = device[device.length - 1];
        // console.log('ultimo elemento '+ last_element)

        this.devices = {...this.getDevices}

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
                        src: `icons/${vertical.name}.png`
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
            },
        })
        
        this.devices_layer = new layer.Vector({
            source: new source.Vector(),
            style: (feature) => {
                return this.hexagon_mode || !this.sensor_mode || !this.getVertical || !this.devices[feature.get('id')].verticals.includes(this.getVertical.name) ? null : this.devicesStyle.styles[this.getVerticals[this.selected_vertical].name].default
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
            style: (feature) => {
                return (this.sensor_mode && !this.hexagon_mode) || this.loading_values || !(feature.get('id') in this.heatmapValues) ? null 
                    : (feature.get('opac') ? this.heatmapValues[feature.get('id')].styleOpac : ((feature.get('selected') ? this.heatmapValues[feature.get('id')].styleSel : this.heatmapValues[feature.get('id')].style)))
            },
            renderBuffer: window.innerWidth,
            updateWhileAnimating: true,
            renderMode: 'hybrid'
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
                this.geo_layer
            ],
            //overlays: [this.hoverOverlay],
            view: new this.req.Ol.View({
                zoom: 8,
                center,
                minZoom: 6,
                maxZoom: 24
            })
        })

        this.hex_layer.getSource().on('change', () => {
            if(this.hex_layer.getSource().getState() == 'ready' && !this.loaded) {
                this.loaded = true
                if(this.geo_loaded)
                    this.load()
            }
        })


        this.geo_layer.getSource().on('change', () => {
            if(this.geo_layer.getSource().getState() == 'ready' && !this.geo_loaded) {
                this.geo_loaded = true
                if(this.loaded)
                    this.load()
            }
        })
    

        this.hover_interaction = new interaction.Select({
            condition: (e) => {
                return pointerMove(e) && !this.loading_values;
            },
            layers: [this.geo_layer],
            style: (feature) => {
                return feature == this.selected_county 
                    ? this.geoStyle.active
                    : this.geoStyle.hover
            },
            multi: false
        })

        this.map.addInteraction(this.hover_interaction);
        this.hover_interaction.on('select', (e) => {
            if(e.selected.length && e.selected[0] != this.selected_county) {
                if(this.hovered_geo) {
                    //this.clearGeoDevices(this.hovered_geo)
                    this.addHiddenHex(this.hovered_geo)
                }
                this.hovered_geo = e.selected[0]
                document.body.style.cursor = "pointer"
                const center = this.req.extent.getCenter(this.hovered_geo.getGeometry().getExtent()),
                      bottom = this.req.extent.getBottomRight(this.hovered_geo.getGeometry().getExtent())
                setTimeout(() => {
                    this.hoverOverlay.setPosition([center[0], center[1]])
                }, 0)
                for(var feat of this.hex_layer.getSource().getFeatures()) {
                    if(feat.get('municipality') == this.hovered_geo.get('id')) {
                        feat.set('opac',true)
                        this.opac_hex.push(feat)
                    }
                }
            } else if(this.hovered_geo) {
                //this.clearGeoDevices(this.hovered_geo)
                this.addHiddenHex(this.hovered_geo)
                this.clearHoverPopup()
            }
        })

        this.click_interaction = new interaction.Select({
            condition: (e) => {
                return click(e) && !this.loading_values;
            },
            layers: [this.geo_layer, this.devices_layer],
            multi: true
        })

        this.map.addInteraction(this.click_interaction);
        this.click_interaction.on('select', (e) => {

            document.body.style.cursor = "default"
            const geo_feature = e.selected[0]
            console.log(geo_feature)
            if(geo_feature.get('FREGUESIA') && geo_feature != this.selected_county) {
                this.map.setView(new this.req.Ol.View({
                    center: this.map.getView().getCenter(),
                    zoom: this.map.getView().getZoom(),
                    minZoom: 0,
                    maxZoom: 18
                }))

                if(this.selected_county)
                    this.addHiddenHex(this.selected_county)
                this.hovered_geo = null
                this.selected_county = geo_feature 
                for(var feat of this.hex_layer.getSource().getFeatures()) {
                    if(!feat.get('opac') && feat.get('municipality') == this.selected_county.get('id')) {
                        feat.set('opac',true)
                        this.opac_hex.push(feat)
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
            } else {
                this.selected_device = e.selected[e.selected.length - 1].get('id')
                this.showModal = true
            }
            this.click_interaction.getFeatures().clear()
        })

    },
    destroyed() {

        this.map.removeInteraction(this.hover_interaction)
        delete this.hover_interaction
        this.map.removeInteraction(this.click_interaction)
        delete this.click_interaction

        this.hex_layer.getSource().clear
        delete this.hex_layer
        this.map.removeLayer(this.hex_layer)
        this.geo_layer.getSource().clear
        delete this.geo_layer
        this.map.removeLayer(this.geo_layer)
        this.devices_layer.getSource().clear
        delete this.devices_layer
        this.map.removeLayer(this.devices_layer)
        this.map.setTarget(null)
        delete this.map

        clearInterval(this.interval)
        delete this.heatmap
        delete this.heatmapValues
        delete this.heatmapValues

        delete this.req
    },
    methods: {
        load() {
            this.geoJsonExtent = this.req.extent.createEmpty()
            this.geo_layer.getSource().getFeatures().forEach(feature => {
                this.geoJsonExtent = this.req.extent.extend(this.geoJsonExtent, feature.getGeometry().getExtent())
            })

            for(var device in this.devices) {
                const feat = new this.req.Feature({
                    geometry: new this.req.geom.Point(this.req.proj.transform([this.devices[device].location.longitude, this.devices[device].location.latitude], 'EPSG:4326', 'EPSG:3857')),
                    id: device
                })
                this.devices_layer.getSource().addFeature(feat)
            }

            setInterval( async () => {
                const res = await this.$axios.get(`http://localhost:8001/czb/devices/location`, {
                    headers: {
                        Authorization: this.$store.state.jwt
                    }
                })

                const features = this.devices_layer.getSource().getFeatures()
                for(var device of res.data) {
                    const feature = features.find(f => f.get('id') == device.device_ID)
                    if(feature)
                        feature.getGeometry().setCoordinates(this.req.proj.transform([device.location.longitude, device.location.latitude], 'EPSG:4326', 'EPSG:3857'));
                    else {
                        const {device_ID, ...rest} = device
                        this.devices[device_ID] = rest
                        const feat = new this.req.Feature({
                            geometry: new this.req.geom.Point(this.req.proj.transform([device.location.longitude, device.location.latitude], 'EPSG:4326', 'EPSG:3857')),
                            id: device.device_ID
                        })
                        this.devices_layer.getSource().addFeature(feat)
                    }
                }
            }, 1000)

            setTimeout(() => {
                this.map.getView().fit(this.geoJsonExtent, {
                    duration: 500
                })
                this.hoverPopup = document.getElementById('hover_popup');
                this.hoverOverlay = new this.req.Ol.Overlay({
                    element: this.hoverPopup,
                    autoPan: false,
                    positioning: 'center',
                }) 
                this.map.addOverlay(this.hoverOverlay)
            },0)

            this.current_time = this.getCurrentTimeHour()
            this.selectVertical(0)
            this.interval = setInterval(() => {
                this.updateValues(false, false)
            }, 5000)
        },
        increaseInterval() {
            const tmp = this.current_scale > 0 ? this.current_time += this.current_scale : this.current_time = (new Date(this.current_time)).addMonths(-1 * this.current_scale); 
            const date = this.getCurrentTimeHour()
            this.current_time = tmp > date ? date : tmp;
        },
        getCurrentTimeHour() {
            return Math.ceil((new Date()).getTime() / 3600000) * 3600000
        },
        async updateValues(refresh = false, load = true) {
            if(load) {
                this.loading_values = true
                this.hex_layer.getSource().dispatchEvent('change');
            }
            const res = await this.$axios.get(`http://localhost:8001/czb/values/heatmap?interval_start=${Math.floor(this.getStartDate)}&interval_end=${Math.floor(this.getCurrentDate)}&stream_name=${this.getStream.name}&satellite=${!this.sensor_mode}`, {
                headers: {
                    Authorization: this.$store.state.jwt
                }
            })
            delete this.heatmap
            this.heatmap = res.data
            this.updateHeatMap(refresh)
        },
        clearHoverPopup() {
            this.hovered_geo = null
            document.body.style.cursor = "default"
            this.hoverOverlay.setPosition(null)
        },
        addHiddenHex(geo) {
            const tmp = [...this.opac_hex]
            for(var feature of tmp) {
                if(feature.get('municipality') == geo.get('id')) {
                    feature.set('opac', false)
                    this.opac_hex.splice(this.opac_hex.findIndex(f => f == feature), 1)
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
        },
        selectVertical(i) {
            this.selected_vertical = i
            this.devices_layer.getSource().dispatchEvent('change');
            this.selectStream(0)
        },
        selectStream(i) {
            this.selected_stream = i
            const stream = this.getVerticals[this.selected_vertical].streams[this.selected_stream]
            this.rainbowHeatMap.setNumberRange(1, 100);
            this.rainbowHeatMap.setSpectrum(stream.colors[0] , stream.colors[1]); 
            this.updateValues()
        },
        updateHeatMap() {
            
            const stream = this.getVerticals[this.selected_vertical].streams[this.selected_stream]

            delete this.heatmapValues
            this.heatmapValues = {}

            for(var mun of this.heatmap) {
                const value = mun.average
                const index = Math.round((value - stream.min) * 100 / (stream.max - stream.min))
                const indexMin = Math.round((mun.min - stream.min) * 100 / (stream.max - stream.min))
                const indexMax = Math.round((mun.max - stream.min) * 100 / (stream.max - stream.min))
                this.heatmapValues[mun.id] = {
                    ...this.heatmapValues[mun.id],
                    min: mun.min,
                    average: value,
                    max: mun.max,
                    count: mun.count,
                    index,
                    indexMin,
                    indexMax
                }
                this.heatmapValues[mun.id].color= '#' + this.rainbowHeatMap.colourAt(index),
                this.heatmapValues[mun.id].style =  new this.req.style.Style({
                    fill: new this.req.style.Fill({
                        color: '#' + this.rainbowHeatMap.colourAt(index) + 'D0',
                    }),
                    stroke: new this.req.style.Stroke({
                        color: 'black',
                        width: this.map.getView().getZoom() / 20 * 1.5
                    })
                })
                for(var hex of mun.hexas) {
                    const value_hex = hex[this.measure_selected]
                    const index_hex = Math.round((value_hex - stream.min) * 100 / (stream.max - stream.min))
                    this.heatmapValues[hex.id] = {
                        ...this.heatmapValues[hex.id],
                        min: hex.min,
                        average: hex.average,
                        max: hex.max,
                        count: hex.count,
                        index_hex,
                    }
                    const tmp_stroke = new this.req.style.Stroke({
                        color: 'black',
                        width: this.map.getView().getZoom() / 20 * 1.5
                    })
                    this.heatmapValues[hex.id].color = '#' + this.rainbowHeatMap.colourAt(index_hex),
                    this.heatmapValues[hex.id].style =  new this.req.style.Style({
                        fill: new this.req.style.Fill({
                            color: '#' + this.rainbowHeatMap.colourAt(index_hex) + 'FF',
                        }),
                        stroke: tmp_stroke
                    })
                    this.heatmapValues[hex.id].styleOpac =  new this.req.style.Style({
                        fill: new this.req.style.Fill({
                            color: '#' + this.rainbowHeatMap.colourAt(index_hex) + 'B0',
                        }),
                        stroke: tmp_stroke
                    })
                    this.heatmapValues[hex.id].styleSel =  new this.req.style.Style({
                        stroke: new this.req.style.Stroke({
                            color: 'blue',
                            width: this.map.getView().getZoom() / 20 * 3.5
                        })
                    })
                }
            }

            this.map.updateSize()  
            this.loading_values = false
            this.hex_layer.getSource().dispatchEvent('change');
            this.devices_layer.getSource().dispatchEvent('change');
            this.modifier++

        }

    }

}
</script>

<style lang="scss" scope>
@import '~/assets/mixins.scss';

.ol-popup {

    @include shadow(0px, 0px, 4px, 0px, rgba(0,0,0,0.2));
    z-index: 3332;
    position: absolute;
    text-align: center;
    filter: drop-shadow(0 1px 4px rgba(0,0,0,0.6));
    font-weight: 900;
    white-space: nowrap;
    background-color: rgba(255, 255, 255, 0.589);
    left: 50%;
    &:not(.top) {
        transform: translate(-50%, -50%);
        width: max-content;
        pointer-events: none;
    }
    &.top {
        cursor: default;
        top: 2rem;
        transform: translate(-50%, 0);
        background-color: rgb(255, 255, 255);
        @include shadow(0px, 0px, 8px, 2px, rgba(0,0,0,0.2));
    }
    padding: .75rem;
    border-radius: 12px;

    & > div {
        white-space: pre-wrap;
        width: 100%;
        height: max-content;
        @include flex(space-evenly, center, column);
        color: white;
        box-sizing: border-box;
        padding: 1rem 2rem;
        border-radius: 10px;
        & > *{
            margin-bottom: .5rem;
        }
    }
}

.measure-button {
    @include shadow(0px, 0px, 8px, 2px, rgba(0,0,0,0.2));
    width: 4rem;
    height: 4rem;
    border-radius: 5px;
    @include flex(center, center);
    background-color: rgba(255, 255, 255, 0.856);
    & .measure-wrapper {
        width: 80%;
        height: 60%;
        color: white;
        font-weight: bold;
        background-color: rgba(0, 0, 0, 0.556);
        padding: .35rem;
        border-radius: 5px;    
        @include flex(center,center);
    }
    &.selected {
        transform: scale(.9);
        filter:brightness(.7);
    }
    @include transition(transform, .2s, ease, 0s);
    &:hover:not(.selected):not(.small):not(.disabled) {
        transform: scale(1.05);
        cursor: pointer;
        &:active {
            transform: scale(1);
        }
    }
    & .arrow-up {
        width: 0; 
        height: 0; 
        border-left: 1.4rem solid transparent;
        border-right: 1.4rem solid transparent;
    }
    & .arrow-down {
        width: 0; 
        height: 0; 
        border-left: 1.4rem solid transparent;
        border-right: 1.4rem solid transparent;
    }
    & .average {
        width: 2.75rem;
        height: 1rem;
    }
    &.small {
        width: 3.4rem;
        height: 3.4rem;
        & .arrow-up {
            border-left: 1rem solid transparent;
            border-right: 1rem solid transparent;
        }
        & .arrow-down {
            border-left: 1rem solid transparent;
            border-right: 1rem solid transparent;
        }
        & .average {
            width: 2.25rem;
            height: .75rem;
        }
    }
    &.fit {
        width: max-content;
        height: max-content;
        padding: .5rem;
    }
}

.measure-show {
    @include flex(center, center);
    width: 100%;
    height: 100%;
    & > :not(:first-child) {
        margin-left: .75rem;
    }
}

.measure-menu {
    @include flex(center, center, column);
    position:absolute;
    top: 2rem;
    right: 2rem;
    padding: .75rem;
    @include shadow(0px, 0px, 8px, 2px, rgba(0,0,0,0.2));
    background-color: rgba(255,255,255,.75);
    border-radius: 5px;
    &_top {
        @include flex(center, center);
        margin-bottom: .75rem;
        & > div {
            &:not(:first-child) {
                margin-left: .75rem;
            }
        }
    }
    &_bottom {
        @include flex(center, center, column);
        &_date {
            @include flex(space-evenly, center);
            width: 100%;
            & .arrow {
                & img {
                    width: 4rem;
                }
                @include transition(transform, .2s, ease, 0s);
                &:hover:not(.disabled) {
                    cursor: pointer;
                    transform: scale(1.4);
                    &:first-of-type {
                        transform: rotate(180deg) scale(1.4);
                    }
                    &:active {
                        transition: none;
                        transform: scale(1);
                        &:first-of-type {
                            transform: rotate(180deg) scale(1);
                        }
                    }
                }
                &.disabled {
                    transform: scale(.8);
                    background-color: rgba(255, 0, 0, 0.342);
                    border-radius: 50%;
                    pointer-events: none;
                }
                &:first-of-type {
                    margin-right: .75rem;
                    transform: rotate(180deg);
                }
                &:last-of-type {
                    margin-left: .75rem;
                }
            }
            & .date {
                @include flex(center, center);
            }
        }  
        &_picker {
            margin-top: .75rem;
            @include flex(center, center);
            & > div {
                &:not(:first-child) {
                    margin-left: .5rem;
                }
            }

        }      
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
        top: 60%;
        transform: translateY(-50%);
    }

    &:not(.noBack) {
        @include shadow(0px, 0px, 8px, 2px, rgba(0,0,0,0.2));
        background-color: rgba(255,255,255,.75);
        padding: .75rem;
        border-radius: 5px;
    }

    &.bottom {
        @include flex(center, center);
        transform: translate(-50%);
        width: max-content;
        bottom: 2rem;
        left: 50%;
        top: auto;
        & >:not(:first-child) {
            margin-left: .75rem;
        }
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
        & >:not(:first-child) {
            margin-top: .75rem;
        }
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
        &.active, &.selected {
            @include shadow(0px, 0px, 0px, 0px, rgba(0,0,0,0));
            background-color: rgb(201, 201, 201);
        }
        & img {
            width: 100%;
            height: 100%;
        }
    }
}

.scale-band-wrapper {
    margin: .5rem 0;
    height: 2rem;
    @include flex(center, center);
    border-radius: 10px;
    width: 35rem;
    & > div {
        min-width: calc(94% / 97);
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
            border: 1px solid black;
            background-color: darkred;
            box-sizing: border-box;
            min-width: 2%;
            max-width: 2%;
            height: 3rem;
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
