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
                <div v-if="hasStartPoint" class="mt-2 text-sm">
                  <div>{{ pointStart.address }}</div>
                  <button
                    type="button"
                    class="btn btn-block mt-2"
                    @click="updatePoint(pointStart)"
                  >
                    <i class="fas fa-edit fg-branding-green mr-2"></i> Ubah
                  </button>
                </div>
                <div v-else-if="hasDraftPoint && draftType === 'start'" class="mt-2 text-sm">
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
                <div class="mt-2 text-sm">
                  <div>{{ job.address }}</div>
                  <div class="btn-group btn-group-block mt-2">
                    <button
                      type="button"
                      class="btn"
                      @click="updatePoint(job)"
                    >
                      <i class="fas fa-edit fg-branding-red mr-2"></i> Ubah
                    </button>
                    <button
                      type="button"
                      class="btn btn-red"
                      @click="deletePoint(job.id)"
                    >
                      <i class="fas fa-trash mr-2"></i> Hapus
                    </button>
                  </div>
                </div>
              </div>
            </li>
            <li v-if="showJobCard">
              <div class="route-planner__icon"><i class="fas fa-circle"></i></div>
              <div class="route-planner__card">
                <div class="font-weight-bold mb-4">
                  <i class="fas fa-map-marker fg-branding-red mr-2"></i> Titik #{{ pointJobs.length + 1 }}
                </div>
                <div v-if="hasDraftPoint && draftType === 'jobs'" class="mt-2 text-sm">
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
            <li v-if="hasStartPoint">
              <div class="btn-group btn-group-block">
                <button
                  type="button"
                  class="btn"
                  :disabled="showJobCard || !hasJobsPoint || (hasDraftPoint && draftType === 'jobs')"
                  @click="showJobCard = true"
                >
                  <i class="fas fa-plus fg-branding-red mr-2"></i> Tambah Titik
                </button>
                <button
                  v-if="!showFinishCard"
                  type="button"
                  class="btn btn-blue"
                  :disabled="!hasJobsPoint || hasDraftPoint"
                  @click="showFinishCard = true"
                >
                  <i class="fas fa-map-marker mr-2"></i> Titik Akhir
                </button>
              </div>
            </li>
            <li v-if="showFinishCard">
              <div class="route-planner__icon finish"><i class="fas fa-circle"></i></div>
              <div class="route-planner__card">
                <div class="font-weight-bold mb-4"><i class="fas fa-map-marker fg-branding-blue mr-2"></i> Titik Akhir</div>
                <div v-if="hasFinishPoint" class="mt-2 text-sm">
                  <div>{{ pointFinish.address }}</div>
                  <button
                    type="button"
                    class="btn btn-block mt-2"
                    @click="updatePoint(pointFinish)"
                  >
                    <i class="fas fa-edit fg-branding-blue mr-2"></i> Ubah
                  </button>
                </div>
                <div v-else-if="hasDraftPoint && draftType === 'finish'" class="mt-2 text-sm">
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
            <li v-if="showFinishCard">
              <button
                type="button"
                class="btn btn-block btn-blue"
                :disabled="!hasStartPoint || !hasFinishPoint || !hasJobsPoint || hasDraftPoint"
                @click="generatePlan()"
              >
                <i class="fas fa-route mr-2"></i> Rute Perjalanan
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
                @click="updatePlan()"
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
          <div id="geolocationMap" ref="geolocationMap"></div>
        </client-only>
      </div>
    </main>
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
  mixins: [gmapsMixins, lineMixins, pointMixins, routeMixins],
  data() {
    return {
      map: null,
      lines: [],
      mapClickListener: null,
      isDraggingPlanner: false
    }
  },
  mounted() {
    document.addEventListener('touchmove', this.handlePointerMove)
    document.addEventListener('touchend', this.handlePointerUp)
    document.addEventListener('touchcancel', this.handlePointerUp)

    this.loadMap()
  },
  beforeDestroy() {
    document.removeEventListener('touchmove', this.handlePointerMove)
    document.removeEventListener('touchend', this.handlePointerUp)
    document.removeEventListener('touchcancel', this.handlePointerUp)
  },
  methods: {
    handleExpandPlanner() {
      this.isDraggingPlanner = true
    },
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
    handleResizePlanner(e) {
      if (this.$refs.routePlanner) {
        if (e.pageY > 70) {
          const height = (document.body.clientHeight - e.pageY) + 70
          if (height >= 240) {
            this.$refs.routePlanner.style.height = `${height}px`
            this.$refs.geolocationMap.style.height = `${(document.body.clientHeight - height) + 30}px`
          }
        }
      }
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
    openQrScanner() {}
  }
}
</script>
