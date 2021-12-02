import get from 'lodash/get'

export default {
  data() {
    return {
      pointDraft: {
        id: null,
        type: null,
        lat: null,
        lng: null,
        address: null
      },
      points: [],
      selectedPointId: null,
      showJobCard: true,
      showFinishCard: false
    }
  },
  computed: {
    draftType() {
      return this.pointDraft.type
    },
    isDrafting() {
      return (!!this.pointDraft.type)
    },
    hasDraftPoint() {
      return (!!this.pointDraft.type && !!this.pointDraft.lat && !!this.pointDraft.lng)
    },
    pointJobs() {
      return this.points.filter(point => point.type === 'jobs')
    },
    pointStart() {
      return this.points.find(point => point.type === 'start') || {}
    },
    pointFinish() {
      return this.points.find(point => point.type === 'finish') || {}
    },
    hasJobsPoint() {
      return this.pointJobs.length > 0
    },
    hasStartPoint() {
      return Object.keys(this.pointStart).length > 0
    },
    hasFinishPoint() {
      return Object.keys(this.pointFinish).length > 0
    }
  },
  methods: {
    getPointById(id) {
      return this.points.find(point => point.id === id) || {}
    },
    getPointJobIndexById(id) {
      const jobs = this.points.filter(point => point.type === 'jobs')
      return jobs.findIndex(point => point.id === id)
    },
    async getAddress({ lat, lng }) {
      try {
        const geocoder = new this.gmaps.Geocoder()
        const { results } = await geocoder.geocode({ location: { lat, lng } })

        return get(results, '[0].formatted_address') || ''
      } catch (error) {
        this.$swal({
          icon: 'error',
          title: 'Error',
          text: 'Gagal mendapatkan alamat lokasi'
        })

        return ''
      }
    },
    async addMarker({ lat, lng, type, address }) {
      try {
        if (this.pointDraft.marker && this.pointDraft.infowindow) {
          await this.removeMarker({ marker: this.pointDraft.marker, infowindow: this.pointDraft.infowindow })
        }

        const marker = new this.gmaps.Marker({
          position: new this.gmaps.LatLng(lat, lng),
          title: address,
          icon: `/marker-pin-${type}.svg`
        })

        const infowindow = new this.gmaps.InfoWindow({
          content: `<div class="infowindow-content">${address}</div>`
        })

        await marker.setMap(this.map)
        this.map.setCenter(marker.getPosition())
        this.map.setZoom(17)
        marker.addListener('click', (e) => {
          this.toggleInfoWindow(marker, infowindow)
        })

        return { marker, infowindow }
      } catch (error) {
        this.$swal({
          icon: 'error',
          title: 'Error',
          text: 'Gagal menambahkan titik lokasi'
        })

        return null
      }
    },
    removeMarker({ marker, infowindow }) {
      if (infowindow !== null) {
        this.gmaps.event.clearInstanceListeners(infowindow)
        infowindow.close()
        infowindow = null
      }

      this.gmaps.event.clearInstanceListeners(marker)
      marker.setMap(null)
    },
    toggleInfoWindow(marker, infowindow) {
      if (!this.isDrafting) {
        infowindow.open({
          anchor: marker,
          map: this.map,
          shouldFocus: false
        })
      }
    },
    createPoint(type, data = null) {
      this.pointDraft.id = new Date().getTime()
      this.pointDraft.type = type

      if (data) {
        const params = {
          lat: data.lat,
          lng: data.lng,
          type
        }

        this.setDraftPoint(params)
      }

      if (!this.mapClickListener) {
        this.map.setOptions({ draggableCursor: 'crosshair' })
        this.mapClickListener = this.gmaps.event.addListener(this.map, 'click', (event) => {
          const position = event.latLng.toJSON()
          const params = {
            lat: position.lat,
            lng: position.lng,
            type
          }

          this.setDraftPoint(params)
        })
      }
    },
    updatePoint(point) {
      const index = this.points.findIndex(p => p.id === point.id)

      if (index > -1) {
        this.points.splice(index, 1)

        this.selectedPointId = point.id
        this.pointDraft = { ...point }

        if (!this.mapClickListener) {
          this.map.setOptions({ draggableCursor: 'crosshair' })
          this.mapClickListener = this.gmaps.event.addListener(this.map, 'click', (event) => {
            const position = event.latLng.toJSON()
            const params = {
              lat: position.lat,
              lng: position.lng,
              type: this.pointDraft.type
            }

            this.setDraftPoint(params)
          })
        }
      }
    },
    deletePoint(pointId) {
      const index = this.points.findIndex(p => p.id === pointId)

      if (index > -1) {
        if (this.points[index].marker && this.points[index].infowindow) {
          this.removeMarker({ marker: this.points[index].marker, infowindow: this.points[index].infowindow })
        }

        this.points.splice(index, 1)
      }
    },
    setPoint() {
      this.points.push({ ...this.pointDraft })
      this.map.setOptions({ draggableCursor: '' })
      this.gmaps.event.clearListeners(this.map, 'click')
      this.mapClickListener = null
      this.selectedPointId = null
      if (this.pointDraft.type === 'jobs') {
        this.showJobCard = false
        this.$nextTick(() => {
          setTimeout(() => {
            if (this.$refs.finishCard) {
              this.$refs.finishCard.scrollIntoView({
                behavior: 'smooth'
              })
            } else if (this.$refs.addCard) {
              this.$refs.addCard.scrollIntoView({
                behavior: 'smooth'
              })
            }
          })
        })
      }

      if (this.pointDraft.type === 'start') {
        this.$nextTick(() => {
          setTimeout(() => {
            if (this.$refs.jobCard) {
              this.$refs.jobCard.scrollIntoView({
                behavior: 'smooth'
              })
            } else if (this.$refs.addCard) {
              this.$refs.addCard.scrollIntoView({
                behavior: 'smooth'
              })
            }
          })
        })
      }

      if (this.pointDraft.type === 'finish') {
        this.$nextTick(() => {
          setTimeout(() => {
            if (this.$refs.routePlannerList) {
              this.$refs.routePlannerList.scrollTo({
                top: this.$refs.routePlannerList.scrollHeight, behavior: 'smooth'
              })
            }
          })
        })
      }

      this.pointDraft = {
        id: null,
        type: null,
        lat: null,
        lng: null,
        address: null
      }

      if (this.isShowingQrScanner) {
        this.toggleQrScanner()
      }
    },
    async setDraftPoint(params) {
      this.pointDraft.lat = params.lat
      this.pointDraft.lng = params.lng
      this.pointDraft.address = await this.getAddress(params)
      const { marker, infowindow } = await this.addMarker({ ...params, address: this.pointDraft.address })
      this.pointDraft.marker = marker
      this.pointDraft.infowindow = infowindow
    },
    setBounds() {
      const bounds = new this.gmaps.LatLngBounds()

      this.points.forEach(point => {
        const place = new this.gmaps.LatLng(point.lat, point.lng)
        bounds.extend(place)
      })

      this.map.fitBounds(bounds)
    }
  }
}
