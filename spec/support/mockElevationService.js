import fetchMock from 'fetch-mock';

export default function mockElevationService() {
  let elevation = 0;
  const responseCache = {};
  const makeElevation = (location) => {
    const key = `${location.longitude}/${location.latitude}`;
    if (typeof responseCache[key] !== 'undefined') {
      return responseCache[key];
    }

    responseCache[key] = elevation % 2 === 0 ? elevation : -elevation;
    ++elevation;

    return responseCache[key];
  };
  const response = (url, options) => {
    const locations = JSON.parse(options.body).locations;

    return JSON.stringify({
      results: locations.map((location) => ({
        elevation: makeElevation(location),
      })),
    });
  };
  fetchMock.post(/\/api\/v1\/lookup$/, response);
}
