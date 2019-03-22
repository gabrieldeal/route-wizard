import dayjs from '../../../../src/lib/climate/dayjs';

export default {
  '2000_01_01': {
    request: [
      47,
      -122,
      'json',
      {
        end: dayjs.utc('2000-01-03').toDate(),
        start: dayjs.utc('2000-01-01').toDate(),
        vars: ['tmin', 'tmax', 'dayl', 'prcp', 'swe'],
      },
    ],
    response: {
      // A real response to the above request (except I added non-zero SWE values):
      raw: {
        data: {
          loc: [47, -122],
          Elevation: '476 m',
          citation:
            'Thornton; P.E.; M.M. Thornton; B.W. Mayer; Y. Wei; R. Devarakonda; R.S. Vose; and R.B. Cook. 2016. Daymet: Daily Surface Weather Data on a 1-km Grid for North America; Version 3. ORNL DAAC; Oak Ridge; Tennessee; USA. http://dx.doi.org/10.3334/ORNLDAAC/1328',
          LCC: [-1580107.11, 686640.75],
          Tile: '12269',
          data: {
            'tmin (deg c)': [0, -0.5, -1.5],
            'prcp (mm/day)': [11, 4, 11],
            'dayl (s)': [30067.19921875, 30412.80078125, 30412.80078125],
            'tmax (deg c)': [4, 3, 3.5],
            year: [2000, 2000, 2000],
            yday: [1, 2, 3],
            'swe (kg/m^2)': [0, 1, 1.1],
          },
        },
      },
      normalized: {
        dayl: [30067.19921875, 30412.80078125, 30412.80078125],
        elevation: 476,
        prcp: [11, 4, 11],
        swe: [0, 1, 1.1],
        tmax: [4, 3, 3.5],
        tmin: [0, -0.5, -1.5],
        yday: [1, 2, 3],
        year: [2000, 2000, 2000],
      },
    },
  },
  '1999_01_01': {
    response: {
      raw: {
        data: {
          loc: [47, -122],
          Elevation: '476 m',
          citation:
            'Thornton; P.E.; M.M. Thornton; B.W. Mayer; Y. Wei; R. Devarakonda; R.S. Vose; and R.B. Cook. 2016. Daymet: Daily Surface Weather Data on a 1-km Grid for North America; Version 3. ORNL DAAC; Oak Ridge; Tennessee; USA. http://dx.doi.org/10.3334/ORNLDAAC/1328',
          LCC: [-1580107.11, 686640.75],
          Tile: '12269',
          data: {
            'tmin (deg c)': [0.5, -2.5, -2],
            'prcp (mm/day)': [0, 9, 0], // I tweaked prcp
            'dayl (s)': [30067.19921875, 30412.80078125, 30412.80078125],
            'tmax (deg c)': [6, 6, 7],
            year: [1999, 1999, 1999],
            yday: [1, 2, 3],
            'swe (kg/m^2)': [0, 0, 0],
          },
        },
      },
    },
  },
  // For 1999-01-01 & 2000-01-01:
  summary: {
    date: dayjs.utc('2000-01-02'),
    dayl: 30412.80078125,
    elevation: 476,
    prcp_avg: 5.833333333333333,
    swe_avg: 0.35,
    swe_max: 1.1,
    swe_min: 0,
    tmax_avg: 4.916666666666667,
    tmax_max: 7,
    tmin_avg: -1.0,
    tmin_min: -2.5,
  },
};
