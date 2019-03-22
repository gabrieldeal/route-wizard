import mapKeys from 'lodash/mapKeys';

function simplifyDataKeys({ data }) {
  const keyMappings = {
    'dayl (s)': 'dayl',
    'prcp (mm/day)': 'prcp',
    'swe (kg/m^2)': 'swe',
    'tmax (deg c)': 'tmax',
    'tmin (deg c)': 'tmin',
    yday: 'yday',
    year: 'year',
  };

  return mapKeys(data, (_value, key) => {
    const newKey = keyMappings[key];
    if (!newKey) {
      console.warn(`Unexpected Daymet key '${key}'`); // eslint-disable-line no-console
      return key;
    }

    return newKey;
  });
}

function getElevationInt({ Elevation: elevationStr }) {
  if (!elevationStr || !elevationStr.endsWith(' m')) {
    throw new Error(`Bad elevation format '${elevationStr}'`);
  }

  const elevation = elevationStr.substring(0, elevationStr.length - 2);

  return parseInt(elevation, 10);
}

export default function({ data }) {
  return {
    ...simplifyDataKeys(data),
    elevation: getElevationInt(data),
  };
}
