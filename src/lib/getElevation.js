// FIXME: Rename this to getElevationStatistics.js

// FIXME: Move this function to https://github.com/gabrielmdeal/open-elevation
function lookup({
  locations,
  server = 'api.open-elevation.com',
  protocol = 'https',
}) {
  const url = `${protocol}://${server}/api/v1/lookup`;
  const headers = {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  };
  const options = {
    body: JSON.stringify({ locations: locations }),
    headers,
    method: 'POST',
  };

  return fetch(url, options)
    .then((response) => {
      if (response.status !== 200) {
        return Promise.reject(response.statusText);
      }
      return response.json();
    })
    .then((results) => Promise.resolve(results['results']))
    .catch((error) => {
      return Promise.reject(`Error getting elevation: ${error}`);
    });
}

function handleResponse(locations) {
  let gain = 0;
  let loss = 0;
  for (let i = 1; i < locations.length; ++i) {
    const prevElevation = locations[i - 1].elevation;
    const elevation = locations[i].elevation;
    if (prevElevation < elevation) {
      gain += elevation - prevElevation;
    } else {
      loss += prevElevation - elevation;
    }
  }

  return {
    gain: gain,
    loss: loss,
  };
}

// FIXME: This underestimates the gain & loss if the points are sparse because it
// does not sample the gain/loss between points.
export default function getElevationStatistics(locations) {
  return lookup({ locations }).then((locations) =>
    Promise.resolve(handleResponse(locations))
  );
}
