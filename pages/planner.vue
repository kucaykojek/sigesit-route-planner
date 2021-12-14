<template>
  <div class="main-wrapper noselect">
    <aside v-if="!isShowingQrScanner && !isDrafting">
      <CommonSheet v-if="!hasRoutes" :is-expandable="true" name="sheetPlanner">
        <RoutePlan />
      </CommonSheet>
      <div v-else-if="!isShowingMap" ref="routeResult" class="route-result">
        <div class="route-result__list">
          <ul>
            <li
              v-for="(route, routeIndex) in routes"
              :key="`route-result-${routeIndex}`"
              :class="{
                'mb-6': routeIndex === routes.length - 1
              }"
            >
              <div v-if="routeIndex > 0" class="route-result__distance text-xs">
                {{ formatDistance(route.distance - routes[routeIndex - 1].distance) }}
                <span class="fg-gray font-weight-normal">(±{{ formatDuration(route.duration - routes[routeIndex - 1].duration) }})</span>
              </div>
              <div
                class="route-result__icon"
                :class="{
                  'start': routeIndex === 0,
                  'finish': routeIndex === routes.length - 1
                }"
              ><i class="fas fa-circle"></i></div>
              <a
                class="route-result__card text-sm"
                :class="{
                  'start': routeIndex === 0,
                  'finish': routeIndex === routes.length - 1
                }"
                @click="toggleMap(getPointById(route.id))"
              >
                <div class="font-weight-bold mb-1 text-xs">
                  <span v-if="getPointById(route.id).type === 'start'">Titik Awal</span>
                  <span v-else-if="getPointById(route.id).type === 'finish'">Titik Akhir</span>
                  <span v-else>Titik #{{ getPointJobIndexById(route.id) + 1 }}</span>
                </div>

                {{ getPointById(route.id).address }}
              </a>
            </li>
          </ul>
        </div>
      </div>
    </aside>
    <main v-show="!isShowingQrScanner || isShowingMap" :class="{ 'is-full': isDrafting || isShowingMap }">
      <div class="map-wrapper">
        <div v-if="mapMasking" class="map-masking">
          <div class="map-masking__content">{{ mapMasking }}</div>
        </div>
        <client-only>
          <div id="geolocationMap" ref="geolocationMap"></div>
        </client-only>
      </div>
    </main>
    <qr-scanner v-if="isShowingQrScanner" @result="handleQrResult($event)" />
    <transition name="slide">
      <section
        v-if="hasDraftPoint"
        class="sheet text-sm"
      >
        <div>{{ pointDraft.address }}</div>
        <button
          type="button"
          class="btn btn-block mt-4"
          :class="{
            'btn-green': draftType === 'start',
            'btn-blue': draftType === 'finish',
            'btn-red': draftType === 'jobs'
          }"
          @click="setPoint()"
        >
          <i class="fas fa-check mr-2"></i> Konfirmasi
        </button>
      </section>
    </transition>
    <footer v-if="hasRoutes && !isShowingMap">
      <div class="btn-group btn-group-block">
        <button
          type="button"
          class="btn"
          @click="updatePlan()"
        >
          <i class="fas fa-edit fg-branding-red mr-2"></i> Ubah Perjalanan
        </button>
        <button
          type="button"
          class="btn btn-red"
          @click="toggleMap()"
        >
          <i class="fas fa-map-marker mr-2"></i> Lihat Peta
        </button>
      </div>
    </footer>
  </div>
</template>

<script>
import get from 'lodash/get'

import { formatNumber } from '~/helpers/formatter'
import gmapsMixins from '~/mixins/gmaps'
import lineMixins from '~/mixins/lines'
import pointMixins from '~/mixins/points'
import routeMixins from '~/mixins/routes'

export default {
  name: 'PagePlanner',
  mixins: [gmapsMixins, lineMixins, pointMixins, routeMixins],
  layout: 'planner',
  data() {
    return {
      map: null,
      lines: [],
      mapClickListener: null,
      isDraggingPlanner: false,
      isShowingQrScanner: false,
      isShowingMap: false
    }
  },
  computed: {
    mapMasking() {
      let masking = ''
      if (!this.isDrafting) {
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
  mounted() {
    this.loadMap()
  },
  methods: {
    async getCurrentLocation(callback) {
      if (navigator.geolocation) {
        const { coords } = await new Promise(function(resolve, reject) {
          navigator.geolocation.getCurrentPosition(resolve, reject)
        })

        callback(coords)
      } else {
        this.$swal({
          icon: 'error',
          title: 'Error',
          text: 'Geolocation tidak didukung oleh browser ini'
        })
      }
    },
    async generatePlan() {
      await this.generateRoutes()
      await this.generateLines()
    },
    updatePlan() {
      this.deleteRoutes()
      this.deleteLines()
    },
    formatDistance(distance) {
      return formatNumber((distance / 1000), '0.00') + 'KM'
    },
    formatDuration(duration) {
      return formatNumber((duration / 60), '0') + ' menit'
    },
    toggleQrScanner() {
      if (this.isShowingQrScanner) {
        this.isShowingQrScanner = false
        this.header.nav.icon = 'fas fa-chevron-left fg-branding-red'
        this.header.nav.action = () => {}
        this.header.title = 'Rencana Perjalanan'
      } else {
        this.isShowingQrScanner = true
        this.header.nav.icon = 'fas fa-times fg-gray'
        this.header.nav.action = () => this.toggleQrScanner()
        this.header.title = 'Batal'
      }
    },
    setShowJobCard() {
      this.showJobCard = true
      this.$nextTick(() => {
        setTimeout(() => {
          this.$refs.jobCard.scrollIntoView({
            behavior: 'smooth'
          })
        })
      })
    },
    setShowFinishCard() {
      this.showFinishCard = true
      this.$nextTick(() => {
        setTimeout(() => {
          this.$refs.finishCard.scrollIntoView({
            behavior: 'smooth'
          })
        })
      })
    },
    handleQrResult(e) {
      try {
        const data =  JSON.parse(e)
        if (get(data, 'latitude') && get(data, 'longitude')) {
          this.createPoint('jobs', {
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
    toggleMap(data = {}) {
      if (this.isShowingMap) {
        this.isShowingMap = false
        this.header.nav.icon = 'fas fa-chevron-left fg-branding-red'
        this.header.nav.action = () => {}
        this.header.title = 'Rencana Perjalanan'
      } else {
        this.isShowingMap = true
        this.header.nav.icon = 'fas fa-times fg-gray'
        this.header.nav.action = () => this.toggleMap()
        this.header.title = 'Tutup Peta'

        if (get(data, 'marker') && get(data, 'infowindow')) {
          this.toggleInfoWindow(get(data, 'marker'), get(data, 'infowindow'))
        } else {
          this.setBounds()
        }
      }
    }
  }
}
</script>
