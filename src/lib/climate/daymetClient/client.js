import memoize from 'lodash/memoize';
import objectHash from 'object-hash';
import { Api, Gateway } from 'daymet-single-pixel-client';

// Using yellowleaf as a proxy to add CORS headers.
Gateway.init({ url: 'https://apps.yellowleaf.org/daymet/single-pixel' });

function resolver(lat, lon, format, options) {
  return objectHash({ lat, lon, format, options });
}
const defaultImpl = memoize(Api.getApiData, resolver);

export default function({
  clientImpl = defaultImpl,
  end,
  format = 'json',
  lat, // WGS 84
  lon,
  start,
  vars = ['tmin', 'tmax', 'dayl', 'prcp', 'swe'],
}) {
  const options = {
    end: end.toDate(),
    start: start.toDate(),
    vars,
  };

  return clientImpl(lat, lon, format, options);
}
