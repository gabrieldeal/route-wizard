import DistanceOp from 'jsts/org/locationtech/jts/operation/distance/DistanceOp';
import DistanceToPoint from 'jsts/org/locationtech/jts/algorithm/distance/DistanceToPoint';
import flatten from 'lodash/flatten';
import geolib from 'geolib';
import LineString from 'jsts/org/locationtech/jts/geom/LineString';
import PointPairDistance from 'jsts/org/locationtech/jts/algorithm/distance/PointPairDistance';

import Segment from './Segment';

export default class SegmentSplitter {
  constructor({ markers, segments }) {
    this.markers = markers;
    this.segments = segments;

    if (this.segments.length == 0) {
      throw 'The route file does not contain any lines';
    }
  }

  split() {
    this.associateMarkersWithSegments();

    return flatten(this.segments.map((segment) => this.splitSegment(segment)));
  }

  associateMarkersWithSegments() {
    this.markers.forEach((marker) => {
      const segment = this.closestSegment(marker);
      const distance = segment.distanceFrom(marker);
      const maxMiles = 0.5;
      if (distance < maxMiles) {
        segment.markers.push(marker);
      }
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

  splitSegment(segment) {
    const segments = [];
    let remainingSegment = segment;
    segment.markers
      .map((marker) => ({
        locGeom: segment.findClosestPoint(marker),
        marker,
      }))
      .sort(
        (a, b) =>
          -Math.sign(
            a.locGeom[0].getSegmentIndex() - b.locGeom[0].getSegmentIndex()
          )
      )
      .forEach((split) => {
        let newSegment;
        [remainingSegment, newSegment] = this.splitAt({
          lineGeometryLocation: split.locGeom[0],
          marker: split.marker,
          segment: remainingSegment,
        });
        if (newSegment) {
          segments.push(newSegment);
        } // else: the marker was at the end of the segment.
      });

    segments.push(remainingSegment);

    return segments.reverse();
  }

  isMarkerAtStart(geometryLocation, coordinates) {
    const firstCoordinate = coordinates[0];
    const firstSegmentIndex = 0;
    return (
      geometryLocation.getSegmentIndex() === firstSegmentIndex &&
      geometryLocation.getCoordinate().equals(firstCoordinate)
    );
  }

  isMarkerAtEnd(geometryLocation, coordinates) {
    const lastCoordinate = coordinates[coordinates.length - 1];
    const lastSegmentIndex = coordinates.length - 2;
    return (
      geometryLocation.getSegmentIndex() === lastSegmentIndex &&
      geometryLocation.getCoordinate().equals(lastCoordinate)
    );
  }

  joinDescriptions(a, b) {
    if (a && b) {
      return `${a}\n${b}`;
    }
    if (a) {
      return a;
    }
    return b;
  }

  splitAt({ lineGeometryLocation, marker, segment }) {
    const coordinates = segment.line.getCoordinates();
    const elevations = segment.elevations;

    const fields = {
      locomotion: segment.locomotion(),
      surface: segment.surface(),
      users: segment.users(),
    };
    const splitIndex = lineGeometryLocation.getSegmentIndex();
    const isMarkerAtStart = this.isMarkerAtStart(
      lineGeometryLocation,
      coordinates
    );
    const isMarkerAtEnd = this.isMarkerAtEnd(lineGeometryLocation, coordinates);

    let left;
    let right;
    if (isMarkerAtEnd) {
      left = null;
      right = {
        coordinates: coordinates,
        description: segment.description(),
        elevations,
        endMarkerDescription: marker.description,
        endMarkerTitle: marker.title,
        title: segment.title,
      };
    } else if (isMarkerAtStart) {
      left = null;
      right = {
        coordinates,
        description: this.joinDescriptions(
          marker.description,
          segment.description()
        ),
        elevations,
        endMarkerDescription: segment.endMarkerDescription,
        endMarkerTitle: segment.endMarkerTitle,
        title: marker.title || segment.title,
      };
    } else {
      left = {
        coordinates: coordinates.slice(0, splitIndex + 1),
        description: segment.description(),
        elevations: elevations.slice(0, splitIndex + 1),
        title: segment.title,
      };

      right = {
        coordinates: coordinates.slice(splitIndex, coordinates.length),
        description: marker.description,
        elevations: elevations.slice(splitIndex, elevations.length),
        endMarkerDescription: segment.endMarkerDescription,
        endMarkerTitle: segment.endMarkerTitle,
        title: marker.title,
      };

      if (!right.coordinates[0].equals(lineGeometryLocation.getCoordinate())) {
        // The split is between points on the line.
        left.coordinates.push(lineGeometryLocation.getCoordinate());
        right.coordinates.unshift(lineGeometryLocation.getCoordinate());
        left.elevations.push(left.elevations[left.elevations.length - 1]);
        right.elevations.unshift(right.elevations[0]);
      }
    }

    const segments = [];
    if (left) {
      segments.push(
        new Segment({
          ...left,
          ...fields,
          factory: segment.line.getFactory(),
        })
      );
    }
    if (right) {
      segments.push(
        new Segment({
          ...right,
          ...fields,
          factory: segment.line.getFactory(),
        })
      );
    }

    return segments;
  }
}
