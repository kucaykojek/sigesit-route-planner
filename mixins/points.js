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
        if (this.pointDraft.marker) {
          await this.removeMarker(this.pointDraft.marker)
        }

        const marker = new this.gmaps.Marker({
          position: new this.gmaps.LatLng(lat, lng),
          title: address,
          icon: `/marker-pin-${type}.svg`
        })

        await marker.setMap(this.map)
        this.map.setCenter(marker.getPosition())
        this.map.setZoom(17)

        return marker
      } catch (error) {
        this.$swal({
          icon: 'error',
          title: 'Error',
          text: 'Gagal menambahkan titik lokasi'
        })

        return null
      }
    },
    removeMarker(marker) {
      marker.setMap(null)
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
        if (this.points[index].marker) {
          this.removeMarker(this.points[index].marker)
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
      this.pointDraft.marker = await this.addMarker({ ...params, address: this.pointDraft.address })
    }
  }
}
