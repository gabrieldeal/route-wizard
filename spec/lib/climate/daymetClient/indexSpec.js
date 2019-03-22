import dayjs from '../../../../src/lib/climate/dayjs';
import Fixtures from './fixtures';
import summaryClient from '../../../../src/lib/climate/daymetClient/index';

describe('climate/index', () => {
  it('summarizes', (done) => {
    const clientImpl = jasmine
      .createSpy()
      .and.returnValues(
        Promise.resolve(Fixtures['2000_01_01'].response.raw),
        Promise.resolve(Fixtures['1999_01_01'].response.raw),
        Promise.resolve(Fixtures['2000_01_01'].response.raw),
        Promise.resolve(Fixtures['1999_01_01'].response.raw),
        Promise.resolve(Fixtures['2000_01_01'].response.raw),
        Promise.resolve(Fixtures['1999_01_01'].response.raw),
        Promise.resolve(Fixtures['2000_01_01'].response.raw),
        Promise.resolve(Fixtures['1999_01_01'].response.raw),
        Promise.resolve(Fixtures['2000_01_01'].response.raw),
        Promise.resolve(Fixtures['1999_01_01'].response.raw)
      );
    const queries = [{ date: dayjs.utc('2000-01-02'), lat: 47, lon: -122 }];
    const response = summaryClient({ clientImpl, queries });

    response
      .then((response) => {
        expect(response).toEqual([Fixtures.summary]);
        done();
      })
      .catch((error) => fail(error));
  });
});
