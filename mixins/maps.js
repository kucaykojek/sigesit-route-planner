export default {
  data() {
    return {
      mapId: 'map',
      mapElement: null,
      mapClickListener: null,
      marker: {}
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
  },
  methods: {
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
          this.toggleInfoWindow(marker, infowindow)
        })

        this.marker[data.id] = { marker, infowindow }
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
    toggleInfoWindow(marker, infowindow) {
      infowindow.open({
        anchor: marker,
        map: this.map,
        shouldFocus: false
      })
    }
  }
}
