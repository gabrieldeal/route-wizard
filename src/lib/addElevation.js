export default function addElevation({
  geoJson,
  server = 'yellowleaf.org',
  path = '/elevation-service',
  port = 443,
  protocol = 'https',
}) {
  const url = `${protocol}://${server}:${port}${path}`;
  const headers = {
    Accept: 'application/json',
    'Content-Type': 'text/plain',
  };
  const options = {
    body: JSON.stringify(geoJson),
    headers,
    method: 'POST',
  };

  return fetch(url, options)
    .then((response) => {
      if (response.status !== 200) {
        return Promise.reject(response.statusText);
      }
      return response.text();
    })
    .then((geoJsonStr) => JSON.parse(geoJsonStr))
    .catch((error) => {
      return Promise.reject(`Query to Elevation Service failed: ${error}`);
    });
}
