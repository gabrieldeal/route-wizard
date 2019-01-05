// Caltopo is generating features without the type field.  :(
export default function(geoJson) {
  const features = geoJson.features.map((feature) => {
    if (feature.type) {
      return feature;
    }

    return {
      ...feature,
      type: 'Feature',
    };
  });

  return {
    ...geoJson,
    features,
  };
}
