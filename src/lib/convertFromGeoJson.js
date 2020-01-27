import togpx from 'togpx';
import tokml from '@maphubs/tokml';

export function toGpx(origGeoJson) {
  // Filter out folders:
  const features = origGeoJson.features.filter(
    (feature) => feature.geometry && feature.geometry.type
  );
  const geoJson = { ...origGeoJson, features };

  const featureTitle = (properties) => properties && properties.title;
  const featureDescription = (properties) =>
    properties && properties.description;
  const options = {
    featureTitle,
    featureDescription,
  };

  return togpx(geoJson, options);
}

export function toKml(geoJson) {
  const options = {
    name: 'title',
    description: 'description',
  };

  return tokml(geoJson, options);
}
