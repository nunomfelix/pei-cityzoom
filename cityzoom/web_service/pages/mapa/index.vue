<template>
    <div id="map" style="height: calc(100vh - 100px)"></div>
</template>

<script>
export default {
    data() {
        return {
            map: null
        }
    },
    mounted() {
        
        const Ol = require( 'ol');
        const proj = require('ol/proj')
        const source = require( 'ol/source');
        const layer = require( 'ol/layer');
        // const style = require( 'ol/style');
        // const geom = require( 'ol/geom');
        // const {Polygon, fromExtent} = require( 'ol/geom/Polygon');
        const interaction = require( 'ol/interaction');
        // const extent = require( 'ol/extent');
        // const Overlay = require( 'ol/Overlay.js');
        // const { Feature } = require( 'ol')
        // const { click, pointerMove, altKeyOnly, noModifierKeys, altShiftKeysOnly, platformModifierKeyOnly } = require( 'ol/events/condition.js');

        const centerpos = [-8.6, 40.65];
        const center = proj.transform(centerpos, 'EPSG:4326', 'EPSG:3857');
        const maxExtent = [-9.5, 37, -6.2, 42.5];
        //const maxExtent = [-180, -90, 180, 90];

        this.map = new Ol.Map({
            target: 'map',
            layers: [
                new layer.Tile({
                    source: new source.OSM(),
                })
            ],
            view: new Ol.View({
                zoom: 4,
                center,
            })
        })
    }

}
</script>

<style>

</style>
