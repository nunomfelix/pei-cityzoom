<template>
    <div class="mapMargin mapHeight" style="position:relative">
        <div class="mapHeight" id="map"></div>
        <div v-if="getStream && selected_county" :style="{ 'background-color': municipalityValues[selected_county.get('id')].color}" class="ol-popup top">
            <div style="background-color: rgba(0,0,0, .5)">
                <span class="xbig bold"> {{selected_county.get('Freguesia')}} <br> {{getStream.display}} </span>
                <div v-if="getStream.name in heatmap.muns[selected_county.get('id')]" class="measure-show">
                    <div :style="{'background-color': getStream.colors[0]}" class="disabled measure-button">
                        <div class="measure-wrapper">
                            MIN
                        </div>
                    </div>
                    <span class="big">{{heatmap.muns[selected_county.get('id')][getStream.name].min.toFixed(2)}}{{getStream.unit}}</span>
                    <div :style="{'background-color': '#' + rainbowHeatMap.colourAt(50)}" class="disabled measure-button">
                        <div class="measure-wrapper">
                            AVG
                        </div>
                    </div>
                    <span class="big">{{heatmap.muns[selected_county.get('id')][getStream.name].average.toFixed(2)}}{{getStream.unit}}</span>
                    <div :style="{'background-color': getStream.colors[1]}" class="disabled measure-button">
                        <div class="measure-wrapper">
                            MAX
                        </div>
                    </div>
                    <span class="big">{{heatmap.muns[selected_county.get('id')][getStream.name].max.toFixed(2)}}{{getStream.unit}}</span>
                </div>
                <div v-else class="normal">No Values</div>
                <div class="scale-band-wrapper">
                    <div :class="{selected: index == municipalityValues[selected_county.get('id')].index}" v-for="index in 100" :key="index" :style="{'background-color': '#' + rainbowHeatMap.colourAt(index)}"></div>
                </div>
            </div>
        </div>

        <div id="hover_popup" class="ol-popup" :style="{ 'background-color': hovered_geo ? municipalityValues[hovered_geo.get('id')].color : 'none'}">
            <div v-if="getStream && hovered_geo" style="background-color: rgba(0,0,0, .5)">
                <span class="big"> {{hovered_geo.get('Freguesia')}} </span>
                <div v-if="getStream.name in heatmap.muns[hovered_geo.get('id')]" class="measure-show">
                    <div :style="{'background-color': getStream.colors[0]}" class="disabled measure-button">
                        <div class="measure-wrapper">
                            MIN
                        </div>
                    </div>
                    <span class="big">{{heatmap.muns[hovered_geo.get('id')][getStream.name].min.toFixed(2)}}{{getStream.unit}}</span>
                    <div :style="{'background-color': '#' + rainbowHeatMap.colourAt(50)}" class="disabled measure-button">
                        <div class="measure-wrapper">
                            AVG
                        </div>
                    </div>
                    <span class="big">{{heatmap.muns[hovered_geo.get('id')][getStream.name].average.toFixed(2)}}{{getStream.unit}}</span>
                    <div :style="{'background-color': getStream.colors[1]}" class="disabled measure-button">
                        <div class="measure-wrapper">
                            MAX
                        </div>
                    </div>
                    <span class="big">{{heatmap.muns[hovered_geo.get('id')][getStream.name].max.toFixed(2)}}{{getStream.unit}}</span>
                </div>
                <div v-else class="normal">No Values</div>
                <!-- <div class="scale-band-wrapper">
                    <div :class="{selected: index == municipalityValues[hovered_geo.get('id')].index}" v-for="index in 100" :key="index" :style="{'background-color': '#' + rainbowHeatMap.colourAt(index)}"></div>
                </div> -->
            </div>
        </div>

        <div v-if="getStream" class="measure-menu">
            <div class="measure-menu_top">
                <div :style="{'background-color': getStream.colors[0]}" class="measure-button" @click="measure_selected = 'min'; updateHeatMap()" :class="{selected: measure_selected == 'min'}" >
                    <div class="measure-wrapper">
                        MIN
                    </div>
                </div>
                <div :style="{'background-color': '#' + rainbowHeatMap.colourAt(50)}" class="measure-button" @click="measure_selected = 'average'; updateHeatMap()" :class="{selected: measure_selected == 'average'}" >
                    <div class="measure-wrapper">
                        AVG
                    </div>
                </div>
                <div :style="{'background-color': getStream.colors[1]}" class="measure-button" @click="measure_selected = 'max'; updateHeatMap()" :class="{selected: measure_selected == 'max'}" >
                    <div class="measure-wrapper">
                        MAX
                    </div>
                </div>
            </div>
            <div class="measure-menu_bottom">
                <div class="measure-menu_bottom_date">
                    <div @click="current_scale > 0 ? current_time -= current_scale : current_time = (new Date(current_time)).addMonths(1 * current_scale); updateValues();" class="arrow"><img src="icons/arrow.png" alt=""></div>
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
                    <div :class="{disabled: current_time == this.getCurrentTimeHour()}" @click="increaseInterval(); updateValues();" class="arrow"><img src="icons/arrow.png" alt=""></div>
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
            </div>
        </div>

        <div class="map-menu show">
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
        <Loading :show="!loaded" type="absolute"/> 
        <ModalResizable v-if="showModal" @close="showModal = false" :values="values"/>
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

            municipalityValues: {},
            hexagonValues: {},
            
            testValues: {},
            testValuesOrdered: [],
            rainbowHeatMap: new Rainbow(),

            selected_vertical: 0,
            selected_stream: 0,
            selected_county: null,
            hovered_geo: null,

            geoJsonExtent: null,
            showModal: false,

            geo_layer: null,
            devices_layer: null,
            shown_features: [],
            hidden_hex: [],

            heatmap: {},
            measure_selected: 'average',
            current_scale: 3600000,
            current_time: null
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
            },
            renderMode: 'hybrid'
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

        this.hex_layer.getSource().on('change', () => {
            if(this.hex_layer.getSource().getState() == 'ready' && (!this.loaded || !this.geo_loaded)) {
                this.loaded = true
                if(this.geo_loaded)
                    this.load()
            }
        })


        this.geo_layer.getSource().on('change', () => {
            if(this.geo_layer.getSource().getState() == 'ready' && (!this.loaded || !this.geo_loaded)) {
                this.get_loaded = true
                if(this.loaded)
                    this.load()
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
                                hexagon: device.hexagon
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

                if(this.selected_county)
                    this.addHiddenHex(this.selected_county)
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
                            hexagon: device.hexagon
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

    },
    methods: {
        load() {
            this.geoJsonExtent = this.req.extent.createEmpty()
            this.geo_layer.getSource().getFeatures().forEach(feature => {
                console.log(feature)
                this.geoJsonExtent = this.req.extent.extend(this.geoJsonExtent, feature.getGeometry().getExtent())
            })
            console.log(this.geoJsonExtent)
            setTimeout(() => {
                this.map.getView().fit(this.geoJsonExtent, {
                    duration: 500
                })
            },0)

            this.current_time = this.getCurrentTimeHour()
            this.updateValues()
            setInterval(() => {
                this.updateValues()
            }, 5000)
            //this.selectVertical(0)
        },
        increaseInterval() {
            const tmp = this.current_scale > 0 ? this.current_time += this.current_scale : this.current_time = (new Date(this.current_time)).addMonths(-1 * this.current_scale); 
            const date = this.getCurrentTimeHour()
            this.current_time = tmp > date ? date : tmp;
        },
        getCurrentTimeHour() {
            return Math.ceil((new Date()).getTime() / 3600000) * 3600000
        },
        async updateValues() {
            const res = await this.$axios.get(`http://193.136.93.14:8001/czb/streams/heatmap?interval_start=${Math.floor(this.getStartDate)}&interval_end=${Math.floor(this.getCurrentDate)}`, {
                headers: {
                    Authorization: this.$store.state.jwt
                }
            })
            this.heatmap = res.data
            this.updateHeatMap()
        },
        clearHoverPopup() {
            this.hovered_geo = null
            document.body.style.cursor = "default"
            this.hoverOverlay.setPosition(null)
        },
        clearGeoDevices(geo) {
            const tmp = [...this.shown_features]
            for(var feature of tmp) {
                if(feature.get('hexagon').substring(0, 6) == geo.get('id')) {
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

            for(var i in this.heatmap.muns) {
                if(!(i in this.municipalityValues))
                    this.municipalityValues[i] = {}
                if(!(stream.name in this.heatmap.muns[i])) {
                    this.municipalityValues[i].index = null
                    this.municipalityValues[i].color = '#ffffff00';
                } else {
                    const value = this.heatmap.muns[i][stream.name].average
                    const index = (value - stream.min) * 100 / (stream.max - stream.min)
                    this.municipalityValues[i].index = Math.round(index)
                    this.municipalityValues[i].color = '#' + this.rainbowHeatMap.colourAt(Math.round(index)) + 'D0';
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

            for(var i in this.heatmap.hexagons) {
                if(!(i in this.hexagonValues))
                    this.hexagonValues[i] = {}
                if(!(stream.name in this.heatmap.hexagons[i])) {
                    this.hexagonValues[i].index = null
                    this.hexagonValues[i].color = '#ffffffa0';
                } else {
                    const value = this.heatmap.hexagons[i][stream.name][this.measure_selected]
                    const index = (value - stream.min) * 100 / (stream.max - stream.min)
                    this.hexagonValues[i].index = Math.round(index)
                    this.hexagonValues[i].color = '#' + this.rainbowHeatMap.colourAt(Math.round(index)) + 'FF';;
                }
                this.hexagonValues[i].style = new this.req.style.Style({
                    fill: new this.req.style.Fill({
                        color: this.hexagonValues[i].color,
                    }),
                    stroke: new this.req.style.Stroke({
                        color: this.hexagonValues[i].index ? 'black' : 'transparent',
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
    z-index: 3332;
    position: absolute;
    text-align: center;
    filter: drop-shadow(0 1px 4px rgba(0,0,0,0.6));
    font-weight: 900;
    white-space: nowrap;
    left: 50%;
    background-color: rgba(255, 255, 255, 0.589);
    top: 50%;
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
            width: 1px;
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
