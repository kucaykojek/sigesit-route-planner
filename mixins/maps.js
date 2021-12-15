import get from 'lodash/get'

export default {
  data() {
    return {
      mapId: 'map',
      mapElement: null,
      mapClickListener: null,
      marker: {},
      polyline: [],
      realtimeMarker: null,
      realtimeMarkerTimeout: null
    }
  },
  computed: {
    isUsingGmaps() {
      return this.$store.getters.isUsingGmaps
    },
    isUsingOsm() {
      return this.$store.getters.isUsingOsm
    },
    mapLibrary() {
      return this.$store.state.mapLibrary
    }
  },
  created() {
    this.$nuxt.$on(`${this.mapId}:addListener`, (event, callback) => {
      this.addMapListener(event, callback)
    })
    this.$nuxt.$on(`${this.mapId}:removeListener`, (event) => {
      this.removeMapListener(event)
    })
    this.$nuxt.$on(`${this.mapId}:addMarker`, (data) => {
      this.addMarker(data)
    })
    this.$nuxt.$on(`${this.mapId}:addPolyline`, (data) => {
      this.addPolyline(data)
    })
    this.$nuxt.$on(`${this.mapId}:removePolyline`, () => {
      this.removePolyline()
    })
    this.$nuxt.$on(`${this.mapId}:setBound`, (data) => {
      this.setBound(data)
    })
    this.$nuxt.$on(`${this.mapId}:toggleMarkerPopup`, (id) => {
      this.toggleMarkerPopup(id)
    })
  },
  methods: {
    async getRealtimeLocation(setCenter = false) {
      if (navigator.geolocation) {
        if (this.realtimeMarkerTimeout) {
          clearTimeout(this.realtimeMarkerTimeout)
          this.realtimeMarkerTimeout = null
        }

        const { coords } = await new Promise(function(resolve, reject) {
          navigator.geolocation.getCurrentPosition(resolve, reject)
        })

        if (this.realtimeMarker) {
          this.realtimeMarker.setMap(null)
        } else {
          this.realtimeMarker = new this.mapLibrary.Marker({
            position: new this.mapLibrary.LatLng(coords.latitude, coords.longitude),
            title: 'Lokasi Anda',
            icon: '/marker-gps.svg'
          })
        }

        this.realtimeMarker.setMap(this.mapElement)

        if (setCenter) {
          this.mapElement.setCenter(this.realtimeMarker.getPosition())
          this.mapElement.setZoom(17)
        }

        this.realtimeMarkerTimeout = setTimeout(() => {
          this.getRealtimeLocation()
        }, 10000)
      }
    },
    loadMap() {
      if (this.isUsingGmaps) {
        this.$gmaps.loader.load().then((google) => {
          this.$store.commit('setMapLibrary', google.maps)

          this.mapElement = new google.maps.Map(document.getElementById(this.mapId), {
            center: { lat: -6.905304, lng: 107.630999 },
            zoom: 13,
            disableDefaultUI: true,
            styles: [{
              featureType: 'poi',
              elementType: 'labels',
              stylers: [
                { visibility: 'off' }
              ]
            }]
          })

          this.$nuxt.$emit(`${this.mapId}:loaded`, this.mapElement)
          this.getRealtimeLocation()
        })
      }
    },
    addMapListener(event, callback) {
      if (!this.mapClickListener && event === 'click') {
        this.mapElement.setOptions({ draggableCursor: 'crosshair' })

        this.mapClickListener = this.mapLibrary.event.addListener(this.mapElement, event, (e) => {
          const position = e.latLng.toJSON()
          const params = {
            lat: position.lat,
            lng: position.lng
          }

          callback(params)
        })
      }
    },
    removeMapListener(event) {
      if (this.mapClickListener && event === 'click') {
        this.mapElement.setOptions({ draggableCursor: '' })
        this.mapLibrary.event.clearListeners(this.mapElement, event)
        this.mapClickListener = null
      }
    },
    async addMarker(data) {
      try {
        if (this.marker[data.id]) {
          await this.removeMarker({ marker: this.marker[data.id].marker, infowindow: this.marker[data.id].infowindow })
        }

        if (data.lat && data.lng) {
          const marker = new this.mapLibrary.Marker({
            position: new this.mapLibrary.LatLng(data.lat, data.lng),
            title: data.address,
            icon: `/marker-pin-${data.type}.svg`
          })

          const infowindow = new this.mapLibrary.InfoWindow({
            content: `<div class="infowindow-content">${data.address}</div>`
          })

          await marker.setMap(this.mapElement)
          this.mapElement.setCenter(marker.getPosition())
          this.mapElement.setZoom(17)
          marker.addListener('click', (e) => {
            this.toggleMarkerPopup(data.id)
          })

          this.marker[data.id] = { marker, infowindow }
        }
      } catch (error) {
        this.$swal({
          icon: 'error',
          title: 'Error',
          text: 'Gagal menambahkan titik lokasi'
        })
      }
    },
    removeMarker({ marker, infowindow }) {
      if (infowindow !== null) {
        this.mapLibrary.event.clearInstanceListeners(infowindow)
        infowindow.close()
        infowindow = null
      }

      this.mapLibrary.event.clearInstanceListeners(marker)
      marker.setMap(null)
    },
    addPolyline(lines) {
      this.polyline = []
      lines.forEach(line => {
        let polyline = null
        if (line.coordinates.length) {
          polyline = new this.mapLibrary.Polyline({
            path: line.coordinates,
            geodesic: true,
            strokeColor: '#B52125',
            strokeOpacity: .5,
            strokeWeight: 3
          })

          polyline.setMap(this.mapElement)

          this.polyline.push(polyline)
        }
      })
    },
    removePolyline() {
      this.polyline.forEach(line => {
        if (line) {
          line.setMap(null)
        }
      })

      this.polyline = []
    },
    toggleMarkerPopup(id) {
      console.log(id, get(this.marker, `[${id}].marker`))
      if (get(this.marker, `[${id}].marker`) && get(this.marker, `[${id}].infowindow`)) {
        get(this.marker, `[${id}].infowindow`).open({
          anchor: get(this.marker, `[${id}].marker`),
          map: this.map,
          shouldFocus: false
        })
      }
    },
    setBound(data) {
      const bounds = new this.mapLibrary.LatLngBounds()

      data.forEach(point => {
        const place = new this.mapLibrary.LatLng(point.lat, point.lng)
        bounds.extend(place)
      })

      this.mapElement.fitBounds(bounds)
    }
  }
}
