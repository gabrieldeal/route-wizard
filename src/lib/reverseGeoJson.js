import turfReverse from 'turf-reverse';

const reversableTypes = [
  'LineString',
  'MultiLineString',
  'MultiPolygon',
  'Polygon',
];

function reverseIfNeeded(feature) {
  if (feature.geometry && reversableTypes.includes(feature.geometry.type)) {
    return turfReverse(feature);
  }

  return feature;
}

export default function(geoJson) {
  const features = geoJson.features.map(reverseIfNeeded).reverse();

  return {
    ...geoJson,
    features,
  };
}
