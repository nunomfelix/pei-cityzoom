<template>
    <div class="mapMargin mapHeight" style="position:relative">
        <div class="mapHeight" id="map"></div>
        <div id="hover_popup" class="ol-popup">
            <div v-if="hovered_feature" :style="{ 'background-color': '#' + testValues[hovered_feature.get('name_2')].color}">
                <span class="normal">
                    {{hovered_feature.get('name_2')}}
                </span>
                <span class="normal">
                    {{testValues[hovered_feature.get('name_2')].value.toFixed(2)}}
                </span>
            </div>
        </div>
        <div class="map-menu">
            <div class="map-menu_button">

            </div>
            <div class="map-menu_button">
                
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
            map: null,
            loaded: false,
            geoStyle: {
                default: null,
                hover: null
            },
            hoverOverlay: null,
            hoverPopup: null,
            testValues: { },
            rainbowHeatMap: null,
            hovered_feature: null
        }
    },
    mounted() {
        
        const Ol = require( 'ol');
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
                color: 'rgba(255, 255, 255, .25)'
            }),
            stroke: new style.Stroke({
                color:'rgb(0, 0, 0)',
                width: 1.5
            })
        })

        const centerpos = [-8.661682, 40.6331731];
        const center = proj.transform(centerpos, 'EPSG:4326', 'EPSG:3857');
        const maxExtent = [-9.5, 37, -6.2, 42.5];
        //const maxExtent = [-180, -90, 180, 90];
        const geo_layer = new layer.Vector({
            source: new source.Vector({
                projection : 'EPSG:3857',
                url: 'portugal_municipios.geojson',
                format: new format.GeoJSON()
            }),
            // renderBuffer: window.innerWidth,
            // updateWhileAnimating: true,
            renderMode: 'image',
            style: () => {
                return this.geoStyle.default
            }
        })

        this.hoverPopup = document.getElementById('hover_popup');
        this.hoverOverlay = new Ol.Overlay({
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

        this.map = new Ol.Map({
            target: 'map',
            layers: [
                new layer.Tile({
                    source: new source.OSM(),
                }),
                geo_layer             
            ],
            overlays: [this.hoverOverlay],
            view: new Ol.View({
                zoom: 8,
                center,
                minZoom: 6,
                maxZoom: 20
            })

        })

        geo_layer.getSource().on('change', () => {
            if(geo_layer.getSource().getState() == 'ready' && !this.loaded) {
                this.loaded = true

                this.rainbowHeatMap = new Rainbow()
                this.rainbowHeatMap.setNumberRange(1, geo_layer.getSource().getFeatures().length);
                this.rainbowHeatMap.setSpectrum('green', 'red'); 

                var x = 0
                var tmp_extent = extent.createEmpty()
                geo_layer.getSource().getFeatures().forEach(feature => {
                    tmp_extent = extent.extend(tmp_extent, feature.getGeometry().getExtent())
                    this.testValues[feature.get('name_2')] = {
                        value: Math.random() * 35,
                        color: null
                    }
                })

                console.table(this.testValues)

                geo_layer.setStyle((feature) => {
                    return new style.Style({
                        fill: new style.Fill({
                            color: '#' + this.testValues[feature.get('name_2')].color
                        }),
                        stroke: new style.Stroke({
                            color: 'black',
                            width: this.map.getView().getZoom() / 14 * 1.5
                        })
                    })
                })

                const testValuesOrdered = Object.keys(this.testValues).sort((a,b) => {
                    return this.testValues[a].value - this.testValues[b].value
                })
                for(var i in testValuesOrdered) {
                    this.testValues[testValuesOrdered[i]].color = this.rainbowHeatMap.colourAt(i);
                }

                this.map.getView().fit(tmp_extent, {
                    duration: 500
                })
 
            }
        })

        const hover_interaction = new interaction.Select({
            condition: (e) => {
                return pointerMove(e);
            },
            layers: [geo_layer],
            style: (feature) => {
                return this.geoStyle.hover
            },
            multi: false
        })

        this.map.addInteraction(hover_interaction);
        hover_interaction.on('select', (e) => {
            if (e.selected.length) {    
                const feature = e.selected[0]
                this.hovered_feature = feature
                document.body.style.cursor = "pointer"
                var center = extent.getCenter(feature.getGeometry().getExtent())
                this.hoverOverlay.setPosition(center)
            } else {
                this.hovered_feature = null
                document.body.style.cursor = "default"
                this.hoverOverlay.setPosition(null)
            }
        })
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
    position: absolute;
    right: 2rem;
    bottom: 2rem;
    background-color: rgba(255,255,255,.5);
    padding: 10px;
    & > :not(:first-child) {
        @include shadow(0px, 0px, 4px, 2px, rgba(0,0,0,0.2));
        margin-left: 1rem;
    }
    border-radius: 5px;

    &_button {
        border: 1px solid rgba(0, 0, 0, 0.171);
        background-color: white;
        width: 5rem;
        height: 5rem;
        border-radius: 5px;
    }
}

</style>
