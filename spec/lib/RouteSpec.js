import fetchMock from 'fetch-mock';

import Route from '../../src/lib/Route';

describe('Route', function() {
  beforeEach(function() {
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

  function expectRouteToEqual({ fixtureName, expectedData }) {
    const route = createRoute(fixtureName);

    expect(route.data()).toEqual(expectedData);
  }

  it('handles multiple segments & markers', function() {
    const expectedData = [
      {
        ...this.descriptionFields,
        location: 'Start',
        cumulativeDistance: 0,
        distance: null,
        gain: null,
        loss: null,
      },
      {
        ...this.descriptionFields,
        location: 'Stuart/Sherpa col',
        cumulativeDistance: 879,
        distance: 879,
        gain: 0,
        loss: 0, //1,
      },
      {
        ...this.descriptionFields,
        location: '02 Sherpa/Argonaut ridge',
        cumulativeDistance: 879 + 1959,
        distance: 1959,
        gain: 0,
        loss: 261.1142065917488,
      },
      {
        ...this.descriptionFields,
        location: 'Sherpa/Argonaut col',
        cumulativeDistance: 879 + 1959 + 1097,
        distance: 1097,
        gain: 0, //7,
        loss: 0,
      },
      {
        location: 'End',
        cumulativeDistance: 879 + 1959 + 1097 + 3492,
        distance: 3492,
        gain: 342.59821906724346,
        loss: 434.0569564411212,
        description: null,
        locomotion: null,
        surface: null,
        users: null,
      },
    ];
    const fixtureName = 'two-segments.json'; // https://caltopo.com/m/PLN5
    expectRouteToEqual({ fixtureName, expectedData });
  });

  it('handles markers at the start of a segment', function() {
    const expectedData = [
      {
        ...this.descriptionFields,
        location: 'Start', // This replaces "Marker at start of line".
        cumulativeDistance: 0,
        distance: null,
        gain: null,
        loss: null,
      },
      {
        ...this.descriptionFields,
        location: 'The line',
        cumulativeDistance: 0,
        distance: 0,
        gain: 0,
        loss: 0,
      },
      {
        ...this.descriptionFields,
        location: 'End',
        cumulativeDistance: 1091,
        distance: 1091,
        gain: 0,
        loss: 248.10845307847285,
        description: null,
        locomotion: null,
        surface: null,
        users: null,
      },
    ];
    const fixtureName = 'marker-at-start-of-segment.json'; // https://caltopo.com/m/8J5M
    expectRouteToEqual({ fixtureName, expectedData });
  });

  it('handles markers at the end of a segment', function() {
    const expectedData = [
      {
        ...this.descriptionFields,
        location: 'Start',
        cumulativeDistance: 0,
        distance: null,
        gain: null,
        loss: null,
      },
      {
        ...this.descriptionFields,
        location: 'Marker at end of line',
        cumulativeDistance: 1091,
        distance: 1091,
        gain: 0,
        loss: 248.10845307847285,
      },
      {
        ...this.descriptionFields,
        description: null,
        location: 'End',
        cumulativeDistance: 1091,
        distance: 0,
        gain: 0,
        loss: 0,
        locomotion: null,
        surface: null,
        users: null,
      },
    ];
    const fixtureName = 'marker-at-end-of-segment.json'; // https://caltopo.com/m/8J5M
    expectRouteToEqual({ fixtureName, expectedData });
  });

  it('handles markers in the middle of a segment', function() {
    const descriptionFields = {
      locomotion: 'cycle',
      surface: 'gravel road',
      users: 'motorized',
    };
    const expectedData = [
      {
        ...descriptionFields,
        description: 'The line description',
        location: 'Start',
        cumulativeDistance: 0,
        distance: null,
        gain: null,
        loss: null,
      },
      {
        ...descriptionFields,
        description: '',
        location: 'Getting excited about the summit!',
        cumulativeDistance: 665,
        distance: 665,
        gain: 269.25798601420615,
        loss: 0,
      },
      {
        ...descriptionFields,
        description: '',
        location: 'Getting close to the summit!',
        cumulativeDistance: 665 + 997,
        distance: 997,
        gain: 425.9778273414306,
        loss: 0,
      },
      {
        ...descriptionFields,
        description: null,
        location: 'End',
        gain: 630.048621330563,
        loss: 0,
        cumulativeDistance: 665 + 997 + 1396,
        distance: 1396,
        locomotion: null,
        surface: null,
        users: null,
      },
    ];
    const fixtureName = 'markers-in-middle-of-segment.json';
    expectRouteToEqual({ fixtureName, expectedData });
  });
});
