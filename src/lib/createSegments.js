import GeoJSONReader from 'jsts/org/locationtech/jts/io/GeoJSONReader';
import LineString from 'jsts/org/locationtech/jts/geom/LineString';
import Point from 'jsts/org/locationtech/jts/geom/Point';
import uuid from 'uuid/v1';

import Marker from './Marker';
import Segment from './Segment';
import SegmentSplitter from './SegmentSplitter';

function findFeature(id, geoJson) {
  if (id === geoJson.id) {
    return geoJson;
  }

  if (geoJson.features) {
    return geoJson.features.find((feature) => findFeature(id, feature));
  }

  return undefined;
}

function getElevations(id, geoJson) {
  const feature = findFeature(id, geoJson);
  if (!feature) {
    throw `Cannot find feature ID '${id}'.`;
  }

  return feature.geometry.coordinates.map((coordinate) => coordinate[2]);
}

function findFeatures(jstsRoot, type) {
  return jstsRoot.features.filter(
    (feature) => feature.geometry instanceof type
  );
}

function addIds(feature) {
  if (!feature.id) {
    feature.id = uuid();
  }
  if (feature.features) {
    feature.features.forEach((feature) => addIds(feature));
  }
}

export default function(geoJson) {
  addIds(geoJson);

  const geoJsonReader = new GeoJSONReader();
  const jstsRoot = geoJsonReader.read(geoJson);

  const segments = findFeatures(jstsRoot, LineString).map(
    (line) =>
      new Segment({
        title: line.properties.title,
        description: line.properties.description,
        line: line.geometry,
        elevations: getElevations(line.id, geoJson),
      })
  );
  const markers = findFeatures(jstsRoot, Point).map(
    (point) =>
      new Marker({
        title: point.properties.title,
        description: point.properties.description,
        point: point.geometry,
      })
  );

  const segmentSplitter = new SegmentSplitter({ markers, segments });

  return segmentSplitter.split();
}
