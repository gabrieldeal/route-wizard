//import Distance from 'jsts/org/locationtech/jts/algorithm/Distance';
import DistanceToPoint from 'jsts/org/locationtech/jts/algorithm/distance/DistanceToPoint';
import PointPairDistance from 'jsts/org/locationtech/jts/algorithm/distance/PointPairDistance';
//import DistanceOp from 'jsts/org/locationtech/jts/operation/distance/DistanceOp';
import GeoJSONReader from 'jsts/org/locationtech/jts/io/GeoJSONReader';
import LineString from 'jsts/org/locationtech/jts/geom/LineString';
import Point from 'jsts/org/locationtech/jts/geom/Point';

export default class Route {
  constructor({ geoJson }) {
    const geoJsonReader = new GeoJSONReader();
    this.route = geoJsonReader.read(geoJson);
    this.associate();
  }

  data() {
    return this.lines()
      .filter((feature) => feature.geometry instanceof LineString)
      .map((line) => ({
        title: line.properties.title,
        points: line.points.map((point) => point.properties.title),
      }))
      .sort((a, b) => a.title.localeCompare(b.title)); // FIXME: sort by line endpoints
  }

  associate() {
    this.lines().forEach((line) => (line.points = []));

    this.points().forEach((point) => {
      const line = this.closestLine(point);
      line.points.push(point);
    });
  }

  closestLine(point) {
    let closestDistance;
    let closestLine;
    for (let i = 0, lines = this.lines(); i < lines.length; ++i) {
      const line = lines[i];

      const pointPairDistance = new PointPairDistance();
      DistanceToPoint.computeDistance(
        line.geometry,
        point.geometry.getCoordinates()[0],
        pointPairDistance
      );

      const distance = pointPairDistance.getDistance();
      if (
        typeof closestDistance === 'undefined' ||
        distance < closestDistance
      ) {
        closestLine = line;
        closestDistance = distance;
      }
    }

    return closestLine;
  }

  points() {
    return this.features(Point);
  }

  lines() {
    return this.features(LineString);
  }

  features(type) {
    return this.route.features.filter(
      (feature) => feature.geometry instanceof type
    );
  }
}
