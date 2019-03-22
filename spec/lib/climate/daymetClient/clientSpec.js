import client from '../../../../src/lib/climate/daymetClient/client';
import dayjs from '../../../../src/lib/climate/dayjs';
import Fixtures from './fixtures';

describe('climate/client', () => {
  it('does not totally fail', (done) => {
    const clientImpl = jasmine
      .createSpy()
      .and.returnValue(Promise.resolve(Fixtures['2000_01_01'].response.raw));

    const response = client({
      clientImpl,
      start: dayjs.utc('2000-01-01'),
      end: dayjs.utc('2000-01-03'),
      lat: 47,
      lon: -122,
    });
    response.then((response) => {
      expect(response).toEqual(Fixtures['2000_01_01'].response.raw);
      expect(clientImpl).toHaveBeenCalledWith(
        ...Fixtures['2000_01_01'].request
      );
      done();
    });
  });
});
