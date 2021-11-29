import { OpenStreetMapProvider } from 'leaflet-geosearch'

export default (context, inject) => {
  const leafletGeosearch = {}
  leafletGeosearch.provider = new OpenStreetMapProvider()

  inject('leafletGeosearch', leafletGeosearch)
}
