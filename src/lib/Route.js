import GeoJSONReader from 'jsts/org/locationtech/jts/io/GeoJSONReader';
import LineString from 'jsts/org/locationtech/jts/geom/LineString';
import Point from 'jsts/org/locationtech/jts/geom/Point';

import DummySegment from './DummySegment';
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

export default class Route {
  constructor({ geoJson: geoJsonString }) {
    const geoJsonReader = new GeoJSONReader();
    this.jstsRoot = geoJsonReader.read(geoJsonString);
    this.geoJson = JSON.parse(geoJsonString);

    const segments = this.features(LineString).map(
      (line) =>
        new Segment({
          title: line.properties.title,
          description: line.properties.description,
          line: line.geometry,
          elevations: getElevations(line.id, this.geoJson),
        })
    );
    const markers = this.features(Point).map(
      (point) =>
        new Marker({
          title: point.properties.title,
          description: point.properties.description,
          point: point.geometry,
        })
    );

    const segmentSplitter = new SegmentSplitter({ markers, segments });
    this.segments = segmentSplitter.split();
  }

  // FIXME: This seems like it should not live here.
  data() {
    if (this.segments.length == 0) {
      return [];
    }

    let cumulativeDistance = 0;
    const segments = [
      new DummySegment({}),
      ...this.segments,
      new DummySegment({ title: 'End' }),
    ];

    return segments.slice(1).map((segment, index) => {
      const prevSegment = segments[index];
      cumulativeDistance += prevSegment.distance() || 0;

      return {
        cumulativeDistance,
        description: segment.strippedDescription(),
        distance: prevSegment.distance(),
        gain: prevSegment.gain(),
        location: index == 0 ? 'Start' : segment.title,
        locomotion: segment.locomotion(),
        loss: prevSegment.loss(),
        surface: segment.surface(),
        users: segment.users(),
      };
    });
  }

  features(type) {
    return this.jstsRoot.features.filter(
      (feature) => feature.geometry instanceof type
    );
  }
}
