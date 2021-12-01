export default {
  server: {
    host: '0.0.0.0',
    port: process.env.PORT || 3000
  },
  publicRuntimeConfig: {
    GMAPS_API_KEY: process.env.GMAPS_API_KEY,
    ORS_API_URL: process.env.ORS_API_URL,
    ORS_API_KEY: process.env.ORS_API_KEY,
    OSRM_API_URL: process.env.OSRM_API_URL
  },
  head: {
    title: 'sigesit-route-planner',
    htmlAttrs: {
      lang: 'en'
    },
    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { hid: 'description', name: 'description', content: '' },
      { name: 'format-detection', content: 'telephone=no' }
    ],
    link: [
      { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
      { rel: 'stylesheet', href: '/css/reset.css' }
    ],
    script: [
      { src: 'https://kit.fontawesome.com/a65a63f334.js', crossorigin: 'anonymous' }
    ]
  },
  css: [
    '~/assets/css/base.scss',
    '~/assets/css/utils.scss',
    '~/assets/css/override.scss'
  ],
  plugins: [
    { src: '~/plugins/third-party', mode: 'client' },
    { src: '~/plugins/googleMaps', mode: 'client' },
    { src: '~/plugins/leafletGeosearch', mode: 'client' }
  ],
  components: true,
  buildModules: [
    '@nuxtjs/eslint-module',
  ],
  modules: [
    '@nuxtjs/axios',
    'nuxt-leaflet',
    'vue-sweetalert2/nuxt'
  ],
  build: {
    extend (config, { isDev, isClient }) {
      config.node = {
        fs: 'empty'
      }
    }
  },
  axios: {},
  sweetalert: {
    toast: true,
    position: 'top-end',
    showConfirmButton: false,
    timer: 3000
  }
}
