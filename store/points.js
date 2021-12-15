import cloneDeep from 'lodash/cloneDeep'

export const state = () => {
  return {
    pointDraft: {
      id: null,
      customer_name: null,
      shipment_number: null,
      type: null,
      lat: null,
      lng: null,
      address: null
    },
    points: [],
    selectedPointId: null,
    showJobCard: false,
    showFinishCard: false,
    isLoadingImport: false
  }
}

export const mutations = {
  setPointDraft: (state, data) => {
    if (data) {
      state.pointDraft = {
        ...state.pointDraft,
        ...data
      }
    } else {
      state.pointDraft = {
        id: null,
        customer_name: null,
        shipment_number: null,
        type: null,
        lat: null,
        lng: null,
        address: null
      }
    }
  },
  unsetPoints: (state, index) => {
    state.points.splice(index, 1)
  },
  setPoints: (state, data) => {
    if (data) {
      if (data.id) {
        const points = cloneDeep(state.points)
        const index = state.points.findIndex(point => point.id === data.id)
        console.log('here', index)
        if (index > -1) {
          points[index] = { ...data }
          state.points = points
        }
        console.log('here', index)
      } else {
        state.points = [
          ...state.points,
          ...data
        ]
      }
    } else {
      state.points = []
    }
  },
  setSelectedPointId: (state, data) => {
    state.selectedPointId = data
  },
  setShowJobCard: (state, data) => {
    state.showJobCard = !!data
  },
  setShowFinishCard: (state, data) => {
    state.showFinishCard = !!data
  },
  setIsLoadingImport: (state, data) => {
    state.isLoadingImport = !!data
  }
}

export const getters = {
  draftType: state => {
    return state.pointDraft.type
  },
  isDrafting: state => {
    return (!!state.pointDraft.type)
  },
  hasDraftPoint: state => {
    return (!!state.pointDraft.type && !!state.pointDraft.lat && !!state.pointDraft.lng)
  },
  pointJobs: state => {
    return state.points.filter(point => point.type === 'jobs')
  },
  pointStart: state => {
    return state.points.find(point => point.type === 'start') || {}
  },
  pointFinish: state => {
    return state.points.find(point => point.type === 'finish') || {}
  },
  hasJobsPoint: (state, getters) => {
    return getters.pointJobs.length > 0
  },
  hasStartPoint: (state, getters) => {
    return Object.keys(getters.pointStart).length > 0
  },
  hasFinishPoint: (state, getters) => {
    return Object.keys(getters.pointFinish).length > 0
  },
  getPointById: state => (id) => {
    return state.points.find(point => point.id === id) || {}
  },
  getPointJobIndexById: state => (id) => {
    const jobs = state.points.filter(point => point.type === 'jobs')
    return jobs.findIndex(point => point.id === id)
  }
}

export const actions = {
  importJobPoints({ commit }) {
    commit('setIsLoadingImport', true)

    const sampleJobs = require('~/static/sampleJobs.json')
    const payload = sampleJobs.map(job => {
      return {
        id: new Date().getTime() + job.id,
        customer_name: job.name,
        shipment_number: job.shipment_number,
        type: 'jobs',
        lat: job.latitude,
        lng: job.longitude,
        address: job.address
      }
    })

    commit('setIsLoadingImport', true)
    commit('setPoints', payload)
    return payload
  }
}