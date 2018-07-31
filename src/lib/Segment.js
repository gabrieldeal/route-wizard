import LineString from 'jsts/org/locationtech/jts/geom/LineString';

export default class Segment {
  constructor({ description, line, coordinates, markers = [], title }) {
    this.description = description;
    this.markers = markers;
    this.title = title;

    this.line = line; // JSTS object
    if (coordinates) {
      this.line = new LineString(coordinates);
    }
  }

  setMarkers(markers) {
    this.markers = markers;
  }
}
