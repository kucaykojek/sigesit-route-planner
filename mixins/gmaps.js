export default {
  data() {
    return {
      mapLibrary: 'gmaps',
      gmaps: null
    }
  },
  methods: {
    loadMap() {
      this.$gmaps.loader.load().then((google) => {
        this.gmaps = google.maps
        this.map = new this.gmaps.Map(document.getElementById('geolocationMap'), {
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
      })
    }
  }
}
