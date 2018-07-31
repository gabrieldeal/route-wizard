import DistanceToPoint from 'jsts/org/locationtech/jts/algorithm/distance/DistanceToPoint';
import flatten from 'lodash/flatten';
import GeoJSONReader from 'jsts/org/locationtech/jts/io/GeoJSONReader';
import LineString from 'jsts/org/locationtech/jts/geom/LineString';
import Point from 'jsts/org/locationtech/jts/geom/Point';
import PointPairDistance from 'jsts/org/locationtech/jts/algorithm/distance/PointPairDistance';

import Marker from './Marker';
import Segment from './Segment';

export default class Route {
  constructor({ geoJson }) {
    const geoJsonReader = new GeoJSONReader();
    this.route = geoJsonReader.read(geoJson);
    this.segments = this.features(LineString).map(
      (line) =>
        new Segment({
          title: line.properties.title,
          description: line.properties.description,
          line: line.geometry,
        })
    );
    this.markers = this.features(Point).map(
      (point) =>
        new Marker({
          title: point.properties.title,
          description: point.properties.description,
          point: point.geometry,
        })
    );

    this.associate();

    const segments = this.segments
      .sort((a, b) => a.title.localeCompare(b.title)) // FIXME
      .map((segment) => segment.splitOnMarkers());
    this.segments = flatten(segments);
  }

  data() {
    return this.segments.map((segment) => ({
      title: segment.title,
      distance: segment.distance(),
    }));
  }

  associate() {
    this.markers.forEach((marker) => {
      const segment = this.closestSegment(marker);
      segment.markers.push(marker);
    });
  }

  closestSegment(marker) {
    let closestDistance;
    let closestSegment;
    for (let i = 0, segments = this.segments; i < segments.length; ++i) {
      const segment = segments[i];

      const pointPairDistance = new PointPairDistance();
      DistanceToPoint.computeDistance(
        segment.line,
        marker.point.getCoordinates()[0],
        pointPairDistance
      );

      const distance = pointPairDistance.getDistance();
      if (
        typeof closestDistance === 'undefined' ||
        distance < closestDistance
      ) {
        closestSegment = segment;
        closestDistance = distance;
      }
    }

    return closestSegment;
  }

  features(type) {
    return this.route.features.filter(
      (feature) => feature.geometry instanceof type
    );
  }
}
