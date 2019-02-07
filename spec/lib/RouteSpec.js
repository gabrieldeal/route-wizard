import fetchMock from 'fetch-mock';

import createSegments from '../../src/lib/createSegments';
import createSpreadsheet from '../../src/lib/createSpreadsheet';

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
    const segments = createSegments(geoJson);
    const { rows, _columns } = createSpreadsheet(segments);
    // FIXME: add expectation on the columns.

    expect(rows).toEqual(expectedRows);
  }

  it('handles multiple segments & markers', function() {
    const expectedRows = [
      {
        ...this.descriptionFields,
        from: '01 Stuart/Sherpa ridge',
        to: 'Stuart/Sherpa col',
        cumulativeDistance: 0.5,
        distance: 0.5,
        gain: 0,
        loss: 0,
      },
      {
        ...this.descriptionFields,
        from: 'Stuart/Sherpa col',
        to: '02 Sherpa/Argonaut ridge',
        cumulativeDistance: 0.5 + 1.2 + 0.1,
        distance: 1.2,
        gain: 0,
        loss: 857,
      },
      {
        ...this.descriptionFields,
        from: '02 Sherpa/Argonaut ridge',
        to: 'Sherpa/Argonaut col',
        cumulativeDistance: 0.5 + 1.2 + 0.7,
        distance: 0.7,
        gain: 0,
        loss: 0,
      },
      {
        ...this.descriptionFields,
        from: 'Sherpa/Argonaut col',
        to: 'The End',
        cumulativeDistance: 0.5 + 1.2 + 0.7 + 2.2,
        distance: 2.2,
        gain: 1124,
        loss: 1424,
      },
    ];
    const fixtureName = 'two-segments.json'; // https://caltopo.com/m/PLN5
    expectRouteToEqual({ fixtureName, expectedRows });
  });

  it('handles a marker with a title at the start of a segment', function() {
    const expectedRows = [
      {
        ...this.descriptionFields,
        description: 'Marker description\nSegment description',
        from: 'Marker at start of line',
        to: 'The End',
        cumulativeDistance: 0.7,
        distance: 0.7,
        gain: 0,
        loss: 814,
      },
    ];
    const fixtureName = 'marker-at-start-of-segment.json'; // https://caltopo.com/m/8J5M
    expectRouteToEqual({ fixtureName, expectedRows });
  });

  it('handles a marker without a title at the start of a segment', function() {
    const expectedRows = [
      {
        ...this.descriptionFields,
        description: 'Marker description\nSegment description',
        from: 'The line',
        to: 'The End',
        cumulativeDistance: 0.7,
        distance: 0.7,
        gain: 0,
        loss: 814,
      },
    ];
    const fixtureName = 'untitled-marker-at-start-of-segment.json';
    expectRouteToEqual({ fixtureName, expectedRows });
  });

  it('handles a marker with a title at the end of a segment', function() {
    const expectedRows = [
      {
        ...this.descriptionFields,
        description: 'Line description',
        from: 'The line',
        to: 'Marker at end of line',
        cumulativeDistance: 0.7,
        distance: 0.7,
        gain: 0,
        loss: 814,
      },
    ];
    const fixtureName = 'marker-at-end-of-segment.json'; // https://caltopo.com/m/8J5M
    expectRouteToEqual({ fixtureName, expectedRows });
  });

  it('handles a marker without a title at the end of a segment', function() {
    const expectedRows = [
      {
        ...this.descriptionFields,
        description: 'Line description',
        from: 'The line',
        to: 'The End',
        cumulativeDistance: 0.7,
        distance: 0.7,
        gain: 0,
        loss: 814,
      },
    ];
    const fixtureName = 'untitled-marker-at-end-of-segment.json';
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
        from: 'The line',
        to: 'Getting excited about the summit!',
        cumulativeDistance: 0.4,
        distance: 0.4,
        gain: 883,
        loss: 0,
      },
      {
        ...descriptionFields,
        description: '',
        from: 'Getting excited about the summit!',
        to: 'Getting close to the summit!',
        cumulativeDistance: 0.4 + 0.6,
        distance: 0.6,
        gain: 1398,
        loss: 0,
      },
      {
        ...descriptionFields,
        description: '',
        from: 'Getting close to the summit!',
        to: 'The End',
        gain: 2067,
        loss: 0,
        cumulativeDistance: 0.4 + 0.6 + 0.9,
        distance: 0.9,
      },
    ];
    const fixtureName = 'markers-in-middle-of-segment.json';
    expectRouteToEqual({ fixtureName, expectedRows });
  });
});
