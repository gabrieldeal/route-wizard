import { calculateElevationStatistics } from '../../src/lib/getElevationStatistics';

describe('calculateElevationStatistics', () => {
  it('no elevations', () => {
    const elevations = [];
    const stats = calculateElevationStatistics(elevations);
    expect(stats).toEqual({ gain: undefined, loss: undefined });
  });

  it('one elevation', () => {
    const elevations = [10];
    const stats = calculateElevationStatistics(elevations);
    expect(stats).toEqual({ gain: undefined, loss: undefined });
  });

  it('up & down', () => {
    const elevations = [0, 10, 20, 10];
    const stats = calculateElevationStatistics(elevations);
    expect(stats).toEqual({ gain: 20, loss: 10 });
  });
});
