import DistanceOp from 'jsts/org/locationtech/jts/operation/distance/DistanceOp';
import geodist from 'geodist';
import LineString from 'jsts/org/locationtech/jts/geom/LineString';

export default class Segment {
  constructor({
    coordinates,
    description,
    factory,
    line,
    markers = [],
    title,
  }) {
    this.description = description;
    this.markers = markers;
    this.title = title;

    this.line = line; // JSTS object
    if (coordinates) {
      const coordinatesSeq = factory
        .getCoordinateSequenceFactory()
        .create(coordinates);
      this.line = new LineString(coordinatesSeq, factory);
    }
  }

  setMarkers(markers) {
    this.markers = markers;
  }

  distance() {
    const latLons = this.line.getCoordinates().map((coordinate) => ({
      lat: coordinate.y,
      lon: coordinate.x,
    }));

    let distance = 0;
    for (let i = 1; i < latLons.length; ++i) {
      console.log('lat-1', latLons[i - 1]);
      console.log('lat', latLons[i]);
      const d = geodist(latLons[i - 1], latLons[i], {
        exact: true,
        unit: 'miles',
      });
      console.log('d', d);
      distance += d;
    }

    return distance;
  }

  computeMinDistance(marker) {
    console.log('computeMinDistance');
    console.log('    segment.title', this.title);
    console.log('    this.line', this.line);
    console.log('    marker.title', marker.title);
    console.log('    marker.point', marker.point);

    const locGeom = [];
    const distanceOp = new DistanceOp();
    distanceOp.computeMinDistance(this.line, marker.point, locGeom);

    console.log('    locGeom', locGeom);

    return locGeom;
  }

  // FIXME: Move into Segment
  splitOnMarkers() {
    const segments = [];
    let remainingSegment = this;
    this.markers
      .map((marker) => ({
        locGeom: this.computeMinDistance(marker),
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

  // FIXME: Move into Segment
  split({ lineGeometryLocation, marker }) {
    const coordinates = this.line.getCoordinates();
    console.log('segment', this.title);
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
        description: this.description,
        factory: this.line.getFactory(),
        title: this.title,
      }),
      new Segment({
        coordinates: right,
        description: this.description,
        factory: this.line.getFactory(),
        marker,
        title: marker.title,
      }),
    ];
  }
}
