import { Loader } from '@googlemaps/js-api-loader'

export default ({ $config }, inject) => {
  const gmaps = {}
  gmaps.loader = new Loader({
    apiKey: $config.GMAPS_API_KEY,
    version: 'weekly'
  })

  inject('gmaps', gmaps)
}
