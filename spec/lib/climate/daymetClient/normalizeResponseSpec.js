import cloneDeep from 'lodash/cloneDeep';
import Fixtures from './fixtures';
import normalizeResponse from '../../../../src/lib/climate/daymetClient/normalizeResponse';

describe('climate/normalizeResponse', () => {
  it('transforms a well-formed response', () => {
    const actual = normalizeResponse(Fixtures['2000_01_01'].response.raw);
    expect(actual).toEqual(Fixtures['2000_01_01'].response.normalized);
  });

  it('warns about unexpected keys', () => {
    const rawResponse = cloneDeep(Fixtures['2000_01_01'].response.raw);
    rawResponse.data.data['unexpected key'] = 1;
    const normalizedResponse = cloneDeep(
      Fixtures['2000_01_01'].response.normalized
    );
    normalizedResponse['unexpected key'] = 1;
    const warnSpy = spyOn(console, 'warn');

    const actual = normalizeResponse(rawResponse);

    expect(actual).toEqual(normalizedResponse);
    expect(warnSpy).toHaveBeenCalledWith(
      "Unexpected Daymet key 'unexpected key'"
    );
  });

  it('throws an exception on unexpected elevation format', () => {
    const rawResponse = cloneDeep(Fixtures['2000_01_01'].response.raw);
    rawResponse.data.Elevation = '100 ft';

    expect(() => normalizeResponse(rawResponse)).toThrowError(
      "Bad elevation format '100 ft'"
    );
  });
});
