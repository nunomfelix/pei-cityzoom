<template>
    <div class="mapMargin mapHeight" style="position:relative">
        <div class="mapHeight" id="map"></div>
        <Loading :show="!loaded" type="absolute"/> 
    </div>
</template>

<script>
export default {
    data() {
        return {
            map: null,
            loaded: false,
            geoStyle: {
                default: null,
                hover: null
            }
        }
    },
    mounted() {
        
        const Ol = require( 'ol');
        const proj = require('ol/proj')
        const source = require( 'ol/source');
        const layer = require( 'ol/layer');
        const style = require( 'ol/style');
        const extent = require( 'ol/extent');
        // const style = require( 'ol/style');

        const format = require('ol/format')
        const geom = require( 'ol/geom');
        // const {Polygon, fromExtent} = require( 'ol/geom/Polygon');
        const interaction = require( 'ol/interaction');
        // const extent = require( 'ol/extent');
        // const Overlay = require( 'ol/Overlay.js');
        // const { Feature } = require( 'ol')
        // const { click, pointerMove, altKeyOnly, noModifierKeys, altShiftKeysOnly, platformModifierKeyOnly } = require( 'ol/events/condition.js');

        const centerpos = [-8.661682, 40.6331731];
        const center = proj.transform(centerpos, 'EPSG:4326', 'EPSG:3857');
        const maxExtent = [-9.5, 37, -6.2, 42.5];
        //const maxExtent = [-180, -90, 180, 90];
        var vector_source = new source.Vector({
                projection : 'EPSG:3857',
                url: 'portugal_municipios.geojson',
                format: new format.GeoJSON()
        });

        this.map = new Ol.Map({
            target: 'map',
            layers: [
                new layer.Tile({
                    source: new source.OSM(),
                }),
                new layer.Vector({
                    source: vector_source,
                    // renderBuffer: window.innerWidth,
                    // updateWhileAnimating: true,
                    renderMode: 'image',
                    style: () => {
                        return new style.Style({
                        })
                    }
                })                
            ],
            view: new Ol.View({
                zoom: 8,
                center,
                minZoom: 6,
                maxZoom: 11
            })

        })

        vector_source.on('change', () => {
            if(vector_source.getState() == 'ready' && !this.loaded) {
                this.loaded = true
                var tmp_extent = extent.createEmpty()
                vector_source.getFeatures().forEach(feature => {
                    tmp_extent = extent.extend(tmp_extent, feature.getGeometry().getExtent())
                })
                this.map.getView().fit(tmp_extent, {
                    duration: 500
                })
                const limits = [-8.504015, -7.586928, 41.418811, 37.230650] //Portugal

            }
        })
    }

}
</script>

<style>
    .lds-roller-fixed {
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
    }
    .lds-roller-relative {
        position: relative;
        display: flex;
        justify-content: center;
        align-items: center;
        height: 100%;
    }
    .lds-roller {
        width: 64px;
        height: 64px;
    }
    .lds-roller div {
        animation: lds-roller 1.2s cubic-bezier(0.5, 0, 0.5, 1) infinite;
        transform-origin: 32px 32px;
    }
    .lds-roller div:after {
    content: " ";
        display: block;
        position: absolute;
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background: black;
        margin: -3px 0 0 -3px;
    }
    .lds-roller div:nth-child(1) {
        animation-delay: -0.036s;
    }
    .lds-roller div:nth-child(1):after {
        top: 50px;
        left: 50px;
    }
    .lds-roller div:nth-child(2) {
        animation-delay: -0.072s;
    }
    .lds-roller div:nth-child(2):after {
        top: 54px;
        left: 45px;
    }
    .lds-roller div:nth-child(3) {
        animation-delay: -0.108s;
    }
    .lds-roller div:nth-child(3):after {
        top: 57px;
        left: 39px;
    }
    .lds-roller div:nth-child(4) {
        animation-delay: -0.144s;
    }
    .lds-roller div:nth-child(4):after {
        top: 58px;
        left: 32px;
    }
    .lds-roller div:nth-child(5) {
        animation-delay: -0.18s;
    }
    .lds-roller div:nth-child(5):after {
        top: 57px;
        left: 25px;
    }
    .lds-roller div:nth-child(6) {
        animation-delay: -0.216s;
    }
    .lds-roller div:nth-child(6):after {
        top: 54px;
        left: 19px;
    }
    .lds-roller div:nth-child(7) {
        animation-delay: -0.252s;
    }
    .lds-roller div:nth-child(7):after {
        top: 50px;
        left: 14px;
    }
    .lds-roller div:nth-child(8) {
        animation-delay: -0.288s;
    }
    .lds-roller div:nth-child(8):after {
        top: 45px;
        left: 10px;
    }
    @keyframes lds-roller {
        0% {
            transform: rotate(0deg);
        }
        100% {
            transform: rotate(360deg);
        }
    }
</style>
