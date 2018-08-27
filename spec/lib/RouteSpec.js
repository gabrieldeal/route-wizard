import fetchMock from 'fetch-mock';

import Route from '../../src/lib/Route';
import mockElevationService from '../support/mockElevationService';

describe('Route', function() {
  beforeEach(function() {
    mockElevationService();
    this.descriptionFields = {
      description: '',
      locomotion: '',
      surface: '',
      users: '',
    };
  });
  afterEach(function() {
    fetchMock.restore();
  });

  function createRoute(fixtureName) {
    const geoJson = readJSON(`./spec/fixture/${fixtureName}`);
    return new Route({ geoJson: JSON.stringify(geoJson) });
  }

  function expectRouteToEqual({ fixtureName, expectedData, done }) {
    const route = createRoute(fixtureName);

    route.data().then((data) => {
      expect(data).toEqual(expectedData);
      done();
    });
  }

  it('handles multiple segments & markers', function(done) {
    const expectedData = [
      {
        ...this.descriptionFields,
        from: '01 Stuart/Sherpa ridge',
        to: 'Stuart/Sherpa col',
        cumulativeDistance: 0,
        distance: 879,
        gain: 0,
        loss: 0, //1,
      },
      {
        ...this.descriptionFields,
        from: 'Stuart/Sherpa col',
        to: '02 Sherpa/Argonaut ridge',
        cumulativeDistance: 879,
        distance: 1959,
        gain: 0, //3,
        loss: 0,
      },
      {
        ...this.descriptionFields,
        from: '02 Sherpa/Argonaut ridge',
        to: 'Sherpa/Argonaut col',
        cumulativeDistance: 879 + 1959,
        distance: 1097,
        gain: 0, //7,
        loss: 0,
      },
      {
        ...this.descriptionFields,
        from: 'Sherpa/Argonaut col',
        to: 'End',
        cumulativeDistance: 879 + 1959 + 1097,
        distance: 3492,
        gain: 0, //11,
        loss: 0, //9,
      },
    ];
    const fixtureName = 'two-segments.json'; // https://caltopo.com/m/PLN5
    expectRouteToEqual({ fixtureName, expectedData, done });
  });

  it('handles markers at the start of a segment', function(done) {
    const expectedData = [
      {
        ...this.descriptionFields,
        from: 'Marker at start of line',
        to: 'The line',
        cumulativeDistance: 0,
        distance: 0,
        gain: 0,
        loss: 0,
      },
      {
        ...this.descriptionFields,
        from: 'The line',
        to: 'End',
        cumulativeDistance: 0,
        distance: 1091,
        gain: 0,
        loss: 0, //1,
      },
    ];
    const fixtureName = 'marker-at-start-of-segment.json'; // https://caltopo.com/m/8J5M
    expectRouteToEqual({ fixtureName, expectedData, done });
  });

  it('handles markers at the end of a segment', function(done) {
    const expectedData = [
      {
        ...this.descriptionFields,
        from: 'The line',
        to: 'Marker at end of line',
        cumulativeDistance: 0,
        distance: 1091,
        gain: 0,
        loss: 0, //1,
      },
      {
        ...this.descriptionFields,
        from: 'Marker at end of line',
        to: 'End',
        cumulativeDistance: 1091,
        distance: 0,
        gain: 0,
        loss: 0,
      },
    ];
    const fixtureName = 'marker-at-end-of-segment.json'; // https://caltopo.com/m/8J5M
    expectRouteToEqual({ fixtureName, expectedData, done });
  });

  it('handles markers in the middle of a segment', function(done) {
    const descriptionFields = {
      locomotion: 'cycle',
      surface: 'gravel road',
      users: 'motorized',
    };
    const expectedData = [
      {
        ...descriptionFields,
        description: 'The line description',
        from: 'The line',
        to: 'Getting excited about the summit!',
        cumulativeDistance: 0,
        distance: 665,
        gain: 0, //3,
        loss: 0, //1,
      },
      {
        ...descriptionFields,
        description: '',
        from: 'Getting excited about the summit!',
        to: 'Getting close to the summit!',
        cumulativeDistance: 665,
        distance: 997,
        gain: 0, //7,
        loss: 0, //5,
      },
      {
        ...descriptionFields,
        description: '',
        from: 'Getting close to the summit!',
        to: 'End',
        gain: 0,
        loss: 0, //9,
        cumulativeDistance: 665 + 997,
        distance: 1396,
      },
    ];
    const fixtureName = 'markers-in-middle-of-segment.json';
    expectRouteToEqual({ done, fixtureName, expectedData });
  });
});
