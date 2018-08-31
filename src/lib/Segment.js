import DistanceOp from 'jsts/org/locationtech/jts/operation/distance/DistanceOp';
import LineString from 'jsts/org/locationtech/jts/geom/LineString';
import geolib from 'geolib';

import { calculateElevationStatistics } from './getElevationStatistics';

export default class Segment {
  constructor({
    coordinates,
    description,
    elevations,
    factory,
    line,
    locomotion,
    markers = [], // FIXME: remove markers from Segment because it is only used for splitting.
    surface,
    title,
    users,
  }) {
    this.description = description;
    this.elevations = elevations;
    this._locomotion = locomotion; // FIXME: rationalize this._locomotion & this.locomotion().
    this.markers = markers;
    this._surface = surface;
    this.title = title;
    this._users = users;

    ({ gain: this._gain, loss: this._loss } = calculateElevationStatistics(
      elevations
    ));

    this.usersRegexp = /((?:non-)?motorized)/;
    this.surfaceRegexp = /((?:paved|gravel|rail)?[ -]?(?:road|trail|sidewalk|cross-country))/;
    this.locomotionRegexp = /(foot|cycle)/;

    this.line = line; // JSTS object
    if (coordinates) {
      const coordinatesSeq = factory
        .getCoordinateSequenceFactory()
        .create(coordinates);
      this.line = new LineString(coordinatesSeq, factory);
    }
  }

  jstsPointToGeolib(coordinate) {
    return {
      latitude: coordinate.y,
      longitude: coordinate.x,
    };
  }

  extractField(regexp) {
    const match = regexp.exec(this.description);
    if (match) {
      return match[1];
    }
    return '';
  }

  strippedDescription() {
    const lines = this.description.split(/\n|\r\n|\r/);
    const firstLine = lines[0];
    const rest = lines.slice(1);

    const culled = firstLine
      .replace(this.usersRegexp, '')
      .replace(this.surfaceRegexp, '')
      .replace(this.locomotionRegexp, '')
      .replace(/[ ,]+/, '');
    if (culled === '') {
      return rest.join('\n');
    }
    return this.description;
  }

  users() {
    return this._users || this.extractField(this.usersRegexp);
  }

  surface() {
    return this._surface || this.extractField(this.surfaceRegexp);
  }

  locomotion() {
    return this._locomotion || this.extractField(this.locomotionRegexp);
  }

  locations() {
    return this.line
      .getCoordinates()
      .map((coordinate) => this.jstsPointToGeolib(coordinate));
  }

  gain() {
    return this._gain;
  }

  loss() {
    return this._loss;
  }

  // In meters
  distance() {
    return geolib.getPathLength(this.locations());
  }

  distanceFrom(marker) {
    const locGeom = this.computeMinDistance(marker);
    const segmentCoordinate = this.jstsPointToGeolib(
      locGeom[0].getCoordinate()
    );
    const markerCoordinate = this.jstsPointToGeolib(
      marker.point.getCoordinate()
    );
    const distance = geolib.getDistance(segmentCoordinate, markerCoordinate);

    return geolib.convertUnit('mi', distance);
  }

  computeMinDistance(marker) {
    const locGeom = [];
    const distanceOp = new DistanceOp();
    distanceOp.computeMinDistance(this.line, marker.point, locGeom);

    return locGeom;
  }
}
