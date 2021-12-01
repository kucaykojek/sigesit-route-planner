import get from 'lodash/get'

export default {
  data() {
    return {
      lines: []
    }
  },
  computed: {
    hasLines() {
      return this.lines.length > 0
    }
  },
  methods: {
    async generateLines() {
      this.lines = []
      try {
        let before
        const promises = []
        this.routes.forEach((current) => {
          if (before) {
            const points = `${before.location.join(',')};${current.location.join(',')}`
            promises.push(this.$axios.get(`${this.$config.OSRM_API_URL}/route/v1/driving/${points}?geometries=geojson`))
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

          let polyline = null
          if (coordinates.length) {
            polyline = new this.gmaps.Polyline({
              path: coordinates,
              geodesic: true,
              strokeColor: '#B52125',
              strokeOpacity: .5,
              strokeWeight: 3
            })

            polyline.setMap(this.map)
          }

          this.lines.push({
            coordinates,
            polyline
          })
        })
      } catch (error) {
        this.$swal({
          icon: 'error',
          title: 'Error',
          text: error.message
        })
      }
    },
    removePolyline(polyline) {
      polyline.setMap(null)
    },
    deleteLines() {
      this.lines.forEach(line => {
        if (line.polyline) {
          this.removePolyline(line.polyline)
        }
      })

      this.lines = []
    }
  }
}
