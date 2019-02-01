import reverseGeoJson from '../../src/lib/reverseGeoJson';

describe('reverseGeoJson', () => {
  it('reverses the lines and the coordinates in them', () => {
    const geoJson = {
      type: 'FeatureCollection',
      features: [
        {
          type: 'Feature',
          id: 'eb91dc8b-74ed-49dc-93ba-9022eb26bf7c',
          geometry: null,
          properties: {
            title: 'G&L',
            class: 'Folder',
            updated: 1548998806000,
          },
        },
        {
          type: 'Feature',
          id: '9fc25057-7c95-48ff-befc-35ef545a1cd7',
          geometry: {
            type: 'Point',
            coordinates: [-120.89600000000002, 47.4676, 2305.487999999525, 0],
          },
        },
        {
          type: 'Feature',
          id: '11111111-1111-1111-1111-111111111111',
          geometry: {
            type: 'LineString',
            coordinates: [
              [1, 11, 1469.4077573091863],
              [2, 12, 1784.5259583566087],
              [3, 13, 2325.3906931670112],
              [4, 14, 2801.744487740138],
              [5, 15, 2552.2917317437214],
              [6, 16, 1775.6988446922928],
            ],
          },
          properties: {
            title: 'Line 1',
          },
        },
        {
          type: 'Feature',
          id: '22222222-2222-2222-2222-222222222222',
          geometry: {
            type: 'LineString',
            coordinates: [
              [100, 10, 1469.4077573091863],
              [101, 11, 1784.5259583566087],
              [102, 12, 2325.3906931670112],
              [103, 13],
              [104, 14, 2552.2917317437214],
              [105, 15, 1775.6988446922928],
            ],
          },
          properties: {
            title: 'Line 2',
          },
        },
      ],
    };
    const expectedReversedGeoJson = {
      type: 'FeatureCollection',
      features: [
        {
          type: 'Feature',
          id: '22222222-2222-2222-2222-222222222222',
          geometry: {
            type: 'LineString',
            coordinates: [
              [105, 15, 1775.6988446922928],
              [104, 14, 2552.2917317437214],
              [103, 13],
              [102, 12, 2325.3906931670112],
              [101, 11, 1784.5259583566087],
              [100, 10, 1469.4077573091863],
            ],
          },
          properties: {
            title: 'Line 2',
          },
        },
        {
          type: 'Feature',
          id: '11111111-1111-1111-1111-111111111111',
          geometry: {
            type: 'LineString',
            coordinates: [
              [6, 16, 1775.6988446922928],
              [5, 15, 2552.2917317437214],
              [4, 14, 2801.744487740138],
              [3, 13, 2325.3906931670112],
              [2, 12, 1784.5259583566087],
              [1, 11, 1469.4077573091863],
            ],
          },
          properties: {
            title: 'Line 1',
          },
        },
        {
          type: 'Feature',
          id: '9fc25057-7c95-48ff-befc-35ef545a1cd7',
          geometry: {
            type: 'Point',
            coordinates: [-120.89600000000002, 47.4676, 2305.487999999525, 0],
          },
        },
        {
          type: 'Feature',
          id: 'eb91dc8b-74ed-49dc-93ba-9022eb26bf7c',
          geometry: null,
          properties: {
            title: 'G&L',
            class: 'Folder',
            updated: 1548998806000,
          },
        },
      ],
    };

    const actualReversedGeoJson = reverseGeoJson(geoJson);

    expect(actualReversedGeoJson).toEqual(expectedReversedGeoJson);
  });
});
