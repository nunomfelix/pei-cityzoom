importScripts('/_nuxt/workbox.4c4f5ca6.js')

workbox.precaching.precacheAndRoute([
  {
    "url": "/_nuxt/0657efb585db6a95f7e4.js",
    "revision": "7715953a5521b3170ce851e1cec8877b"
  },
  {
    "url": "/_nuxt/1c3b62436b8fb5544cb1.js",
    "revision": "e2024aaa2f510c9549f234380605fb4d"
  },
  {
    "url": "/_nuxt/367e9aea37e9dfefe770.js",
    "revision": "79722ff0563fb12fc58f648b238b45e8"
  },
  {
    "url": "/_nuxt/4d1a271f13ce4dff00ec.js",
    "revision": "3bf4c4b72a53d70955f20b45bcc2d58e"
  },
  {
    "url": "/_nuxt/7590c358a2cabb2335e4.js",
    "revision": "b4be8392583a0442db8c07dc575f697e"
  },
  {
    "url": "/_nuxt/901101c5d204b8ab3bff.js",
    "revision": "b08b7395928bf6ce505dec316afdaa27"
  },
  {
    "url": "/_nuxt/e0447f98915e3c3531cd.js",
    "revision": "0250b85d2cbd5c5ed2585e732a70e2c8"
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
