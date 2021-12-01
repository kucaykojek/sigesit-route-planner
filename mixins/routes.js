import get from 'lodash/get'

export default {
  data() {
    return {
      routes: []
    }
  },
  computed: {
    hasRoutes() {
      return this.routes.length > 0
    }
  },
  methods: {
    async generateRoutes() {
      this.routes = []
      try {
        const payload = {
          jobs: [
            ...this.points.map((point) => {
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
              start: [this.pointStart.lng, this.pointStart.lat],
              end: [this.pointFinish.lng, this.pointFinish.lat]
            }
          ],
          options: {
            g: true
          }
        }
        const headers = {
          'Authorization': this.$config.ORS_API_KEY
        }
        const { data } = await this.$axios.post(
          `${this.$config.ORS_API_URL}/optimization`,
          payload,
          { headers }
        )

        this.routes = Array.isArray(get(data, 'routes[0].steps'))
          ? get(data, 'routes[0].steps').filter(step => step.type === 'job')
          : []
      } catch (error) {
        this.$swal({
          icon: 'error',
          title: 'Error',
          text: error.message
        })
      }
    },
    deleteRoutes() {
      this.routes = []
    }
  }
}
