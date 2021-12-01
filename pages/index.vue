<template>
  <div class="main-wrapper noselect">
    <header>Navbar</header>
    <aside>
      <div v-if="!hasRoutes" ref="routePlanner" class="route-planner">
        <div ref="routePlannerExpander" class="route-planner__expander" @touchstart="handleExpandPlanner()"></div>
        <div class="route-planner__list">
          <ul>
            <li>
              <div class="route-planner__icon start"><i class="fas fa-circle"></i></div>
              <div class="route-planner__card">
                <div class="font-weight-bold mb-4"><i class="fas fa-map-marker fg-branding-green mr-2"></i> Titik Awal</div>
                <div v-if="hasStartPoint" class="mt-2 text-xs">
                  <div>{{ pointStart.address }}</div>
                  <button
                    type="button"
                    class="btn btn-block mt-2"
                    @click="updatePoint(pointStart)"
                  >
                    <i class="fas fa-edit fg-branding-green mr-2"></i> Ubah
                  </button>
                </div>
                <div v-else-if="hasDraftPoint && draftType === 'start'" class="mt-2 text-xs">
                  <div>{{ pointDraft.address }}</div>
                  <button
                    type="button"
                    class="btn btn-block mt-2"
                    @click="setPoint()"
                  >
                    <i class="fas fa-check fg-branding-green mr-2"></i> Konfirmasi
                  </button>
                </div>
                <template v-else>
                  <button
                    type="button"
                    class="btn btn-block"
                    @click="getCurrentLocation((coords) => createPoint('start', { lat: coords.latitude, lng: coords.longitude }))"
                  >
                    <i class="fas fa-crosshairs fg-branding-green mr-2"></i> Lokasi Saya
                  </button>
                  <button
                    type="button"
                    class="btn btn-block mt-2"
                    @click="createPoint('start')"
                  >
                    <i class="fas fa-map fg-branding-green mr-2"></i> Pilih Lewat Peta
                  </button>
                </template>
              </div>
            </li>
            <li
              v-for="(job, jobIndex) in pointJobs"
              :key="`card-jobs-${jobIndex}`"
            >
              <div class="route-planner__icon"><i class="fas fa-circle"></i></div>
              <div class="route-planner__card">
                <div class="font-weight-bold mb-4">
                  <i class="fas fa-map-marker fg-branding-red mr-2"></i> Titik #{{ jobIndex + 1 }}
                </div>
                <div class="mt-2 text-xs">
                  <div>{{ job.address }}</div>
                  <button
                    type="button"
                    class="btn btn-block mt-2"
                    @click="deletePoint(job.id)"
                  >
                    <i class="fas fa-trash fg-branding-red mr-2"></i> Hapus
                  </button>
                </div>
              </div>
            </li>
            <li>
              <div class="route-planner__icon"><i class="fas fa-circle"></i></div>
              <div class="route-planner__card">
                <div class="font-weight-bold mb-4">
                  <i class="fas fa-map-marker fg-branding-red mr-2"></i> Titik #{{ pointJobs.length + 1 }}
                </div>
                <div v-if="hasDraftPoint && draftType === 'jobs'" class="mt-2 text-xs">
                  <div>{{ pointDraft.address }}</div>
                  <button
                    type="button"
                    class="btn btn-block mt-2"
                    @click="setPoint()"
                  >
                    <i class="fas fa-check fg-branding-red mr-2"></i> Konfirmasi
                  </button>
                </div>
                <template v-else>
                  <button
                    type="button"
                    class="btn btn-block"
                    :disabled="!hasStartPoint"
                    @click="openQrScanner()"
                  >
                    <i class="fas fa-qrcode fg-branding-red mr-2"></i> Pilih Lewat Scan QR
                  </button>
                  <button
                    type="button"
                    class="btn btn-block mt-2"
                    :disabled="!hasStartPoint"
                    @click="createPoint('jobs')"
                  >
                    <i class="fas fa-map fg-branding-red mr-2"></i> Pilih Lewat Peta
                  </button>
                </template>
              </div>
            </li>
            <li>
              <div class="route-planner__icon finish"><i class="fas fa-circle"></i></div>
              <div class="route-planner__card">
                <div class="font-weight-bold mb-4"><i class="fas fa-map-marker fg-branding-blue mr-2"></i> Titik Akhir</div>
                <div v-if="hasFinishPoint" class="mt-2 text-xs">
                  <div>{{ pointFinish.address }}</div>
                  <button
                    type="button"
                    class="btn btn-block mt-2"
                    @click="updatePoint(pointFinish)"
                  >
                    <i class="fas fa-edit fg-branding-blue mr-2"></i> Ubah
                  </button>
                </div>
                <div v-else-if="hasDraftPoint && draftType === 'finish'" class="mt-2 text-xs">
                  <div>{{ pointDraft.address }}</div>
                  <button
                    type="button"
                    class="btn btn-block mt-2"
                    @click="setPoint()"
                  >
                    <i class="fas fa-check fg-branding-blue mr-2"></i> Konfirmasi
                  </button>
                </div>
                <template v-else>
                  <button
                    type="button"
                    class="btn btn-block"
                    :disabled="!hasJobsPoint"
                    @click="createPoint('finish', { lat: pointStart.lat, lng: pointStart.lng })"
                  >
                    <i class="fas fa-copy fg-branding-blue mr-2"></i> Seperti Titik Awal
                  </button>
                  <button
                    type="button"
                    class="btn btn-block mt-2"
                    :disabled="!hasJobsPoint"
                    @click="createPoint('finish')"
                  >
                    <i class="fas fa-map fg-branding-blue mr-2"></i> Pilih Lewat Peta
                  </button>
                </template>
              </div>
            </li>
            <li>
              <button
                type="button"
                class="btn btn-block btn-blue"
                :disabled="!hasStartPoint || !hasFinishPoint || !hasJobsPoint"
                @click="generateRoutes()"
              >
                <i class="fas fa-route mr-2"></i> Tampilkan Rute Perjalanan
              </button>
            </li>
          </ul>
        </div>
      </div>
      <div v-else ref="routeResult" class="route-result">
        <div class="route-result__list">
          <ul>
            <li
              v-for="(route, routeIndex) in routes"
              :key="`route-result-${routeIndex}`"
            >
              <div v-if="routeIndex > 0" class="route-result__distance">{{ formatDistance(route.distance - routes[routeIndex - 1].distance) }}</div>
              <div
                class="route-result__icon"
                :class="{
                  'start': routeIndex === 0,
                  'finish': routeIndex === routes.length - 1
                }"
              ><i class="fas fa-circle"></i></div>
              <div class="route-result__card text-sm">
                <div class="font-weight-bold mb-1 text-xs">
                  <span v-if="getPointById(route.id).type === 'start'">Titik Awal</span>
                  <span v-else-if="getPointById(route.id).type === 'finish'">Titik Akhir</span>
                  <span v-else>Titik #{{ getPointJobIndexById(route.id) + 1 }}</span>
                </div>

                {{ getPointById(route.id).address }}
              </div>
            </li>
            <li>
              <button
                type="button"
                class="btn btn-block btn-blue"
                @click="routes = []"
              >
                <i class="fas fa-edit mr-2"></i> Ubah Perjalanan
              </button>
            </li>
          </ul>
        </div>
      </div>
    </aside>
    <main>
      <div class="map-wrapper">
        <client-only>
          <div id="geolocationMap" ref="geolocationMap" style="height: 100%"></div>
        </client-only>
      </div>
    </main>
  </div>
</template>

<script>
import get from 'lodash/get'

import { formatNumber } from '~/helpers/formatter'

export default {
  data() {
    return {
      gmaps: null,
      map: null,
      pointDraft: {
        id: null,
        type: null,
        lat: null,
        lng: null,
        address: null
      },
      points: [],
      routes: [],
      clickListener: null,
      selectedPointId: null
    }
  },
  computed: {
    hasRoutes() {
      return this.routes.length > 0
    },
    draftType() {
      return this.pointDraft.type
    },
    hasDraftPoint() {
      return (!!this.pointDraft.type && !!this.pointDraft.lat && !!this.pointDraft.lng)
    },
    pointJobs() {
      return this.points.filter(point => point.type === 'jobs')
    },
    pointStart() {
      return this.points.find(point => point.type === 'start') || {}
    },
    pointFinish() {
      return this.points.find(point => point.type === 'finish') || {}
    },
    hasJobsPoint() {
      return this.pointJobs.length > 0
    },
    hasStartPoint() {
      return Object.keys(this.pointStart).length > 0
    },
    hasFinishPoint() {
      return Object.keys(this.pointFinish).length > 0
    }
  },
  mounted() {
    // document.addEventListener('touchmove', this.handlePointerMove)
    // document.addEventListener('touchend', this.handlePointerUp)
    // document.addEventListener('touchcancel', this.handlePointerUp)

    this.loadMap()
  },
  beforeDestroy() {
    // document.removeEventListener('touchmove', this.handlePointerMove)
    // document.removeEventListener('touchend', this.handlePointerUp)
    // document.removeEventListener('touchcancel', this.handlePointerUp)
  },
  methods: {
    loadMap() {
      this.$gmaps.loader.load().then((google) => {
        // console.log(e)
        this.gmaps = google.maps
        this.map = new this.gmaps.Map(document.getElementById('geolocationMap'), {
          center: { lat: -6.905304, lng: 107.630999 },
          zoom: 13,
          disableDefaultUI: true,
          styles: [{
            featureType: 'poi',
            elementType: 'labels',
            stylers: [
              { visibility: 'off' }
            ]
          }]
        })
      })
    },
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
    async getAddress({ lat, lng }) {
      try {
        const geocoder = new this.gmaps.Geocoder()
        const { results } = await geocoder.geocode({ location: { lat, lng } })

        return get(results, '[0].formatted_address') || ''
      } catch (error) {
        this.$swal({
          icon: 'error',
          title: 'Error',
          text: 'Gagal mendapatkan alamat lokasi'
        })

        return ''
      }
    },
    async addMarker({ lat, lng, type, address }) {
      try {
        if (this.pointDraft.marker) {
          await this.removeMarker(this.pointDraft.marker)
        }

        const marker = new this.gmaps.Marker({
          position: new this.gmaps.LatLng(lat, lng),
          title: address,
          icon: `/marker-pin-${type}.svg`
        })

        await marker.setMap(this.map)
        this.map.setCenter(marker.getPosition())
        this.map.setZoom(17)

        return marker
      } catch (error) {
        this.$swal({
          icon: 'error',
          title: 'Error',
          text: 'Gagal menambahkan titik lokasi'
        })

        return null
      }
    },
    removeMarker(marker) {
      marker.setMap(null)
    },
    createPoint(type, data = null) {
      this.pointDraft.id = new Date().getTime()
      this.pointDraft.type = type

      if (data) {
        const params = {
          lat: data.lat,
          lng: data.lng,
          type
        }

        this.setDraftPoint(params)
      }

      if (!this.clickListener) {
        this.map.setOptions({ draggableCursor: 'crosshair' })
        this.clickListener = this.gmaps.event.addListener(this.map, 'click', (event) => {
          const position = event.latLng.toJSON()
          const params = {
            lat: position.lat,
            lng: position.lng,
            type
          }

          this.setDraftPoint(params)
        })
      }
    },
    updatePoint(point) {
      const index = this.points.findIndex(p => p.id === point.id)

      if (index > -1) {
        this.points.splice(index, 1)

        this.selectedPointId = point.id
        this.pointDraft = { ...point }

        if (!this.clickListener) {
          this.map.setOptions({ draggableCursor: 'crosshair' })
          this.clickListener = this.gmaps.event.addListener(this.map, 'click', (event) => {
            const position = event.latLng.toJSON()
            const params = {
              lat: position.lat,
              lng: position.lng,
              type: this.pointDraft.type
            }

            this.setDraftPoint(params)
          })
        }
      }
    },
    deletePoint(pointId) {
      const index = this.points.findIndex(p => p.id === pointId)

      if (index > -1) {
        if (this.points[index].marker) {
          this.removeMarker(this.points[index].marker)
        }

        this.points.splice(index, 1)
      }
    },
    setPoint() {
      this.points.push({ ...this.pointDraft })
      this.map.setOptions({ draggableCursor: '' })
      this.gmaps.event.clearListeners(this.map, 'click')
      this.clickListener = null
      this.selectedPointId = null
      this.pointDraft = {
        id: null,
        type: null,
        lat: null,
        lng: null,
        address: null
      }
    },
    async setDraftPoint(params) {
      this.pointDraft.lat = params.lat
      this.pointDraft.lng = params.lng
      this.pointDraft.address = await this.getAddress(params)
      this.pointDraft.marker = await this.addMarker({ ...params, address: this.pointDraft.address })
    },
    async generateRoutes() {
      this.routes = []
      try {
        const payload = {
          jobs: [
            ...this.points.map((point) => {
              return {
                id: point.id,
                location: [point.lng, point.lat]
              }
            })
          ],
          vehicles: [
            {
              id: 1,
              profile: 'driving-car',
              start: [this.pointStart.lng, this.pointStart.lat],
              end: [this.pointFinish.lng, this.pointFinish.lat]
            }
          ],
          options: {
            g: true
          }
        }
        const headers = {
          'Authorization': this.$config.ORS_API_KEY
        }
        const { data } = await this.$axios.post(
          `${this.$config.ORS_API_URL}/optimization`,
          payload,
          { headers }
        )

        console.log(data)

        this.routes = Array.isArray(get(data, 'routes[0].steps'))
          ? get(data, 'routes[0].steps').filter(step => step.type === 'job')
          : []
      } catch (error) {
        this.$swal({
          icon: 'error',
          title: 'Error',
          text: error.message
        })
      }
    },
    async drawRoutes() {
      // generateOptimizeRoutes
    },
    formatDistance(distance) {
      return formatNumber((distance / 1000), '0.00') + 'KM'
    },
    getPointById(id) {
      return this.points.find(point => point.id === id) || {}
    },
    getPointJobIndexById(id) {
      const jobs = this.points.filter(point => point.type === 'jobs')
      return jobs.findIndex(point => point.id === id)
    }
  }
}
</script>

<style>
.leaflet-popup {
  bottom: 30px !important;
}
</style>
