<template>
  <div ref="routePlan" :class="['route-plan', { 'is-confirmation': hasDraftPoint }]">
    <div v-if="!isDrafting && !hasRoutes">
      <ul class="route-plan__list">
        <li class="route-plan__list__item">
          <div class="route-plan__list__item__icon start"><i class="fas fa-circle"></i></div>
          <div class="route-plan__list__item__card start">
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
          class="route-plan__list__item"
        >
          <div class="route-plan__list__item__icon"><i class="fas fa-circle"></i></div>
          <div class="route-plan__list__item__card">
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
        <li v-if="!hasJobsPoint" ref="jobCard" class="route-plan__list__item">
          <div class="route-plan__list__item__icon"><i class="fas fa-circle"></i></div>
          <div class="route-plan__list__item__card">
            <div class="font-weight-bold mb-4">
              <i class="fas fa-map-marker fg-branding-red mr-2"></i> Titik-Titik Pengantaran
            </div>
            <button
              type="button"
              class="btn btn-block"
              :disabled="!hasStartPoint"
              @click="importJobPoints()"
            >
              <i class="fas fa-file-import fg-branding-red mr-2"></i> Import Dari Daftar Antar
            </button>
          </div>
        </li>
        <li v-if="showJobCard" ref="jobCard" class="route-plan__list__item">
          <div class="route-plan__list__item__icon"><i class="fas fa-circle"></i></div>
          <div class="route-plan__list__item__card">
            <div class="font-weight-bold mb-4">
              <i class="fas fa-map-marker fg-branding-red mr-2"></i> Titik #{{ pointJobs.length + 1 }}
            </div>
            <button
              type="button"
              class="btn btn-block"
              :disabled="!hasStartPoint"
              @click="$emit('open:qrscanner')"
            >
              <i class="fas fa-qrcode fg-branding-red mr-2"></i> Scan QR Code
            </button>
          </div>
        </li>
        <li v-if="hasJobsPoint" ref="addCard" class="route-plan__list__item">
          <div class="btn-group btn-group-block">
            <button
              type="button"
              class="btn"
              :disabled="showJobCard || !hasJobsPoint || (hasDraftPoint && draftType === 'jobs')"
              @click="setShowJobCard()"
            >
              <i class="fas fa-plus fg-branding-red mr-2"></i> Tambah Titik
            </button>
            <button
              v-if="!showFinishCard"
              type="button"
              class="btn btn-blue"
              :disabled="!hasJobsPoint || hasDraftPoint"
              @click="setShowFinishCard()"
            >
              <i class="fas fa-map-marker mr-2"></i> Titik Akhir
            </button>
          </div>
        </li>
        <li v-if="showFinishCard" ref="finishCard" class="route-plan__list__item">
          <div class="route-plan__list__item__icon finish"><i class="fas fa-circle"></i></div>
          <div class="route-plan__list__item__card finish">
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
        <li v-if="showFinishCard" class="route-plan__list__item">
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
    <div v-else>
      <div class="text-sm">{{ pointDraft.address }}</div>
      <button
        type="button"
        class="btn btn-block mt-4"
        :class="{
          'btn-green': draftType === 'start',
          'btn-blue': draftType === 'finish',
          'btn-red': draftType === 'jobs'
        }"
        @click="savePoint()"
      >
        <i class="fas fa-check mr-2"></i> Konfirmasi
      </button>
    </div>
  </div>
</template>

<script>
import get from 'lodash/get'
import { mapState, mapMutations, mapGetters } from 'vuex'

export default {
  name: 'RoutePlan',
  props: {
    mapId: {
      type: String,
      required: true
    }
  },
  computed: {
    ...mapState('points', [
      'points', 'pointDraft', 'selectedPointId', 'showJobCard', 'showFinishCard'
    ]),
    ...mapGetters('points', [
      'draftType', 'isDrafting', 'hasDraftPoint', 'pointJobs', 'pointStart', 'pointFinish', 'hasJobsPoint', 'hasStartPoint', 'hasFinishPoint'
    ]),
    ...mapGetters('routes', [
      'hasRoutes'
    ]),
    mapLibrary() {
      return this.$store.state.mapLibrary
    }
  },
  created() {
    this.$nuxt.$on('savePoint', () => {
      this.savePoint()
    })
  },
  methods: {
    ...mapMutations('points', [
      'setPointDraft', 'setPoints', 'setSelectedPointId'
    ]),
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
    async getLocationAddress({ lat, lng }) {
      try {
        const geocoder = new this.mapLibrary.Geocoder()
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
    setShowJobCard() {
      this.setShowJobCard(true)
      this.$nextTick(() => {
        setTimeout(() => {
          this.$refs.jobCard.scrollIntoView({
            behavior: 'smooth'
          })
        })
      })
    },
    setShowFinishCard() {
      this.setShowFinishCard(true)
      this.$nextTick(() => {
        setTimeout(() => {
          this.$refs.finishCard.scrollIntoView({
            behavior: 'smooth'
          })
        })
      })
    },
    async createPoint(type, data = null) {
      if (!this.hasDraftPoint) {
        this.setPointDraft({
          id: new Date().getTime(),
          type
        })
      }

      if (data) {
        const latLng = {
          lat: data.lat,
          lng: data.lng
        }

        const address = await this.getLocationAddress(latLng)
        this.setPointDraft({
          ...latLng,
          address
        })

        this.$nextTick(() => {
          this.$nuxt.$emit(`${this.mapId}:addMarker`, this.pointDraft)
        })
      }

      this.$nuxt.$emit(`${this.mapId}:addListener`, 'click', ($event) => {
        this.createPoint(type, $event)
      })
    },
    importJobPoints() {
      console.log('import')
    },
    savePoint() {
      this.$nuxt.$emit(`${this.mapId}:removeListener`, 'click')
      this.setPoints([this.pointDraft])
      this.setSelectedPointId(null)

      if (this.pointDraft.type === 'jobs') {
        this.setShowJobCard(false)
        this.$nextTick(() => {
          setTimeout(() => {
            if (this.$refs.finishCard) {
              this.$refs.finishCard.scrollIntoView({
                behavior: 'smooth'
              })
            } else if (this.$refs.addCard) {
              this.$refs.addCard.scrollIntoView({
                behavior: 'smooth'
              })
            }
          })
        })
      }

      if (this.pointDraft.type === 'start') {
        this.$nextTick(() => {
          setTimeout(() => {
            if (this.$refs.jobCard) {
              this.$refs.jobCard.scrollIntoView({
                behavior: 'smooth'
              })
            } else if (this.$refs.addCard) {
              this.$refs.addCard.scrollIntoView({
                behavior: 'smooth'
              })
            }
          })
        })
      }

      if (this.pointDraft.type === 'finish') {
        this.$nextTick(() => {
          setTimeout(() => {
            if (this.$refs.routePlan) {
              this.$refs.routePlan.scrollTo({
                top: this.$refs.routePlan.scrollHeight, behavior: 'smooth'
              })
            }
          })
        })
      }

      this.setPointDraft()
      this.$emit('save')
    },
    async generatePlan() {
      // await this.generateRoutes()
      // await this.generateLines()
    }
  }
}
</script>

<style lang="scss" scoped>
@import '~/assets/css/_variables';

.route-plan {
  position: relative;
  height: calc(100% + 3rem);
  margin: -1.5rem;
  padding: 1.5rem 1.5rem 0 calc(1.5rem + 7.5px);
  overflow: hidden;
  overflow-y: auto;

  &__list {
    min-height: 100%;
    border-left: 2px solid #ddd;
    padding-bottom: 30px;

    &__item {
      position: relative;
      display: flex;
      align-items: center;
      padding-left: 1.5rem;
      margin-bottom: 1rem;

      &:last-child {
        margin-bottom: 0;
      }

      &__icon {
        position: absolute;
        z-index: 1;
        width: 30px;
        height: 30px;
        text-align: center;
        border-radius: 50%;
        left: -15px;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-basis: 30px;
        flex-shrink: 0;
        font-size: 1.25rem;
        color: $color-branding-red;
        background-color: #fff;

        &.start {
          color: $color-branding-green;
        }

        &.finish {
          color: $color-branding-blue;
        }

        &::before {
          position: absolute;
          top: 0;
          left: -2px;
          width: 2px;
          height: 50%;
          background: #fff;
          content: "";
        }
      }

      &__card {
        flex-grow: 1;
        border: 1px solid #ddd;
        border-radius: .5rem;
        padding: 1rem;
        color: #333;

        &:hover {
          border-color: $color-branding-red;
          box-shadow: inset 0 0 0 1px $color-branding-red;
        }

        &.start {
          &:hover {
            border-color: $color-branding-green;
            box-shadow: inset 0 0 0 1px $color-branding-green;
          }
        }

        &.finish {
          &:hover {
            border-color: $color-branding-blue;
            box-shadow: inset 0 0 0 1px $color-branding-blue;
          }
        }
      }
    }
  }

  &.is-confirmation {
    padding: 1.5rem;
  }
}
</style>
