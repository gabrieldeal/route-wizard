import DistanceOp from 'jsts/org/locationtech/jts/operation/distance/DistanceOp';
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
      .map((segment) => this.splitOnPoints(segment));
    this.segments = flatten(segments);
  }

  data() {
    return this.segments.map((segment) => ({
      title: segment.title,
      markers: segment.markers.map((marker) => marker.title),
    }));
  }

  associate() {
    this.markers.forEach((marker) => {
      const segment = this.closestSegment(marker);
      segment.markers.push(marker);
    });
  }

  computeMinDistance(segment, marker) {
    console.log('computeMinDistance');
    console.log('    segment.title', segment.title);
    console.log('    segment.line', segment.line);
    console.log('    marker.title', marker.title);
    console.log('    marker.point', marker.point);

    const locGeom = [];
    const distanceOp = new DistanceOp();
    distanceOp.computeMinDistance(segment.line, marker.point, locGeom);

    console.log('    locGeom', locGeom);

    return locGeom;
  }

  splitOnPoints(segment) {
    console.log('splitOnPoints');
    const segments = [];
    let remainingSegment = segment;
    segment.markers
      .map((marker) => ({
        locGeom: this.computeMinDistance(segment, marker),
        marker,
      }))
      .sort((a, b) =>
        Math.sign(
          a.locGeom[0].getSegmentIndex() - b.locGeom[0].getSegmentIndex()
        )
      )
      .reverse()
      .forEach((split) => {
        let newSegment;
        [remainingSegment, newSegment] = this.split({
          lineGeometryLocation: split.locGeom[0],
          marker: split.marker,
          segment: remainingSegment,
        });
        segments.push(newSegment);
      });

    segments.push(remainingSegment);

    return segments.reverse();
  }

  split({ lineGeometryLocation, marker, segment }) {
    const coordinates = segment.line.getCoordinates();
    console.log('segment', segment.title);
    console.log('    coordinate count', coordinates.length);
    console.log('    marker', marker.title);
    console.log('    lineGeometryLocation', lineGeometryLocation);

    const splitIndex = lineGeometryLocation.getSegmentIndex();
    const left = coordinates.slice(0, splitIndex + 1);
    const right = coordinates.slice(splitIndex, coordinates.length);

    if (!right[0].equals(lineGeometryLocation.getCoordinate())) {
      // The split is between points on the line.
      left.push(lineGeometryLocation.getCoordinate());
      right.unshift(lineGeometryLocation.getCoordinate());
    }

    return [
      new Segment({
        coordinates: left,
        description: segment.description,
        factory: segment.line.getFactory(),
        title: segment.title,
      }),
      new Segment({
        coordinates: right,
        description: segment.description,
        factory: segment.line.getFactory(),
        marker,
        title: marker.title,
      }),
    ];
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
