import toGeoJson from 'togeojson';

function parseXml(xml) {
  return new DOMParser().parseFromString(xml, 'text/xml');
}

function parse({ extension, fileContentsStr }) {
  switch (extension) {
    case 'json':
      return JSON.parse(fileContentsStr);
    case 'kml':
      return toGeoJson.kml(parseXml(fileContentsStr));
    case 'gpx':
      return toGeoJson.gpx(parseXml(fileContentsStr));
    default:
      throw `Unexpected error while converting '${extension}' to GeoJSON.`;
  }
}

function normalizeTitles(feature) {
  if (!feature.properties) {
    feature.properties = {};
  }
  if (!feature.properties.title) {
    feature.properties.title = feature.properties.name || '(Unnamed)';
  }

  if (feature.features) {
    feature.features.forEach((f) => normalizeTitles(f));
  }
}

export default function convertToGeoJson({ fileContentsStr, fileName }) {
  const extensionMatch = fileName.match(/\.(kml|gpx|json)$/i);
  if (!extensionMatch) {
    throw 'Unrecognized file extension (expected .gpx, .kml, or .json).';
  }

  const extension = extensionMatch[1].toLowerCase();
  const geoJson = parse({ extension, fileContentsStr });

  normalizeTitles(geoJson);

  return geoJson;
}
