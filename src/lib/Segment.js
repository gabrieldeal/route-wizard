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
}
