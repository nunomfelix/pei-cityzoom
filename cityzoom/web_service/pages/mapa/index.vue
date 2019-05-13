<template>
    <div class="mapMargin mapHeight" style="position:relative">
        <div class="mapHeight" id="map"></div>
        <div id="hover_popup" class="ol-popup"></div>
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
            },
            hoverOverlay: null,
            hoverPopup: null,
            testValues: {
                
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

        const { click, pointerMove, altKeyOnly, noModifierKeys, altShiftKeysOnly, platformModifierKeyOnly } = require('ol/events/condition.js');

        // const style = require( 'ol/style');

        const format = require('ol/format')
        const geom = require( 'ol/geom');
        // const {Polygon, fromExtent} = require( 'ol/geom/Polygon');
        const interaction = require( 'ol/interaction');
        // const extent = require( 'ol/extent');
        // const Overlay = require( 'ol/Overlay.js');
        // const { Feature } = require( 'ol')
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
                color: 'rgb(48, 145, 198)'
            }),
            stroke: new style.Stroke({
                color:'rgb(48, 145, 198)',
                width: 2
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
                maxZoom: 11
            })

        })

        geo_layer.getSource().on('change', () => {
            if(geo_layer.getSource().getState() == 'ready' && !this.loaded) {
                this.loaded = true
                var tmp_extent = extent.createEmpty()
                geo_layer.getSource().getFeatures().forEach(feature => {
                    tmp_extent = extent.extend(tmp_extent, feature.getGeometry().getExtent())
                    this.testValues[feature.get('name_2')] = Math.random() * 1000
                })
                this.map.getView().fit(tmp_extent, {
                    duration: 500
                })
                const limits = [-8.504015, -7.586928, 41.418811, 37.230650] //Portugal
            }
            console.table(this.testValues)
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
                document.body.style.cursor = "pointer"
                this.hoverPopup.innerHTML = feature.get('name_2')
                console.log(feature)
                this.hoverOverlay.setPosition(extent.getCenter(feature.getGeometry().getExtent()))
            } else {
                
            }
        })
    }

}
</script>

<style lang="scss" scope>

.ol-popup {
    pointer-events: none;
    z-index: 3332;
    position: absolute;
    background-color: white;
    text-align: center;
    -webkit-filter: drop-shadow(0 1px 4px rgba(0,0,0,0.2));
    filter: drop-shadow(0 1px 4px rgba(0,0,0,0.2));
    padding: .4rem .7rem;
    border-radius: 10px;
    font-weight: 700;
    white-space: nowrap;
    font-size: 1rem;
}

</style>
