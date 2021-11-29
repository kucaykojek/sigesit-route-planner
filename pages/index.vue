<template>
  <div class="main-wrapper noselect">
    <header>Navbar</header>
    <aside>
      <div ref="routePlanner" class="route-planner">
        <div ref="routePlannerExpander" class="route-planner__expander" @touchstart="handleExpandPlanner()"></div>
        <div class="route-planner__list">
        <ul>
          <li>
            <div class="route-planner__icon start"><i class="fas fa-circle"></i></div>
            <div class="route-planner__card">
              <div class="font-weight-bold mb-4"><i class="fas fa-map-marker fg-branding-green mr-2"></i> Titik Awal</div>
              <div v-if="hasStartPoint" class="mt-2 text-xs">
                <div>{{ points.start.address }}</div>
                <button
                  type="button"
                  class="btn btn-block mt-2"
                  @click="clearPoint('start')"
                >
                  <i class="fas fa-edit fg-branding-green mr-2"></i> Ubah
                </button>
              </div>
              <div v-else-if="hasDraftPoint && pointOnEdit === 'start'" class="mt-2 text-xs">
                <div>{{ points.draft.address }}</div>
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
                  @click="createStartPoint(true)"
                >
                  <i class="fas fa-crosshairs fg-branding-green mr-2"></i> Lokasi Saya
                </button>
                <button
                  type="button"
                  class="btn btn-block mt-2"
                  @click="createStartPoint()"
                >
                  <i class="fas fa-map fg-branding-green mr-2"></i> Pilih Lewat Peta
                </button>
              </template>
            </div>
          </li>
          <li
            v-for="(job, jobIndex) in points.jobs"
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
                  @click="deleteJobPoint(jobIndex)"
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
                <i class="fas fa-map-marker fg-branding-red mr-2"></i> Titik #{{ points.jobs.length + 1 }}
              </div>
              <div v-if="hasDraftPoint && pointOnEdit === 'jobs'" class="mt-2 text-xs">
                <div>{{ points.draft.address }}</div>
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
                  @click="createJobPoint()"
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
                <div>{{ points.finish.address }}</div>
                <button
                  type="button"
                  class="btn btn-block mt-2"
                  @click="clearPoint('finish')"
                >
                  <i class="fas fa-edit fg-branding-blue mr-2"></i> Ubah
                </button>
              </div>
              <div v-else-if="hasDraftPoint && pointOnEdit === 'finish'" class="mt-2 text-xs">
                <div>{{ points.draft.address }}</div>
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
                  @click="createFinishPoint(true)"
                >
                  <i class="fas fa-copy fg-branding-blue mr-2"></i> Seperti Titik Awal
                </button>
                <button
                  type="button"
                  class="btn btn-block mt-2"
                  :disabled="!hasJobsPoint"
                  @click="createFinishPoint()"
                >
                  <i class="fas fa-map fg-branding-blue mr-2"></i> Pilih Lewat Peta
                </button>
              </template>
            </div>
          </li>
        </ul>
        </div>
      </div>
      <div class="route-monitor"></div>
    </aside>
    <main>
      <div class="map-wrapper">
        <client-only>
          <l-map
            ref="geolocationMap"
            :zoom="13"
            :center="map.center"
            :options="map.options"
            @click="handleMapClick($event)"
          >
            <l-tile-layer url="https://{s}.tile.osm.org/{z}/{x}/{y}.png"></l-tile-layer>
            <l-feature-group ref="geolocationGroup">
              <l-marker
                v-if="hasDraftPoint"
                :lat-lng="[points.draft.lat, points.draft.lng]"
              >
                <l-icon
                  :icon-size="marker.icon.dimension"
                  :icon-anchor="marker.icon.anchor"
                  :icon-url="points.draft.icon"
                />
              </l-marker>
              <l-marker
                v-if="hasStartPoint"
                :lat-lng="[points.start.lat, points.start.lng]"
              >
                <l-icon
                  :icon-size="marker.icon.dimension"
                  :icon-anchor="marker.icon.anchor"
                  icon-url="/marker-pin-start.svg"
                />
              </l-marker>
              <template v-for="(job, jobIndex) in points.jobs">
                <l-marker
                  :ref="`marker-${jobIndex}`"
                  :key="`job-marker-${jobIndex}`"
                  :lat-lng="[job.lat, job.lng]"
                >
                  <l-icon
                    :icon-size="marker.icon.dimension"
                    :icon-anchor="marker.icon.anchor"
                    :icon-url="job.icon"
                  />
                  <l-popup :options="marker.popup.options"><pre>{{ job }}</pre></l-popup>
                </l-marker>
              </template>
              <l-marker
                v-if="hasFinishPoint"
                :lat-lng="[points.finish.lat, points.finish.lng]"
              >
                <l-icon
                  :icon-size="marker.icon.dimension"
                  :icon-anchor="marker.icon.anchor"
                  icon-url="/marker-pin-finish.svg"
                />
              </l-marker>
            </l-feature-group>
            <l-control position="topright">
              <button
                type="button"
                class="btn"
                :disabled="!hasStartPoint || !hasFinishPoint || !hasJobsPoint"
                @click="handleGenerateRoute()"
              >Generate Route</button>
            </l-control>
            <l-polyline
              v-for="(line, lineIndex) in lines"
              :key="`route-line-${lineIndex}`"
              :lat-lngs="line"
              color="#B52125"
            ></l-polyline>
          </l-map>
        </client-only>
      </div>
    </main>
    <QrScanner v-if="isOpenQrScanner" @result="handleQrResult($event)" />
  </div>
</template>

<script>
import cloneDeep from 'lodash/cloneDeep'
import get from 'lodash/get'
import omit from 'lodash/omit'

export default {
  data() {
    return {
      map: {
        center: [-6.905304,107.630999],
        options: {
          zoomControl: false
        }
      },
      marker: {
        icon: {
          size: 30,
          dimension: [30, 30],
          anchor: [30 / 2, 30 * 1.15]
        },
        popup: {
          options: {
            closeButton: false
          }
        }
      },
      pointOnEdit: null,
      points: {
        draft: {
          id: null,
          type: null,
          lat: null,
          lng: null,
          accuracy: null,
          address: null,
          icon: null
        },
        start: {
          id: null,
          lat: null,
          lng: null,
          address: null,
        },
        jobs: [],
        finish: {
          id: null,
          lat: null,
          lng: null,
          address: null
        }
      },
      routes: [],
      markers: [],
      lines: [],
      gps: null,
      errorGps: null,
      isOpenQrScanner: false,
      isDraggingPlanner: false
    }
  },
  computed: {
    dynamicAnchor() {
      return [this.icon.size / 2, this.icon.size * 1.15];
    },
    hasDraftPoint() {
      return (!!this.points.draft.lat && !!this.points.draft.lng)
    },
    hasJobsPoint() {
      return this.points.jobs.length && this.points.jobs.every((job) => !!job.lat && !!job.lng)
    },
    hasStartPoint() {
      return (!!this.points.start.lat && !!this.points.start.lng)
    },
    hasFinishPoint() {
      return (!!this.points.finish.lat && !!this.points.finish.lng)
    }
  },
  mounted() {
    document.addEventListener('touchmove', this.handlePointerMove)
    document.addEventListener('touchend', this.handlePointerUp)
    document.addEventListener('touchcancel', this.handlePointerUp)
  },
  beforeDestroy() {
    document.removeEventListener('touchmove', this.handlePointerMove)
    document.removeEventListener('touchend', this.handlePointerUp)
    document.removeEventListener('touchcancel', this.handlePointerUp)
  },
  methods: {
    handlePointerMove(e) {
      if (this.isDraggingPlanner && get(e, 'touches[0]')) {
        this.handleResizePlanner(e.touches[0])
      }
    },
    handlePointerUp(e) {
      if (this.isDraggingPlanner) {
        this.isDraggingPlanner = false
      }
    },
    handleExpandPlanner() {
      this.isDraggingPlanner = true
    },
    handleResizePlanner(e) {
      if (this.$refs.routePlanner) {
        if (e.pageY > 70) {
          const height = (document.body.clientHeight - e.pageY) + 70
          if (height >= 240) {
            this.$refs.routePlanner.style.height = `${height}px`
          }
        }
      }
    },
    getCurrentLocation() {
      if (navigator.geolocation) {
        return new Promise(function(resolve, reject) {
          navigator.geolocation.getCurrentPosition(resolve, reject)
        })
      } else {
        throw new Error('Geolocation is not supported by this browser')
      }
    },
    async createStartPoint(withGps = false) {
      this.pointOnEdit = 'start'
      this.errorGps = null

      if (withGps) {
        try {
          const { coords } = await this.getCurrentLocation()
          if (coords) {
            this.map.center = [coords.latitude, coords.longitude]
            this.points.draft.id = new Date().getTime()
            this.points.draft.lat = coords.latitude
            this.points.draft.lng = coords.longitude
            this.points.draft.accuracy = Math.round(coords.accuracy / 1000)
            this.points.draft.icon = '/marker-pin-start.svg'

            const address = await this.searchAddress(`${coords.latitude},${coords.longitude}`)
            this.points.draft.address = get(address, 'label') || null

            if (get(this.$refs, 'geolocationMap.mapObject')) {
              this.$refs.geolocationMap.mapObject.setView([coords.latitude, coords.longitude], 13)
            }
          }
        } catch (error) {
          console.error('setStartPoint', error)
          this.errorGps = error.message
        }
      }
    },
    createJobPoint() {
      try {
        this.pointOnEdit = 'jobs'
      } catch (error) {
        console.error('setJobPoint', error)
      }
    },
    createFinishPoint(copyStart = false) {
      this.pointOnEdit = 'finish'

      if (copyStart) {
        this.points.finish = {
          ...cloneDeep(this.points.start),
          id: new Date().getTime()
        }
      }
    },
    deleteJobPoint(index) {
      this.points.jobs.splice(index, 1)
    },
    clearPoint(type = 'start') {
      this.points[type] = {
        lat: null,
        lng: null,
        accuracy: null,
        icon: null
      }
    },
    setPoint() {
      switch (this.pointOnEdit) {
        case 'start':
        case 'finish':
          this.points[this.pointOnEdit] = cloneDeep(omit(this.points.draft, ['type']))
          break
        default:
          this.points[this.pointOnEdit].push(cloneDeep(omit(this.points.draft, ['type'])))
          break
      }

      this.clearPoint('draft')
      this.pointOnEdit = null
    },
    getMarker() {
      switch (this.pointOnEdit) {
        case 'start':
          return '/marker-pin-start.svg'
        case 'finish':
          return '/marker-pin-finish.svg'
        default:
          return '/marker-pin.svg'
      }
    },
    openQrScanner() {
      try {
        this.pointOnEdit = 'jobs'
        this.isOpenQrScanner = true
      } catch (error) {
        console.error('setJobPoint', error)
      }
    },
    async handleMapClick(e) {
      if (!!this.pointOnEdit && e.latlng) {
        this.points.draft.id = new Date().getTime()
        this.points.draft.lat = e.latlng.lat
        this.points.draft.lng = e.latlng.lng
        this.points.draft.accuracy = 0
        this.points.draft.icon = this.getMarker()

        const address = await this.searchAddress(`${e.latlng.lat},${e.latlng.lng}`)
        this.points.draft.address = get(address, 'label') || null

        this.map.center = [e.latlng.lat, e.latlng.lng]
      }
    },
    async getOptimizeRoute() {
      try {
        const payload = {
          jobs: [
            { id: this.points.start.id, location: [this.points.start.lng, this.points.start.lat] },
            ...this.points.jobs.map((job) => {
              return {
                id: job.id,
                location: [job.lng, job.lat]
              }
            }),
            { id: this.points.finish.id, location: [this.points.finish.lng, this.points.finish.lat] }
          ],
          vehicles: [
            {
              id: 1,
              profile: 'driving-car',
              start: [this.points.start.lng, this.points.start.lat],
              end: [this.points.finish.lng, this.points.finish.lat]
            }
          ]
        }
        const headers = {
          'Authorization': process.env.ORS_API_KEY
        }
        const { data } = await this.$axios.post(
          `${ORS_API_URL}/optimization`,
          payload,
          { headers }
        )

        this.routes = Array.isArray(get(data, 'routes[0].steps'))
          ? get(data, 'routes[0].steps').filter(step => step.type === 'job')
          : []

      } catch (error) {
        console.error('getOptimizeRoute', error)
      }
    },
    async handleGenerateRoute() {
      try {
        await this.getOptimizeRoute()

        let before
        const promises = []
        this.routes.forEach((current) => {
          if (before) {
            const points = `${before.location.join(',')};${current.location.join(',')}`
            promises.push(this.$axios.get(`${OSRM_API_URL}/route/v1/driving/${points}?geometries=geojson`))
          }

          before = current
        })

        const responses = await Promise.all(promises)
        const routeLines = responses.map(val => val.data)
        this.lines = routeLines.map(line => {
          const coordinates = get(line, `routes[0].geometry.coordinates`)
          return coordinates
            ? coordinates.map(v => [v[1], v[0]])
            : []
        })
      } catch (error) {
        console.error('handleGenerateRoute', error)
      }
    },
    async searchAddress(search) {
      try {
        if (!this.isSearchingPlace && search) {
          this.isSearchingPlace = false
          const results = await this.$leafletGeosearch.provider.search({
            query: search
          })

          if (results && results.length) {
            const placeOptions = results.map(res => ({ ...res, id: res.raw.place_id, value: res.raw.place_id }))
            return placeOptions[0]
          } else {
            return null
          }
        }
      } catch (error) {
        console.error(error)
        return null
      } finally {
        this.isSearchingPlace = false
      }
    },
    async handleQrResult(e) {
      try {
        const data = JSON.parse(e)
        if (!!this.pointOnEdit && data.latitude && data.longitude) {
          this.points.draft.id = new Date().getTime()
          this.points.draft.lat = data.latitude
          this.points.draft.lng = data.longitude
          this.points.draft.accuracy = 0
          this.points.draft.icon = this.getMarker()

          const address = await this.searchAddress(`${data.latitude},${data.longitude}`)
          this.points.draft.address = get(address, 'label') || null

          this.map.center = [data.latitude, data.longitude]
        }

      } catch (error) {
        console.error(error)
      } finally {
        this.isOpenQrScanner = false
      }
    }
  }
}
</script>

<style>
.leaflet-popup {
  bottom: 30px !important;
}
</style>
