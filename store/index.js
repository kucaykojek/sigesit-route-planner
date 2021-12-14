export const state = () => {
  return {
    header: {
      nav: {
        icon: 'fas fa-chevron-left fg-branding-red',
        action: () => {}
      },
      title: 'Rencana Perjalanan'
    }
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
  }
}
