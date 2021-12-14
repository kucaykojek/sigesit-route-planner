<template>
  <div class="route-plan">
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
      <li v-if="showJobCard" ref="jobCard" class="route-plan__list__item">
        <div class="route-plan__list__item__icon"><i class="fas fa-circle"></i></div>
        <div class="route-plan__list__item__card">
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
              @click="toggleQrScanner()"
            >
              <i class="fas fa-qrcode fg-branding-red mr-2"></i> Scan QR Code
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
      <li v-if="hasStartPoint" ref="addCard" class="route-plan__list__item">
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
</template>

<script>
import { mapState, mapMutations, mapGetters } from 'vuex'

export default {
  name: 'RoutePlan',
  computed: {
    ...mapState('points', [
      'points', 'pointDraft', 'selectedPointId', 'showJobCard', 'showFinishCard'
    ]),
    ...mapGetters('points', [
      'draftType', 'isDrafting', 'hasDraftPoint', 'pointJobs', 'pointStart', 'pointFinish', 'hasJobsPoint', 'hasStartPoint', 'hasFinishPoint'
    ])
  },
  methods: {
    ...mapMutations('points', [
      'setPointDraft', 'setPoints'
    ])
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
}
</style>
