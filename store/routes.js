import get from 'lodash/get'

export const state = () => {
  return {
    isLoadingRoute: false,
    isLoadingLine: false,
    routes: [],
    lines: []
  }
}

export const mutations = {
  setRoutes: (state, data) => {
    if (data) {
      state.routes = [
        ...state.routes,
        ...data
      ]
    } else {
      state.routes = []
    }
  },
  setLines: (state, data) => {
    if (data) {
      state.lines = [
        ...state.lines,
        ...data
      ]
    } else {
      state.lines = []
    }
  },
  setIsLoadingRoute: (state, data) => {
    state.isLoadingRoute = !!data
  },
  setIsLoadingLine: (state, data) => {
    state.isLoadingLine = !!data
  }
}

export const getters = {
  hasRoutes: state => {
    return state.routes.length > 0
  }
}

export const actions = {
  async generateRoutes({ commit, dispatch, rootState, rootGetters }) {
    commit('setIsLoadingRoute', true)
    commit('setRoutes', null)

    try {
      const payload = {
        jobs: [
          ...rootState.points.points.map((point) => {
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
            start: [rootGetters['points/pointStart'].lng, rootGetters['points/pointStart'].lat],
            end: [rootGetters['points/pointFinish'].lng, rootGetters['points/pointFinish'].lat]
          }
        ],
        options: {
          g: true
        }
      }
      const headers = {
        'Authorization': this.app.$config.ORS_API_KEY
      }
      const { data } = await this.app.$axios.post(
        `${this.app.$config.ORS_API_URL}/optimization`,
        payload,
        { headers }
      )


      await commit(
        'setRoutes',
        Array.isArray(get(data, 'routes[0].steps'))
          ? get(data, 'routes[0].steps').filter(step => step.type === 'job')
          : []
      )

      await dispatch('generateLines')
    } finally {
      commit('setIsLoadingRoute', false)
    }
  },
  async generateLines({ commit, state }) {
    commit('setIsLoadingLine', true)
    commit('setLines', null)

    try {
      const lines = []

      let before
      const promises = []
      state.routes.forEach((current) => {
        if (before) {
          const points = `${before.location.join(',')};${current.location.join(',')}`
          promises.push(this.app.$axios.get(`${this.app.$config.OSRM_API_URL}/route/v1/driving/${points}?geometries=geojson`))
        }

        before = current
      })

      const responses = await Promise.all(promises)
      const routeLines = responses.map(val => val.data)

      routeLines.forEach(line => {
        let coordinates = get(line, 'routes[0].geometry.coordinates')
        coordinates = coordinates
          ? coordinates.map(value => ({ lat: value[1], lng: value[0] }))
          : []

        lines.push({
          coordinates
        })
      })

      commit('setLines', lines)
    } finally {
      commit('setIsLoadingLine', false)
    }
  },
  deleteRoutes({ commit }) {
    commit('setRoutes', null)
    commit('setLines', null)
  }
}
