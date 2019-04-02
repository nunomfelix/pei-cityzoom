importScripts('/_nuxt/workbox.4c4f5ca6.js')

workbox.precaching.precacheAndRoute([
  {
    "url": "/_nuxt/09c4ecdc4b69be88d931.js",
    "revision": "03af55fc199ea872b236cce2bc482df8"
  },
  {
    "url": "/_nuxt/1f3f1c055d819994f51c.js",
    "revision": "066727791e0e11fbbc7d6cf1f378ff46"
  },
  {
    "url": "/_nuxt/4805c4899a0a9e9f5f83.js",
    "revision": "e8cb7e825f0dc38615c66e35d0c56a09"
  },
  {
    "url": "/_nuxt/55cfd0dc14c17c1214bf.js",
    "revision": "f5f4343263cc49d0525ddd8d0c295bdd"
  },
  {
    "url": "/_nuxt/92fd858a85ca78078825.js",
    "revision": "accb1ad1236bb888e70e6bcd6415eee0"
  },
  {
    "url": "/_nuxt/b9228a908e0aafb18c5e.js",
    "revision": "e49922b0316b0e2e3815b6c0a0c47fe0"
  },
  {
    "url": "/_nuxt/de1a7648f994d1e80898.js",
    "revision": "6c233b3c6297252997df83165a01965f"
  }
], {
  "cacheId": "cityzoom-nuxt",
  "directoryIndex": "/",
  "cleanUrls": false
})

workbox.clientsClaim()
workbox.skipWaiting()

workbox.routing.registerRoute(new RegExp('/_nuxt/.*'), workbox.strategies.cacheFirst({}), 'GET')

workbox.routing.registerRoute(new RegExp('/.*'), workbox.strategies.networkFirst({}), 'GET')
