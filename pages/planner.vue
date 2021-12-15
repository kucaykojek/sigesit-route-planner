<template>
  <div class="main-wrapper noselect">
    <aside v-if="!isShowingQrScanner">
      <transition name="slide">
        <!-- Route Plan -->
        <CommonSheet
          v-if="(!isDrafting && !hasRoutes) || hasDraftPoint"
          :ref="!isDrafting && !hasRoutes ? 'sheetPlanner' : 'sheetConfirmation'"
          :name="!isDrafting && !hasRoutes ? 'sheetPlanner' : 'sheetConfirmation'"
          :is-expandable="!isDrafting && !hasRoutes"
          @resizing="resizeMap($event)"
        >
          <RoutePlan :map-id="mapId" @open:qrscanner="toggleQrScanner()" />
        </CommonSheet>

        <!-- Route Result -->
        <RouteResult v-else-if="!isDrafting && !isShowingMap && !isLoadingRoute" :map-id="mapId" @open:map="toggleMap($event)" />
      </transition>
    </aside>
    <main v-show="!isShowingQrScanner || isShowingMap">
      <div class="map-wrapper">
        <div v-if="mapMasking" class="map-masking">
          <div class="map-masking__content">{{ mapMasking }}</div>
        </div>
        <client-only>
          <a v-if="!mapMasking" class="map-gps" @click="getRealtimeLocation(true)">
            <i class="fas fa-crosshairs"></i>
          </a>
          <div :id="mapId" :ref="mapId" :class="['map-element', { 'is-full-height': isDrafting || isShowingMap }]"></div>
        </client-only>
      </div>
    </main>
    <QrScanner v-if="isShowingQrScanner" @result="handleQrResult($event)" />
  </div>
</template>

<script>
import get from 'lodash/get'
import { mapState, mapGetters } from 'vuex'

import mapsMixins from '~/mixins/maps'

export default {
  name: 'PagePlanner',
  mixins: [mapsMixins],
  layout: 'planner',
  data() {
    return {
      mapId: 'mapPlanner',
      mapClickListener: null,
      isShowingMap: false,
      isShowingQrScanner: false
    }
  },
  computed: {
    ...mapState('points', ['points', 'pointDraft', 'showJobCard', 'showFinishCard']),
    ...mapGetters('points', [
      'draftType', 'isDrafting', 'hasDraftPoint', 'hasJobsPoint', 'hasStartPoint', 'hasFinishPoint'
    ]),
    ...mapGetters('routes', ['hasRoutes']),
    mapMasking() {
      let masking = ''
      if (!this.isDrafting && !this.hasRoutes) {
        if (!this.hasStartPoint) {
          masking = 'Silakan klik tombol Lokasi Saya atau tombol Pilih Lewat Peta'
        } else if (this.showJobCard) {
          masking = 'Silakan klik tombol Scan QR Code atau tombol Pilih Lewat Peta'
        } else if (!this.hasFinishPoint && this.showFinishCard) {
          masking = 'Silakan klik tombol Seperti Titik Awal atau tombol Pilih Lewat Peta'
        }
      }

      return masking
    }
  },
  created() {
    this.$nuxt.$on(`${this.mapId}:loaded`, () => {
      this.resizeMap()
    })
  },
  mounted() {
    this.loadMap()
  },
  methods: {
    resizeMap(sheetPlannerHeight) {
      if (document) {
        if (sheetPlannerHeight) {
          this.$refs[this.mapId].style.height = `${(document.body.clientHeight - sheetPlannerHeight) + 30}px`
        } else if (get(this.$refs, 'sheetPlanner.$el')) {
          this.$refs[this.mapId].style.height = `${(document.body.clientHeight - this.$refs.sheetPlanner.$el.offsetHeight) + 30}px`
        }
      }
    },
    handleQrResult(e) {
      try {
        const data =  JSON.parse(e)
        if (get(data, 'latitude') && get(data, 'longitude')) {
          this.createPoint('jobs', {
            customer_name: get(data, 'name'),
            shipment_number: get(data, 'shipment_number'),
            address: get(data, 'address'),
            lat: get(data, 'latitude'),
            lng: get(data, 'longitude')
          })
        } else {
          this.$swal({
            icon: 'error',
            title: 'Error',
            text: 'Gagal membaca QR code'
          })
        }
      } catch (error) {
        this.$swal({
          icon: 'error',
          title: 'Error',
          text: 'Gagal membaca QR code'
        })
      }
    },
    toggleQrScanner() {
      if (this.isShowingQrScanner) {
        this.isShowingQrScanner = false
        this.$store.commit('setHeader', {
          nav: {
            icon: 'fas fa-chevron-left fg-branding-red',
            action: () => {}
          },
          title: 'Rencana Perjalanan'
        })
      } else {
        this.isShowingQrScanner = true
        this.$store.commit('setHeader', {
          nav: {
            icon: 'fas fa-times fg-gray',
            action: () => this.toggleQrScanner()
          },
          title: 'Tutup QR Scanner'
        })
      }
    },
    toggleMap(data = {}) {
      if (this.isShowingMap) {
        this.isShowingMap = false
        this.$store.commit('setHeader', {
          nav: {
            icon: 'fas fa-chevron-left fg-branding-red',
            action: () => {}
          },
          title: 'Rencana Perjalanan'
        })
      } else {
        this.isShowingMap = true
        this.$store.commit('setHeader', {
          nav: {
            icon: 'fas fa-times fg-gray',
            action: () => this.toggleMap()
          },
          title: 'Tutup Peta'
        })

        if (get(data, 'id')) {
          this.$nuxt.$emit(`${this.mapId}:toggleMarkerPopup`, get(data, 'id'))
        } else {
          this.$nuxt.$emit(`${this.mapId}:setBound`, this.points)
        }
      }
    }
  }
}
</script>
