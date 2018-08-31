import fetchMock from 'fetch-mock';

import createSpreadsheet from '../../src/lib/createSpreadsheetRows';
import parseGeoJson from '../../src/lib/parseGeoJson';

const ALL_COLUMNS = [
  {
    key: 'cumulativeDistance',
    name: 'Cumulative distance (mi)',
  },
  { key: 'location', name: 'Location' },
  { key: 'distance', name: 'Distance (mi)' },
  { key: 'gain', name: 'Elevation gain (feet)' },
  { key: 'loss', name: 'Elevation loss (feet)' },
  { key: 'description', name: 'Notes' },
  { key: 'users', name: 'Users' },
  { key: 'surface', name: 'Surface' },
  { key: 'locomotion', name: 'Locomotion' },
];

// FIXME: Split this spec up now that the Route class has been split up.
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

  function expectRouteToEqual({ fixtureName, expectedRows }) {
    const geoJson = readJSON(`./spec/fixture/${fixtureName}`);
    const segments = parseGeoJson(JSON.stringify(geoJson));
    const { rows, _columns } = createSpreadsheet(segments, ALL_COLUMNS);
    // FIXME: add expectation on the columns.

    expect(rows).toEqual(expectedRows);
  }

  it('handles multiple segments & markers', function() {
    const expectedRows = [
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
        cumulativeDistance: 0.5,
        distance: 0.5,
        gain: 0,
        loss: 0,
      },
      {
        ...this.descriptionFields,
        location: '02 Sherpa/Argonaut ridge',
        cumulativeDistance: 0.5 + 1.2 + 0.1,
        distance: 1.2,
        gain: 0,
        loss: 857,
      },
      {
        ...this.descriptionFields,
        location: 'Sherpa/Argonaut col',
        cumulativeDistance: 0.5 + 1.2 + 0.7,
        distance: 0.7,
        gain: 0,
        loss: 0,
      },
      {
        location: 'End',
        cumulativeDistance: 0.5 + 1.2 + 0.7 + 2.2,
        distance: 2.2,
        gain: 1124,
        loss: 1424,
        description: null,
        locomotion: null,
        surface: null,
        users: null,
      },
    ];
    const fixtureName = 'two-segments.json'; // https://caltopo.com/m/PLN5
    expectRouteToEqual({ fixtureName, expectedRows });
  });

  it('handles markers at the start of a segment', function() {
    const expectedRows = [
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
        cumulativeDistance: 0.7,
        distance: 0.7,
        gain: 0,
        loss: 814,
        description: null,
        locomotion: null,
        surface: null,
        users: null,
      },
    ];
    const fixtureName = 'marker-at-start-of-segment.json'; // https://caltopo.com/m/8J5M
    expectRouteToEqual({ fixtureName, expectedRows });
  });

  it('handles markers at the end of a segment', function() {
    const expectedRows = [
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
        cumulativeDistance: 0.7,
        distance: 0.7,
        gain: 0,
        loss: 814,
      },
      {
        ...this.descriptionFields,
        description: null,
        location: 'End',
        cumulativeDistance: 0.7,
        distance: 0,
        gain: 0,
        loss: 0,
        locomotion: null,
        surface: null,
        users: null,
      },
    ];
    const fixtureName = 'marker-at-end-of-segment.json'; // https://caltopo.com/m/8J5M
    expectRouteToEqual({ fixtureName, expectedRows });
  });

  it('handles markers in the middle of a segment', function() {
    const descriptionFields = {
      locomotion: 'cycle',
      surface: 'gravel road',
      users: 'motorized',
    };
    const expectedRows = [
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
        cumulativeDistance: 0.4,
        distance: 0.4,
        gain: 883,
        loss: 0,
      },
      {
        ...descriptionFields,
        description: '',
        location: 'Getting close to the summit!',
        cumulativeDistance: 0.4 + 0.6,
        distance: 0.6,
        gain: 1398,
        loss: 0,
      },
      {
        ...descriptionFields,
        description: null,
        location: 'End',
        gain: 2067,
        loss: 0,
        cumulativeDistance: 0.4 + 0.6 + 0.9,
        distance: 0.9,
        locomotion: null,
        surface: null,
        users: null,
      },
    ];
    const fixtureName = 'markers-in-middle-of-segment.json';
    expectRouteToEqual({ fixtureName, expectedRows });
  });
});
