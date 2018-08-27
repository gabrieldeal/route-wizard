import fetchMock from 'fetch-mock';

import getElevation from '../../src/lib/getElevation';
import mockElevationService from '../support/mockElevationService';

describe('getElevation', () => {
  beforeEach(mockElevationService);
  afterEach(function() {
    fetchMock.restore();
  });

  it('calculate gain & loss', (done) => {
    // https://caltopo.com/m/850B
    const markers = [
      { latitude: 47.45435545649966, longitude: -120.89595794677734 },
      { latitude: 47.459868660320694, longitude: -120.89587211608887 },
      { latitude: 47.467818262663286, longitude: -120.8979320526123 },
      { latitude: 47.475070500652556, longitude: -120.90145111083984 },
      { latitude: 47.47704293626134, longitude: -120.89921951293945 },
      { latitude: 47.4828437883422, longitude: -120.88934898376465 },
    ];

    getElevation(markers)
      .then(({ gain, loss }) => {
        expect(gain).toEqual(10);
        expect(loss).toEqual(15);
        done();
      })
      .catch((status) => {
        fail(status);
      });
  });
});
