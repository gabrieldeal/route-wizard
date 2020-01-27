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
        cumulativeDistance: 0,
        distance: 0.5,
        gain: 0,
        lat: 47.47511401111552,
        lon: -120.90226650303521,
        loss: 0,
      },
      {
        ...this.descriptionFields,
        from: 'Stuart/Sherpa col',
        to: '02 Sherpa/Argonaut ridge',
        cumulativeDistance: 0.5,
        distance: 1.2,
        gain: 0,
        lat: 47.47249217509707,
        lon: -120.89125895263321,
        loss: 857,
      },
      {
        ...this.descriptionFields,
        from: '02 Sherpa/Argonaut ridge',
        to: 'Sherpa/Argonaut col',
        cumulativeDistance: 0.5 + 1.2 + 0.1,
        distance: 0.7,
        gain: 0,
        lat: 47.471749099922384,
        lon: -120.88853359287896,
        loss: 0,
      },
      {
        ...this.descriptionFields,
        from: 'Sherpa/Argonaut col',
        to: 'The End',
        cumulativeDistance: 0.5 + 1.2 + 0.7,
        distance: 2.2,
        gain: 1124,
        lat: 47.46578617091729,
        lon: -120.87694687259508,
        loss: 1424,
      },
      {
        cumulativeDistance: 0.5 + 1.2 + 0.7 + 2.2,
        description: '',
        from: 'The End',
        lat: 47.4702116118904,
        lon: -120.86119651859917,
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
        cumulativeDistance: 0,
        distance: 0.7,
        gain: 0,
        lat: 47.47524454206689,
        lon: -120.90248107910156,
        loss: 814,
      },
      {
        cumulativeDistance: 0.7,
        description: '',
        from: 'The End',
        lat: 47.47182162177658,
        lon: -120.88891983032227,
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
        cumulativeDistance: 0,
        distance: 0.7,
        gain: 0,
        lat: 47.47524454206689,
        lon: -120.90248107910156,
        loss: 814,
      },
      {
        cumulativeDistance: 0.7,
        description: '',
        from: 'The End',
        lat: 47.47182162177658,
        lon: -120.88891983032227,
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
        cumulativeDistance: 0,
        distance: 0.7,
        gain: 0,
        lat: 47.47524454206689,
        lon: -120.90248107910156,
        loss: 814,
      },
      {
        description: 'Marker description',
        cumulativeDistance: 0.7,
        from: 'Marker at end of line',
        lat: 47.47182162177658,
        lon: -120.88891983032227,
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
        cumulativeDistance: 0,
        distance: 0.7,
        gain: 0,
        lat: 47.47524454206689,
        lon: -120.90248107910156,
        loss: 814,
      },
      {
        cumulativeDistance: 0.7,
        description: 'Point description',
        from: 'The End',
        lat: 47.47182162177658,
        lon: -120.88891983032227,
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
        cumulativeDistance: 0,
        distance: 0.4,
        gain: 883,
        lat: 47.454239382837734,
        lon: -120.89638710021973,

        loss: 0,
      },
      {
        ...descriptionFields,
        description: '',
        from: 'Getting excited about the summit!',
        to: 'Getting close to the summit!',
        cumulativeDistance: 0.4,
        distance: 0.6,
        gain: 1398,
        lat: 47.45999645438458,
        lon: -120.89428157550041,

        loss: 0,
      },
      {
        ...descriptionFields,
        description: '',
        from: 'Getting close to the summit!',
        to: 'The End',
        gain: 2067,
        loss: 0,
        cumulativeDistance: 0.4 + 0.6,
        distance: 0.9,
        lat: 47.467343305600814,
        lon: -120.8964048750426,
      },
      {
        cumulativeDistance: 0.4 + 0.6 + 0.9,
        description: '',
        from: 'The End',
        lat: 47.47530255574356,
        lon: -120.90145111083984,
      },
    ];
    const fixtureName = 'markers-in-middle-of-segment.json';
    expectRouteToEqual({ fixtureName, expectedRows });
  });
});
