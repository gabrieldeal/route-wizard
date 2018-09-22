export default function addElevation({
  geoJson,
  server = 'pure-forest-36721.herokuapp.com',
  protocol = 'https',
}) {
  const url = `${protocol}://${server}/`;
  const headers = {
    Accept: 'application/json',
    'Content-Type': 'text/plain',
  };
  const options = {
    body: geoJson,
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
    .catch((error) => {
      return Promise.reject(`Query to Elevation Service failed: ${error}`);
    });
}
