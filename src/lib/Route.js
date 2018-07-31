//import Distance from 'jsts/org/locationtech/jts/algorithm/Distance';
import DistanceToPoint from 'jsts/org/locationtech/jts/algorithm/distance/DistanceToPoint';
import PointPairDistance from 'jsts/org/locationtech/jts/algorithm/distance/PointPairDistance';
import DistanceOp from 'jsts/org/locationtech/jts/operation/distance/DistanceOp';
import GeoJSONReader from 'jsts/org/locationtech/jts/io/GeoJSONReader';
import LineString from 'jsts/org/locationtech/jts/geom/LineString';
import Point from 'jsts/org/locationtech/jts/geom/Point';

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

    // FIXME
    //    this.lines().forEach((line) => this.splitOnPoints(line));
  }

  data() {
    return this.segments
      .map((segment) => ({
        title: segment.title,
        markers: segment.markers.map((marker) => marker.title),
      }))
      .sort((a, b) => a.title.localeCompare(b.title)); // FIXME: sort by segment endpoints
  }

  associate() {
    this.markers.forEach((marker) => {
      const segment = this.closestSegment(marker);
      segment.markers.push(marker);
    });
  }

  computeMinDistance(segment, marker) {
    /* console.log('computeMinDistance');
     * console.log('    line.title', line.properties.title);
     * console.log('    line', line);
     * console.log('    point', point);
     */
    const locGeom = [];
    const distanceOp = new DistanceOp();
    distanceOp.computeMinDistance(segment.line, marker.point, locGeom);

    //console.log('    locGeom', locGeom);

    return locGeom;
  }

  splitOnPoints(segment) {
    console.log('splitOnPoints');
    const segments = [];
    let remainingSegment = segment;
    segment.markers
      .map((marker) => ({
        locGeom: this.computeMinDistance(segment.line, marker.point),
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
        [newSegment, remainingSegment] = this.split({
          coordinateToSplit: split.locGeom[0].getCoordinate(),
          marker: split.marker,
          segment: remainingSegment,
        });
        segments.push(newSegment);
      });

    console.log(segments);
  }

  split({ coordinateToSplit, marker, segment }) {
    const coordinates = segment.line.getCoordinates();
    const splitIndex = coordinates.findIndex((coordinate, i) =>
      coordinate.equals(coordinateToSplit)
    );

    const left = coordinates.slice(0, splitIndex + 1);
    const right = coordinates.slice(splitIndex, coordinates.length);

    return [
      new Segment({
        coordinates: left,
        description: segment.description,
        title: segment.title,
      }),
      new LineString({
        coordinates: right,
        description: segment.description,
        marker,
        title: segment.title,
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
