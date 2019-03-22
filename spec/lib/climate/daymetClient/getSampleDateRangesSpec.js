import getSampleDateRanges from '../../../../src/lib/climate/daymetClient/getSampleDateRanges';

function toYyyyMmDd(date) {
  return date.format('YYYY-MM-DD');
}

function getSampleYyyyMmDd(args) {
  const sampleDates = getSampleDateRanges(args);

  return sampleDates.map((sampleDate) => ({
    start: toYyyyMmDd(sampleDate.start),
    end: toYyyyMmDd(sampleDate.end),
  }));
}

describe('climate/sampleDates', () => {
  beforeEach(function() {
    const frozenNow = new Date(978138000000); // 2000/01/01
    jasmine.clock().install();
    jasmine.clock().mockDate(frozenNow);
  });

  afterEach(function() {
    jasmine.clock().uninstall();
  });

  it('handles days in the same month', () => {
    const expected = [
      { start: '1996-01-14', end: '1996-01-16' },
      { start: '1997-01-14', end: '1997-01-16' },
    ];
    const sampleDates = getSampleYyyyMmDd({
      date: '2000-01-15',
      numSampleYears: 2,
      numSampleDays: 3,
    });
    expect(sampleDates).toEqual(expected);
  });

  it('handles days that span a leap year', () => {
    const expected = [
      { start: '1995-12-31', end: '1996-01-02' },
      { start: '1996-12-31', end: '1997-01-02' },
    ];
    const sampleDates = getSampleYyyyMmDd({
      date: '2000-01-01',
      numSampleYears: 2,
      numSampleDays: 3,
    });
    expect(sampleDates).toEqual(expected);
  });

  it('handles start date on Feb 29', () => {
    const expected = [
      { start: '1996-02-29', end: '1996-03-02' }, // leap year
      { start: '1997-02-28', end: '1997-03-02' },
    ];
    const sampleDates = getSampleYyyyMmDd({
      date: '2000-03-01',
      numSampleYears: 2,
      numSampleDays: 3,
    });
    expect(sampleDates).toEqual(expected);
  });
});
