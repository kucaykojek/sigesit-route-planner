export const state = () => {
  return {
    header: {
      nav: {
        icon: 'fas fa-chevron-left fg-branding-red',
        action: () => {}
      },
      title: 'Rencana Perjalananx'
    },
    usingMapLibrary: 'gmaps',
    mapLibrary: null
  }
}

export const mutations = {
  setHeader: (state, data) => {
    if (data) {
      state.header = {
        ...state.header,
        ...data
      }
    } else {
      state.header = {
        nav: {
          icon: 'fas fa-chevron-left fg-branding-red',
          action: () => {}
        },
        title: 'Rencana Perjalanan'
      }
    }
  },
  setUsingMapLibrary: (state, data) => {
    state.usingMapLibrary = ['gmaps', 'osm'].includes(data) ? data : 'gmaps'
  },
  setMapLibrary: (state, data) => {
    state.mapLibrary = data
  }
}

export const getters = {
  isUsingGmaps: state => {
    return state.usingMapLibrary === 'gmaps'
  },
  isUsingOsm: state => {
    return state.usingMapLibrary === 'osm'
  }
}
