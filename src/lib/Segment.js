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
}
