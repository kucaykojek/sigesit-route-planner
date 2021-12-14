<template>
  <div class="route-result">
    <ul class="route-result__list">
      <li
        v-for="(route, routeIndex) in routes"
        :key="`route-result-${routeIndex}`"
        :class="[
          'route-result__list__item',
          {
            'mb-6': routeIndex === routes.length - 1
          }
        ]"
      >
        <div v-if="routeIndex > 0" class="route-result__list__item__distance text-xs">
          {{ formatDistance(route.distance - routes[routeIndex - 1].distance) }}
          <span class="fg-gray font-weight-normal">(±{{ formatDuration(route.duration - routes[routeIndex - 1].duration) }})</span>
        </div>
        <div
          class="route-result__list__item__icon"
          :class="{
            'start': routeIndex === 0,
            'finish': routeIndex === routes.length - 1
          }"
        ><i class="fas fa-circle"></i></div>
        <a
          class="route-result__list__item__card text-sm"
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
    <div class="route-result__footer">
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
          @click="$emit('open:map')"
        >
          <i class="fas fa-map-marker mr-2"></i> Lihat Peta
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState, mapMutations, mapGetters } from 'vuex'

import { formatNumber } from '~/helpers/formatter'

export default {
  name: 'RouteResult',
  computed: {
    ...mapState('routes', ['routes', 'lines']),
    ...mapGetters('routes', ['hasRoutes'])
  },
  methods: {
    ...mapGetters('points', ['getPointById', 'getPointJobIndexById']),
    ...mapMutations('routes', ['setRoutes', 'setLines']),
    formatDistance(distance) {
      return formatNumber((distance / 1000), '0.00') + 'KM'
    },
    formatDuration(duration) {
      return formatNumber((duration / 60), '0') + ' menit'
    },
    updatePlan() {
      // this.deleteRoutes()
      // this.deleteLines()
    }
  }
}
</script>

<style lang="scss" scoped>
@import '~/assets/css/_variables';

.route-result {
  position: relative;
  height: calc(100vh - #{$header-height * 2}) !important;
  margin-top: $header-height;
  margin-bottom: $header-height;
  padding: 1.5rem 1.5rem 0 calc(1.5rem + 7.5px);
  overflow: hidden;
  overflow-y: auto;
  background: #fff;

  &__list {
    min-height: 100%;
    border-left: 2px solid #ddd;
    padding: 1.5rem 0;

    &__item {
      position: relative;
      display: flex;
      align-items: center;
      padding-left: 1.5rem;
      margin-bottom: 3rem;

      &:last-child {
        margin-bottom: 0;
      }

      &__distance {
        position: absolute;
        z-index: 1;
        top: -2.5rem;
        left: -13px;
        background-color: #fff;
        padding: .5rem;
        font-size: .9rem;
        font-weight: 600;
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
