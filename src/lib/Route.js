import GeoJSONReader from 'jsts/org/locationtech/jts/io/GeoJSONReader';
import LineString from 'jsts/org/locationtech/jts/geom/LineString';

export default class Route {
  constructor({ geoJson }) {
    const geoJsonReader = new GeoJSONReader();
    this.route = geoJsonReader.read(geoJson);
  }

  lines() {
    return this.route.features
      .filter((feature) => feature.geometry instanceof LineString)
      .map((line) => ({ title: line.properties.title }))
      .sort((a, b) => a.title.localeCompare(b.title)); // FIXME: sort by line endpoints
  }
}
