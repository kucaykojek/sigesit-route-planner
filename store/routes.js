export const state = () => {
  return {
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
  }
}

export const getters = {
  hasRoutes: state => {
    return state.routes.length > 0
  }
}
