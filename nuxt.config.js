import dotenv from 'dotenv'

dotenv.config()

export default {
  server: {
    host: '0.0.0.0',
    port: process.env.PORT || 3000
  },
  env: {
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
    '~/assets/css/utils.scss'
  ],
  plugins: [
    { src: '~/plugins/third-party', mode: 'client' },
    { src: '~/plugins/leafletGeosearch', mode: 'client' }
  ],
  components: true,
  buildModules: [
    '@nuxtjs/eslint-module',
  ],
  modules: [
    '@nuxtjs/axios',
    'nuxt-leaflet'
  ],
  axios: {},
  build: {
  }
}
