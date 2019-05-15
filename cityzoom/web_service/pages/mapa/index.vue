<template>
    <div class="mapMargin mapHeight" style="position:relative">
        <div class="mapHeight" id="map"></div>

        <div v-if="selected_county" :style="{ 'background-color': testValues[selected_county.get('name_2')].color}" class="ol-popup top">
            <div style="background-color: rgba(0,0,0, .5)">
                <span class="big"> {{selected_county.get('name_2')}} </span>
                <span class="big"> {{testValues[selected_county.get('name_2')].value.toFixed(2)}} </span>
            </div>
        </div>

        <div id="hover_popup" class="ol-popup" :style="{ 'background-color': hovered_feature ? testValues[hovered_feature.get('name_2')].color : ''}">
            <div v-if="hovered_feature" style="background-color: rgba(0,0,0, .5)">
                <span class="normal"> {{hovered_feature.get('name_2')}} </span>
                <span class="normal"> {{testValues[hovered_feature.get('name_2')].value.toFixed(2)}} </span>
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
        <ModalResizable v-if="showModal" @close="showModal = false"/>
    </div>
</template>

<script>
var Rainbow = require('rainbowvis.js');
const drone_stream = require('static/get_stream_values_response.json');
//console.log(JSON.stringify(drone_stream))  
export default {
    data() {
        return {
            req: {
                Ol: null,
                etent: null,
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
                        scale: 1,
                    },
                    hover: {
                        scale: 1.2,
                    },
                },
                styles: {}
            },  
            hoverOverlay: null,
            hoverPopup: null,
            testValues: {},
            testValuesOrdered: [],
            rainbowHeatMap: null,

            selected_vertical: null,
            selected_stream: null,
            selected_county: null,
            hovered_feature: null,

            geoJsonExtent: null,
            showModal: false,
        }
    },
    computed: {
        getVerticals() {
            return this.$store.state.verticals
        }
    },
    mounted() {
        this.req.Ol = require( 'ol');
        const proj = require('ol/proj')
        const source = require( 'ol/source');
        const layer = require( 'ol/layer');
        this.req.style = require( 'ol/style');
        this.req.extent = require( 'ol/extent');
        const format = require('ol/format')
        const geom = require( 'ol/geom');
        const interaction = require( 'ol/interaction');
        const { Feature } = require( 'ol')
        const { click, pointerMove, altKeyOnly, noModifierKeys, altShiftKeysOnly, platformModifierKeyOnly } = require( 'ol/events/condition.js');
        
        
        var iconStyle = [new this.req.style.Style({
            image: new this.req.style.Icon(/** @type {olx.this.req.style.IconOptions} */ ({
                anchor: [0.5, 0.5],
                anchorXUnits: 'fraction',
                anchorYUnits: 'fraction',
                scale: .75,
                opacity: 0.75,
                src: 'icons/AirQuality_map.png'
            }))
        })
        ,new this.req.style.Style({
            image: new this.req.style.Icon(/** @type {olx.this.req.style.IconOptions} */ ({
                anchor: [0.5, 0.5],
                anchorXUnits: 'fraction',
                anchorYUnits: 'fraction',
                scale: .75,
                opacity: 0.75,
                src: 'icons/Temperature_map.png'
            }))
        })]

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
                color: 'rgba(255,255,255,.20)'
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
                url: 'aveiro.geojson',
                format: new format.GeoJSON()
            }),
            renderBuffer: window.innerWidth,
            updateWhileAnimating: true,
            // renderMode: 'image'
        })

        this.hoverPopup = document.getElementById('hover_popup');
        this.hoverOverlay = new this.req.Ol.Overlay({
            element: this.hoverPopup,
            autoPan: false,
            positioning: 'bottom-center',
            autoPanAnimation: {
                duration: 250
            }
        });
    
        //console.log(features)
    
        var vectorSource = new source.Vector({
            style: (feature) => {
                return this.devicesStyle
            }
        });
        
        var devicesLayer = new layer.Vector({
                    source: vectorSource,
                    style: iconStyle[Math.floor(Math.random() * iconStyle.length)]
        }) 

        const centerpos = [-8.661682, 40.6331731];
        const center = proj.transform(centerpos, 'EPSG:4326', 'EPSG:3857');
        const maxExtent = [-9.5, 37, -6.2, 42.5];
        //const maxExtent = [-180, -90, 180, 90];
        this.map = new this.req.Ol.Map({
            target: 'map',
            layers: [
                new layer.Tile({
                    source: new source.OSM(),
                }),
                devicesLayer,  
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

        this.geo_layer.getSource().on('change', () => {
            if(this.geo_layer.getSource().getState() == 'ready' && !this.loaded) {
                this.loaded = true
                this.rainbowHeatMap = new Rainbow()

                this.geoJsonExtent = this.req.extent.createEmpty()
                this.geo_layer.getSource().getFeatures().forEach(feature => {
                    this.geoJsonExtent = this.req.extent.extend(this.geoJsonExtent, feature.getGeometry().getExtent())
                    this.testValues[feature.get('name_2')] = {
                        value: Math.random() * 35,
                        color: null,
                        style: null
                    }
                })

                this.testValuesOrdered = Object.keys(this.testValues).sort((a,b) => {
                    return this.testValues[a].value - this.testValues[b].value
                })

                devicesLayer.setStyle((feature) => { return iconStyle[Math.floor(Math.random() * iconStyle.length)]})

                this.geo_layer.setStyle((feature) => {
                    return feature == this.selected_county ? this.geoStyle.active : this.testValues[feature.get('name_2')].style
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
                return feature == this.selected_county ?
                    this.geoStyle.active
                :
                    this.geoStyle.hover
            },
            multi: false
        })

        this.map.addInteraction(hover_interaction);
        hover_interaction.on('select', (e) => {
            if(e.selected.length && e.selected[0] != this.selected_county) {
                this.hovered_feature = e.selected[0]
                console.log(this.hovered_feature)
                document.body.style.cursor = "pointer"
                this.hoverOverlay.setPosition(this.req.extent.getCenter(this.hovered_feature.getGeometry().getExtent()))
            } else {
                this.hovered_feature = null
                document.body.style.cursor = "default"
                this.hoverOverlay.setPosition(null)
            }
        })

        const click_interaction = new interaction.Select({
            condition: (e) => {
                return click(e);
            },
            layers: [this.geo_layer, devicesLayer],
            multi: true
        })

        this.map.addInteraction(click_interaction);
        click_interaction.on('select', (e) => {
            document.body.style.cursor = "default"
            this.hovered_feature = null
            const geo_feature = e.selected[0]
            if(geo_feature.get('name_2') && geo_feature != this.selected_county) {
                this.map.setView(new this.req.Ol.View({
                    center: this.map.getView().getCenter(),
                    zoom: this.map.getView().getZoom(),
                    minZoom: 0,
                    maxZoom: 18
                }))
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
                this.selected_county = geo_feature 
                this.hoverOverlay.setPosition(null)
            } else if(e.selected.length > 1) {
                const device_feature = e.selected[e.selected.length - 1]
                this.showModal = true   
            }
            click_interaction.getFeatures().clear()
        })

        // const click_device_interaction = new interaction.Select({
        //     condition: (e) => {
        //         return click(e);
        //     },
        //     layers: [devicesLayer]
        // })
        // this.map.addInteraction(click_device_interaction);

        // click_device_interaction.on('select', (e) => {
        //     document.body.style.cursor = "default"
        //     const feature = e.selected[0]
        //     console.log(feature)
        //     this.showModal = true
        // })

        //this.createFeature(vectorSource, []);

        
        //console.log(devicesLayer.getSource().getFeatures());

        //this.createFeature(vectorSource, []);
        var feat = new Feature({
            geometry: new geom.Point(proj.transform([drone_stream.values[0].longitude, drone_stream.values[0].latitude], 'EPSG:4326',     
            'EPSG:3857'))
            //id: device.id
        })
        vectorSource.addFeature(feat)
        var i = 1;
        setInterval(() => {
            vectorSource.removeFeature(feat);
            feat = new Feature({
                geometry: new geom.Point(proj.transform([drone_stream.values[i].longitude, drone_stream.values[i].latitude], 'EPSG:4326',     
                'EPSG:3857'))
                //id: device.id
            })
            vectorSource.addFeature(feat)
            i++
        },200)
    


    },
    methods: {
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
            this.selected_county = null
        },
        createFeature(source, device){
            const { Feature } = require( 'ol');
            const geom = require( 'ol/geom');
            const proj = require('ol/proj');
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
                    geometry: new geom.Point(proj.transform([value[1],value[0]], 'EPSG:4326', 'EPSG:3857')),
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
            }
        },
        selectStream(i) {
            if(i != this.selected_stream) {
                this.selected_stream = i
                this.updateHeatMap()
            }
        },
        updateHeatMap() {
            this.rainbowHeatMap.setNumberRange(1, this.geo_layer.getSource().getFeatures().length);
            this.rainbowHeatMap.setSpectrum(this.getVerticals[this.selected_vertical].streams[this.selected_stream].colors[0] , this.getVerticals[this.selected_vertical].streams[this.selected_stream].colors[1]); 

            for(var i in this.testValuesOrdered) {
                this.testValues[this.testValuesOrdered[i]].color = '#' + this.rainbowHeatMap.colourAt(i);
                this.testValues[this.testValuesOrdered[i]].style = new this.req.style.Style({
                    fill: new this.req.style.Fill({
                        color: this.testValues[this.testValuesOrdered[i]].color + 'e0'
                    }),
                    stroke: new this.req.style.Stroke({
                        color: 'black',
                        width: this.map.getView().getZoom() / 20 * 2.5
                    })
                })
            }

            this.geo_layer.setStyle((feature) => {
                return feature == this.selected_county ? this.geoStyle.active : this.testValues[feature.get('name_2')].style
            })
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
    padding: 5px;
    border-radius: 12px;

    & > div {
        @include flex(center, center, column);
        color: white;
        padding: .4rem .7rem;
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

</style>
