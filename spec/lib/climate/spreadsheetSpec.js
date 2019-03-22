import * as Spreadsheet from '../../../src/lib/climate/spreadsheet';
import dayjs from '../../../src/lib/climate/dayjs';
import XLSX from 'xlsx';

describe('climate/spreadsheet', () => {
  it('reads a CSV', () => {
    const csv = `lat,Lon,date,foo,bar
47,-122,1996-12-31,FOO,BAR
45,-100,1997-01-05,FFF,BBB
45,-100,2015-06-07,FFF,BBB
`;
    const expectedData = [
      { lat: 47, lon: -122, date: dayjs.utc('1996-12-31') },
      { lat: 45, lon: -100, date: dayjs.utc('1997-01-05') },
      { lat: 45, lon: -100, date: dayjs.utc('2015-06-07') },
    ];

    const { queries } = Spreadsheet.parse({ data: csv, type: 'binary' });
    expect(queries).toEqual(expectedData);
  });

  it('fails if it cannot find the expected columns', function() {
    const csv = 'lat,lon\n47,-122';
    const readingTheSpreadsheet = () =>
      Spreadsheet.parse({ data: csv, type: 'binary' });
    expect(readingTheSpreadsheet).toThrowError("Missing the 'Date' column");
  });

  it('returns no rows on malformed spreadsheets', function() {
    const csv = '\0\0\0';
    const data = Spreadsheet.parse({ data: csv, type: 'binary' });
    expect(data).toEqual({ errorMessage: 'Unable to parse spreadsheet' });
  });
});
