import GeoJSONReader from 'jsts/org/locationtech/jts/io/GeoJSONReader';
import LineString from 'jsts/org/locationtech/jts/geom/LineString';
import pLimit from 'p-limit';
import Point from 'jsts/org/locationtech/jts/geom/Point';

import Marker from './Marker';
import Segment from './Segment';
import SegmentSplitter from './SegmentSplitter';

export default class Route {
  constructor({ geoJson }) {
    const geoJsonReader = new GeoJSONReader();
    this.route = geoJsonReader.read(geoJson);

    const segments = this.features(LineString).map(
      (line) =>
        new Segment({
          title: line.properties.title,
          description: line.properties.description,
          line: line.geometry,
        })
    );
    const markers = this.features(Point).map(
      (point) =>
        new Marker({
          title: point.properties.title,
          description: point.properties.description,
          point: point.geometry,
        })
    );

    const segmentSplitter = new SegmentSplitter({ markers, segments });
    this.segments = segmentSplitter.split();
  }

  // FIXME: This seems like it should not live here.
  data() {
    const maxConcurrentRequests = 5;
    const limit = pLimit(maxConcurrentRequests);

    const elevationStatisticsPromises = this.segments.map(
      (segment) => Promise.resolve({ gain: 0, loss: 0 })
      // limit(() => segment.elevationStatistics())
    );

    let cumulativeDistance = 0;
    const handleResponse = ({ index, allElevationStatistics, error }) => {
      const segment = this.segments[index];
      const to =
        index + 1 == this.segments.length
          ? 'End'
          : this.segments[index + 1].title;
      const elevationStatistics = error
        ? { gain: error }
        : allElevationStatistics;
      if (index > 0) {
        cumulativeDistance += this.segments[index - 1].distance();
      }
      return {
        from: segment.title,
        to,
        users: segment.users(),
        surface: segment.surface(),
        locomotion: segment.locomotion(),
        cumulativeDistance,
        description: segment.strippedDescription(),
        distance: segment.distance(),
        ...elevationStatistics,
      };
    };
    const handleResponses = (responses) =>
      responses.map((response, index) =>
        handleResponse({ index, ...response })
      );

    const alwaysResolve = (promise) =>
      promise.then(
        (allElevationStatistics) => ({ allElevationStatistics }),
        (error) => ({ error })
      );

    return Promise.all(elevationStatisticsPromises.map(alwaysResolve)).then(
      handleResponses
    );
  }

  features(type) {
    return this.route.features.filter(
      (feature) => feature.geometry instanceof type
    );
  }
}
