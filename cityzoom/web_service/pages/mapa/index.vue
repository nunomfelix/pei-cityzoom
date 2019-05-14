<template>
    <div class="mapMargin mapHeight" style="position:relative">
        <div class="mapHeight" id="map"></div>

        <div v-if="selected_county" class="ol-popup top">
            <div :style="{ 'background-color': testValues[selected_county.get('name_2')].color}">
                <span class="big"> {{selected_county.get('name_2')}} </span>
                <span class="big"> {{testValues[selected_county.get('name_2')].value.toFixed(2)}} </span>
            </div>
        </div>

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
            <div :title="vertical.display" v-for="vertical of getVerticals" :key="vertical" class="map-menu_button">
                {{vertical.display}}
            </div>
        </div>
        <Loading :show="!loaded" type="absolute"/> 
    </div>
</template>

<script>
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
                color: 'rgba(225, 225, 225, .8)'
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
                url: 'aveiro.geojson',
                format: new format.GeoJSON()
            }),
            renderBuffer: window.innerWidth,
            updateWhileAnimating: true,
            // renderMode: 'image',
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
        var iconFeatures=[];

        var iconFeature = new Feature({
            geometry: new geom.Point(proj.transform([-8.661682, 40.6331731], 'EPSG:4326',     
            'EPSG:3857')),
            name: 'Null Island',
            population: 4000,
            rainfall: 500
        });

        var iconFeature1 = new Feature({
            geometry: new geom.Point(proj.transform([-8.661682, 40.6331731], 'EPSG:4326', 'EPSG:3857')),
            name: 'Null Island Two',
            population: 4001,
            rainfall: 501
        });

        iconFeatures.push(iconFeature);
        iconFeatures.push(iconFeature1);

        var vectorSource = new source.Vector({
            features: iconFeatures //add an array of features
        });

        var iconStyle = new style.Style({
            image: new style.Icon(/** @type {olx.style.IconOptions} */ ({
                anchor: [0.5, 0.5],
                anchorXUnits: 'fraction',
                anchorYUnits: 'fraction',
                scale: 0.1,
                opacity: 0.75,
                src: 'icons/sensor.png'
            }))
        });

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
                geo_layer             
            ],
            overlays: [this.hoverOverlay],
            view: new this.req.Ol.View({
                zoom: 8,
                center,
                minZoom: 6,
                maxZoom: 14
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
            var feature = null
            if (e.selected.length) 
                this.hovered_feature = e.selected[0]

            if(this.hovered_feature && this.hovered_feature != this.selected_county) {
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
            layers: [geo_layer],
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
                padding: [120, 0, 0, 0],
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
            this.hoverOverlay.setPosition(null)
            click_interaction.getFeatures().clear()
        })

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

    @include flex(center, center, column);
    @include shadow(0px, 0px, 4px, 2px, rgba(0,0,0,0.2));
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

    background-color: rgba(255,255,255,.5);
    padding: 10px;
    & > :not(:first-child) {
        margin-top: 1rem;
    }
    border-radius: 5px;

    &_button {
        transition: box-shadow .1s ease 0s, transform .1s ease 0s;
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
