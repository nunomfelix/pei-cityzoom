<template>
    <div class="mapMargin mapHeight" style="position:relative">
        <div class="mapHeight" id="map"></div>
        <div id="hover_popup" class="ol-popup">
            <div v-if="hovered_feature" :style="{ 'background-color': testValues[hovered_feature.get('name_2')].color}">
                <span class="normal">
                    {{hovered_feature.get('name_2')}}
                </span>
                <span class="normal">
                    {{testValues[hovered_feature.get('name_2')].value.toFixed(2)}}
                </span>
            </div>
        </div>
        <div class="map-menu left" :class="{show: selected_county != null, active: selected_county == null}">
            <div class="map-menu_button" @click="deselect_county()">

            </div>
        </div>

        <div class="map-menu show">
            <div class="map-menu_button">

            </div>
            <div class="map-menu_button">
                
            </div>
        </div>
        <Loading :show="!loaded" type="absolute"/> 
    </div>
</template>

<script>
var features = []
var Rainbow = require('rainbowvis.js');
export default {
    data() {
        return {
            req: {
                Ol: null
            },
            map: null,
            loaded: false,
            geoStyle: {
                default: null,
                hover: null,
                selected: null
            },
            devicesStyle: {
                default: null,
                hover: null,
                selected: null
            },  
            hoverOverlay: null,
            hoverPopup: null,
            testValues: { },
            rainbowHeatMap: null,
            hovered_feature: null,
            state: null,
            selected_county: null,
            geoJsonExtent: null
        }
    },
    mounted() {
        
        this.req.Ol = require( 'ol');
        const proj = require('ol/proj')
        const source = require( 'ol/source');
        const layer = require( 'ol/layer');
        const style = require( 'ol/style');
        const extent = require( 'ol/extent');

        const { click, pointerMove, altKeyOnly, noModifierKeys, altShiftKeysOnly, platformModifierKeyOnly } = require('ol/events/condition.js');

        // const style = require( 'ol/style');

        const format = require('ol/format')
        const geom = require( 'ol/geom');
        // const {Polygon, fromExtent} = require( 'ol/geom/Polygon');
        const interaction = require( 'ol/interaction');
        // const extent = require( 'ol/extent');
        // const Overlay = require( 'ol/Overlay.js');
        const { Feature } = require( 'ol')
        // const { click, pointerMove, altKeyOnly, noModifierKeys, altShiftKeysOnly, platformModifierKeyOnly } = require( 'ol/events/condition.js');
        var iconStyle = [new style.Style({
            image: new style.Icon(/** @type {olx.style.IconOptions} */ ({
                anchor: [0.5, 0.5],
                anchorXUnits: 'fraction',
                anchorYUnits: 'fraction',
                scale: 1,
                opacity: 0.75,
                src: 'icons/Air_Quality.png'
            }))
        })
        ,new style.Style({
            image: new style.Icon(/** @type {olx.style.IconOptions} */ ({
                anchor: [0.5, 0.5],
                anchorXUnits: 'fraction',
                anchorYUnits: 'fraction',
                scale: 1,
                opacity: 0.75,
                src: 'icons/Temperature.png'
            }))
        })]

        this.devicesStyle.default = new style.Style({
            fill: new style.Fill({
                color: 'rgba(255,255,255,.6)'
            }),
            stroke: new style.Stroke({
                color:'rgb(48, 145, 198)',
                width: 1      
            })
        })
        this.devicesStyle.hover = new style.Style({
            fill: new style.Fill({
                color: 'rgba(225, 225, 225, .6)'
            }),
            stroke: new style.Stroke({
                color:'rgb(0, 0, 255)',
                width: 1.5
            })
        })
        this.devicesStyle.active = new style.Style({
            fill: new style.Fill({
                color: 'rgba(255, 255, 255, .25)'
            }),
            stroke: new style.Stroke({
                color:'rgb(0, 0, 125)',
                width: 5
            })
        })

        this.geoStyle.default = new style.Style({
            fill: new style.Fill({
                color: 'rgba(255,255,255,.20)'
            }),
            stroke: new style.Stroke({
                color:'rgb(48, 145, 198)',
                width: 1
            })
        })

        this.geoStyle.hover = new style.Style({
            fill: new style.Fill({
                color: 'rgba(225, 225, 225, .6)'
            }),
            stroke: new style.Stroke({
                color:'rgb(0, 0, 255)',
                width: 1.5
            })
        })

        this.geoStyle.active = new style.Style({
            fill: new style.Fill({
                color: 'rgba(255, 255, 255, .25)'
            }),
            stroke: new style.Stroke({
                color:'rgb(0, 0, 125)',
                width: 5
            })
        })

        const geo_layer = new layer.Vector({
            source: new source.Vector({
                projection : 'EPSG:3857',
                url: 'portugal_municipios.geojson',
                format: new format.GeoJSON()
            }),
            // renderBuffer: window.innerWidth,
            // updateWhileAnimating: true,
            renderMode: 'image',
            style: (feature) => {
                return this.geoStyle.default
            }
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
        

        features.push(new Feature({
                        geometry: new geom.Point(proj.transform([-8.661682, 40.6331731], 'EPSG:4326',     
                        'EPSG:3857')),
                        //id: device.id
                        name: 'Null Island'
                        }));

        //console.log(features)
    
        var vectorSource = new source.Vector({
            features: features, //add an array of features
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
                geo_layer,
                devicesLayer         
            ],
            overlays: [this.hoverOverlay],
            view: new this.req.Ol.View({
                zoom: 8,
                center,
                minZoom: 6,
                maxZoom: 14
            })
        })

        devicesLayer.getSource().on('click', (e) => {
            console.log('entrei')
            map.forEachFeatureAtPixel(e.pixel, function (feature, layer) {
                console.log('feature')
            })
        }) 

        geo_layer.getSource().on('change', () => {
            if(geo_layer.getSource().getState() == 'ready' && !this.loaded) {
                this.loaded = true

                this.rainbowHeatMap = new Rainbow()
                this.rainbowHeatMap.setNumberRange(1, geo_layer.getSource().getFeatures().length);
                this.rainbowHeatMap.setSpectrum('green', 'red'); 

                this.geoJsonExtent = extent.createEmpty()
                geo_layer.getSource().getFeatures().forEach(feature => {
                    this.geoJsonExtent = extent.extend(this.geoJsonExtent, feature.getGeometry().getExtent())
                    this.testValues[feature.get('name_2')] = {
                        value: Math.random() * 35,
                        color: null,
                        style: null
                    }
                })

                const testValuesOrdered = Object.keys(this.testValues).sort((a,b) => {
                    return this.testValues[a].value - this.testValues[b].value
                })
                for(var i in testValuesOrdered) {
                    this.testValues[testValuesOrdered[i]].color = '#' + this.rainbowHeatMap.colourAt(i);
                    this.testValues[testValuesOrdered[i]].style = new style.Style({
                        fill: new style.Fill({
                            color: this.testValues[testValuesOrdered[i]].color
                        }),
                        stroke: new style.Stroke({
                            color: 'black',
                            width: this.map.getView().getZoom() / 20 * 2.5
                        })
                    })
                }

                devicesLayer.setStyle((feature) => { return iconStyle[Math.floor(Math.random() * iconStyle.length)]})

                geo_layer.setStyle((feature) => {
                    return feature == this.selected_county ? this.geoStyle.active : this.testValues[feature.get('name_2')].style
                })



                this.map.getView().fit(this.geoJsonExtent, {
                    duration: 500
                })
 
            }
        })

        const hover_interaction = new interaction.Select({
            condition: (e) => {
                return pointerMove(e) && !this.map.getView().getAnimating();
            },
            layers: [geo_layer],
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
            if (e.selected.length) {
                this.hovered_feature = e.selected[0]
                document.body.style.cursor = "pointer"
                var center = extent.getCenter(this.hovered_feature.getGeometry().getExtent())
                this.hoverOverlay.setPosition(center)
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
            layers: [geo_layer, devicesLayer],
            multi: true
        })

        this.map.addInteraction(click_interaction);
        click_interaction.on('select', (e) => {
            const feature = e.selected[0]
            this.map.setView(new this.req.Ol.View({
                center: this.map.getView().getCenter(),
                zoom: this.map.getView().getZoom(),
                minZoom: 0,
                maxZoom: 18
            }))
            this.map.getView().fit(feature.getGeometry().getExtent(), {
                duration: 500,
                callback: () =>  {
                    this.map.setView(new this.req.Ol.View({
                        extent: feature.getGeometry().getExtent(),
                        center: this.map.getView().getCenter(),
                        zoom: this.map.getView().getZoom(),
                        minZoom: this.map.getView().getZoom(),
                        maxZoom: 18
                    }))
                }
            })   
            this.selected_county = feature 
            click_interaction.getFeatures().clear()
        }),
        
        this.createFeature(vectorSource, []);
        
        console.log(devicesLayer.getSource().getFeatures())

        // setInterval(()=> {
        //     vectorSource.forEachFeature(feature => {
        //         vectorSource.removeFeature(feature)
        //         var coordinates = this.gen_random_coordinates() 
        //         vectorSource.addFeature(new Feature({
        //             geometry: new geom.Point(proj.transform(coordinates, 'EPSG:4326', 'EPSG:3857')),
        //             //id: device.id
        //             name: 'Null Island'
        //         }));
        //     })
        // },500);
        

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
            }
        ,
        gen_random_coordinates(){
            const limits = [-8.654981, -8.638642, 40.648018, 40.635610] 
            return [(Math.random() * (limits[0] - limits[1]) + limits[1]),(Math.random() * (limits[2] - limits[3]) + limits[3])]
        }

    }
}
</script>

<style lang="scss" scope>
@import '~/assets/mixins.scss';

.ol-popup {

    @include shadow(0px, 1px, 4px, 0px, rgba(0,0,0,0.2));
    pointer-events: none;
    z-index: 3332;
    position: absolute;
    text-align: center;
    filter: drop-shadow(0 1px 4px rgba(0,0,0,0.2));
    font-weight: 900;
    white-space: nowrap;
    font-size: 1.5rem;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    width: max-content;
    padding: 5px;
    background-color: rgba(255, 255, 255, 0.589);
        border-radius: 12px;

    & > div {
        @include flex(center, center, column);
        color: white;
        padding: .4rem .7rem;
        border-radius: 10px;
    }
}

.map-menu {
    @include flex(center, center);
    @include shadow(0px, 0px, 4px, 2px, rgba(0,0,0,0.2));
    @include transition(opacity, .5s, ease, 0s);
    z-index: 3600;
    opacity: 0;
    &.show {
        opacity: 1;
    }

    position: absolute;
    right: 2rem;
    bottom: 2rem;
    &.left {
        left: 2rem;
        right: auto;
    }
    background-color: rgba(255,255,255,.5);
    padding: 10px;
    & > :not(:first-child) {
        margin-left: 1rem;
    }
    border-radius: 5px;

    &_button {
        transition: box-shadow .2s ease 0s, transform .2s ease 0s;
        @include shadow(0px, 0px, 4px, 2px, rgba(0,0,0,0.2));
        border: 1px solid rgba(0, 0, 0, 0.171);
        background-color: white;
        width: 5rem;
        height: 5rem;
        border-radius: 5px;
        &:hover {
            transform: scale(1.05);
            cursor: pointer;
            &:active {
                @include shadow(0px, 0px, 0px, 0px, rgba(0,0,0,0));
                transform: scale(1);
            }
        }
        &.active {
            @include shadow(0px, 0px, 0px, 0px, rgba(0,0,0,0));
        }
    }
}

</style>
